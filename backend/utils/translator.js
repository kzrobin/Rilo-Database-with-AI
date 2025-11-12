// utils/translator.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/* ---------------- Small-talk + safety heuristics ---------------- */

const SMALLTALK = [
  /^(hi|hello|hey|yo)\b/i,
  /\bhow are you\b/i,
  /\bthank(s| you)\b/i,
  /\bwho (are|r) you\b/i,
  /\bwhat can you do\b/i,
];

function isSmalltalk(q) {
  if (!q) return false;
  const s = q.trim().toLowerCase();
  return SMALLTALK.some((re) => re.test(s));
}

function smalltalkReply(q) {
  const s = q.trim().toLowerCase();
  if (/how are you/.test(s)) return "I'm doing great—ready to help you browse your shop data 😊";
  if (/thank/.test(s)) return "You're welcome! Need anything else?";
  if (/who (are|r) you/.test(s)) return "I'm your store assistant. Ask me about products, orders, carts, fabrics, or reviews.";
  if (/what can you do/.test(s))
    return "I can search products (e.g., by color/material/price/stock), summarize orders, counts, averages, and more.";
  return "Hi! 👋 Ask me about products, orders, fabrics, carts, reviews—or just say what you’re looking for.";
}

const DESTRUCTIVE = [
  /drop\b/i,
  /\btruncate\b/i,
  /\bdelete(?!.*(my|this|specific))/i,
  /\bremove all\b/i,
  /\bupdate all\b/i,
  /\bset .* for all\b/i,
  /\binsert\b/i,
  /\bcreate\b/i,
  /\bwrite\b/i,
];

function looksDestructive(q) {
  if (!q) return false;
  return DESTRUCTIVE.some((re) => re.test(q));
}

/* ---------------- LLM planner with retries + local fallback ---------------- */

const FINAL_DATABASE_SCHEMA = `
MongoDB collections (lowercase plural):
- users:        {_id:ObjectId, fullname:String, username:String, email:String, role:String}
- fabrics:      {_id:ObjectId, fabric_name:String, material:String, color:String}
- products:     {_id:ObjectId, product_name:String, description:String, price:Number, stock_quantity:Number, fabric_id:ObjectId}
- carts:        {_id:ObjectId, user_id:ObjectId, items:[{product_id:ObjectId, quantity:Number}]}
- orders:       {_id:ObjectId, user_id:ObjectId, orderItems:[{product_id:ObjectId, quantity:Number, price_at_purchase:Number}], total_amount:Number, status:String, order_date:Date}
- reviews:      {_id:ObjectId, order_item_id:ObjectId, rating:Number, comment:String, review_date:Date}
`;

const PROMPT_TEMPLATE = `
You are a MongoDB data analyst. Produce a **single** read-only MongoDB Shell query string.

SCHEMA:
---
{schema}
---

USER QUESTION:
"{user_question}"

PRIMARY RULE:
- If the question is conversational/off-topic and cannot be answered with DB data, respond ONLY: OFFTOPIC.

SECURITY RULES:
- **READ-ONLY** only: use exactly one of: db.<collection>.find(...), db.<collection>.countDocuments(...), or db.<collection>.aggregate([...])
- NEVER use update/delete/insert/create/save/bulkWrite/runCommand or any write-capable operator. If user asks, respond ONLY: FORBIDDEN.

OUTPUT RULES:
1) Return the raw query **string only** (no backticks, no markdown, no JSON).
2) Use **aggregate** for joins/sorting/limiting or multi-step logic. Prefer {$lookup} + {$unwind} when referencing fields from another collection.
3) If filtering by ObjectId, use ObjectId("...") in the query. Dates can be simple Date() where appropriate.
4) Include {$project:{}} to keep outputs concise for general queries.
5) Never chain cursor methods; everything must be inside the single method call.

EXAMPLES (patterns):
- Red cotton kurtis under 1500 in stock:
db.products.aggregate([
  {$lookup:{from:"fabrics", localField:"fabric_id", foreignField:"_id", as:"fabric_details"}},
  {$unwind:"$fabric_details"},
  {$match:{
    product_name:{$regex:"kurti",$options:"i"},
    price:{$lt:1500},
    stock_quantity:{$gt:0},
    "fabric_details.color":{$regex:"red",$options:"i"},
    "fabric_details.material":{$regex:"cotton",$options:"i"}
  }},
  {$project:{_id:0, product_name:1, price:1, stock_quantity:1, color:"$fabric_details.color", material:"$fabric_details.material"}},
  {$limit:20}
])

- How many orders today:
db.orders.aggregate([
  {$match:{ order_date: { $gte: new Date(new Date().setHours(0,0,0,0)), $lt: new Date(new Date().setHours(23,59,59,999)) }}},
  {$count:"count"}
])

Return ONLY the query string or OFFTOPIC/FORBIDDEN.
`;

// retry/backoff across multiple models
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const MODEL_PREFERENCE = [
  process.env.PLANNER_MODEL,           // your chosen model first
  'gemini-2.0-flash',                  // fast fallback
  'gemini-1.5-flash',                  // older fast
  'gemini-1.5-pro',                    // older pro
].filter(Boolean);

async function callWithRetries(prompt) {
  const transient = (msg) =>
    /429|503|overload|temporarily|unavailable/i.test(msg || '');

  let lastErr;
  for (const modelName of MODEL_PREFERENCE) {
    const model = genAI.getGenerativeModel({ model: modelName });

    // exponential backoff attempts per model
    const attempts = 4;
    for (let i = 0; i < attempts; i++) {
      try {
        const result = await model.generateContent({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0 },
        });
        let text = result?.response?.text?.() ?? '';
        if (!text) throw new Error('Empty response from model.');

        // scrub any accidental code fences/markdown
        text = text.replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '')).trim();
        return { text, modelName };
      } catch (e) {
        lastErr = e;
        const msg = String(e?.message || e);
        if (i < attempts - 1 && transient(msg)) {
          const delay = 250 * Math.pow(2, i); // 250ms, 500ms, 1000ms, 2000ms
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        break; // non-transient or exhausted attempts for this model → try next model
      }
    }
  }
  throw lastErr || new Error('Planner unavailable');
}

// very small heuristic fallback for common product queries
function localHeuristicFallback(question) {
  const q = (question || '').toLowerCase();

  // detect category-ish tokens → product_name regex
  const categories = ['kurti', 'shirt', 'saree', 'panjabi', 'tshirt', 't-shirt', 'jeans', 'kameez', 'tops', 'dress'];
  const pickedCats = categories.filter((c) => q.includes(c));
  const nameRegex = pickedCats[0] || null;

  // detect color/material words
  const colors = ['red','blue','green','black','white','maroon','navy','pink','yellow','purple','brown','grey','gray','beige','teal','orange'];
  const materials = ['cotton','linen','silk','wool','polyester','rayon','chiffon'];
  const pickedColor = colors.find((c) => q.includes(c));
  const pickedMaterial = materials.find((m) => q.includes(m));

  // in-stock
  const inStock = /\b(in\s*stock|available|stock)\b/i.test(q);

  // price
  let priceMatchLt = /under\s+(\d+)|below\s+(\d+)|less(?:\s*than)?\s+(\d+)/i.exec(q);
  let priceMatchLte = /upto\s+(\d+)|up\s*to\s+(\d+)/i.exec(q);
  let priceMatchBetween = /between\s+(\d+)\s+(?:and|-|to)\s+(\d+)/i.exec(q);
  let priceFilter = null;

  if (priceMatchBetween) {
    const a = parseInt(priceMatchBetween[1], 10);
    const b = parseInt(priceMatchBetween[2], 10);
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      priceFilter = { $gte: Math.min(a, b), $lte: Math.max(a, b) };
    }
  } else if (priceMatchLt) {
    const n = [priceMatchLt[1], priceMatchLt[2], priceMatchLt[3]].find(Boolean);
    const v = parseInt(n, 10);
    if (!Number.isNaN(v)) priceFilter = { $lt: v };
  } else if (priceMatchLte) {
    const n = [priceMatchLte[1], priceMatchLte[2]].find(Boolean);
    const v = parseInt(n, 10);
    if (!Number.isNaN(v)) priceFilter = { $lte: v };
  }

  // Build aggregate if color/material present; else a simple find is OK
  const match = {};
  if (nameRegex) match.product_name = { $regex: nameRegex, $options: 'i' };
  if (priceFilter) match.price = priceFilter;
  if (inStock) match.stock_quantity = { $gt: 0 };

  // If color/material present, join fabrics and filter in pipeline
  if (pickedColor || pickedMaterial) {
    const fabricMatch = {};
    if (pickedColor) fabricMatch['fabric_details.color'] = { $regex: pickedColor, $options: 'i' };
    if (pickedMaterial) fabricMatch['fabric_details.material'] = { $regex: pickedMaterial, $options: 'i' };

    const pipeline = [
      { $lookup: { from: 'fabrics', localField: 'fabric_id', foreignField: '_id', as: 'fabric_details' } },
      { $unwind: '$fabric_details' },
    ];
    if (Object.keys(match).length) pipeline.push({ $match: match });
    if (Object.keys(fabricMatch).length) pipeline.push({ $match: fabricMatch });
    pipeline.push({
      $project: {
        _id: 0,
        product_name: 1,
        price: 1,
        stock_quantity: 1,
        color: '$fabric_details.color',
        material: '$fabric_details.material',
      },
    });
    pipeline.push({ $limit: 20 });

    return {
      query: `db.products.aggregate(${JSON.stringify(pipeline)})`,
      planner_source: 'fallback',
    };
  }

  // Simple find fallback
  const proj = { _id: 0, product_name: 1, price: 1, stock_quantity: 1, fabric_id: 1 };
  const findArgs = [match, proj];
  return {
    query: `db.products.find(${JSON.stringify(findArgs[0])}, ${JSON.stringify(findArgs[1])})`,
    planner_source: 'fallback',
  };
}

async function convertNaturalLanguageToQuery(userQuestion) {
  // Conversational/offtopic quickly short-circuits at controller using isSmalltalk(),
  // but keep LLM’s OFFTOPIC/FORBIDDEN return paths too.
  const prompt = PROMPT_TEMPLATE
    .replace('{schema}', FINAL_DATABASE_SCHEMA)
    .replace('{user_question}', userQuestion);

  try {
    const { text, modelName } = await callWithRetries(prompt);

    const upper = text.trim().toUpperCase();
    if (upper === 'OFFTOPIC' || upper === 'FORBIDDEN') {
      return { query: upper, planner_source: 'llm' };
    }

    return { query: text, planner_source: 'llm' };
  } catch (e) {
    // Transient/overload → use local heuristic fallback so the app keeps working
    const fb = localHeuristicFallback(userQuestion);
    return fb; // { query, planner_source:'fallback' }
  }
}

/* ---------------- Generalized humanizer (analytics-aware) ---------------- */

// tiny format helpers
const fmtMoney = (n) => (typeof n === 'number' ? `৳${n.toLocaleString('en-US')}` : n);
const fmtNum = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : n);
const fmtDate = (d) => {
  try {
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(+dt)) return d;
    return dt.toLocaleString('en-GB', { hour12: false });
  } catch {
    return d;
  }
};
const plural = (n, s) => `${n} ${s}${n === 1 ? '' : 's'}`;

function isScalarCount(r) {
  if (typeof r === 'number') return true;
  if (Array.isArray(r) && r.length === 1 && typeof r[0] === 'number') return true;
  const obj = Array.isArray(r) ? r[0] : r;
  if (!obj || typeof obj !== 'object') return false;
  const v = obj.count ?? obj.total ?? obj.value;
  return typeof v === 'number';
}
function readScalarCount(r) {
  if (typeof r === 'number') return r;
  if (Array.isArray(r) && r.length === 1 && typeof r[0] === 'number') return r[0];
  const obj = Array.isArray(r) ? r[0] : r;
  return obj.count ?? obj.total ?? obj.value ?? 0;
}
function isGroupedAggregate(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  const a = arr[0];
  return a && typeof a === 'object' && '_id' in a && typeof (a.value ?? a.total ?? a.count ?? a.sum ?? a.avg) !== 'undefined';
}
function readGroupValue(o) {
  return o.value ?? o.total ?? o.count ?? o.sum ?? o.avg ?? o.min ?? o.max;
}
function inferEntity(question) {
  const q = (question || '').toLowerCase();
  if (q.includes('product')) return 'product';
  if (q.includes('order')) return 'order';
  if (q.includes('review')) return 'review';
  if (q.includes('user')) return 'user';
  if (q.includes('fabric') || q.includes('material')) return 'fabric';
  return 'item';
}
function prettyLine(it) {
  const main =
    it.product_name ||
    it.fabric_name ||
    it.fullname ||
    it.username ||
    it.email ||
    it.order_id ||
    it._id ||
    'Unnamed';

  const extras = [];
  if ('price' in it) extras.push(fmtMoney(it.price));
  if ('stock_quantity' in it) extras.push(`Stock: ${fmtNum(it.stock_quantity)}`);
  if ('color' in it) extras.push(`Color: ${it.color}`);
  if ('material' in it) extras.push(`Material: ${it.material}`);
  if ('status' in it) extras.push(`Status: ${it.status}`);
  if ('total_amount' in it) extras.push(`Total ${fmtMoney(it.total_amount)}`);
  if ('order_date' in it) extras.push(`Date: ${fmtDate(it.order_date)}`);

  return `• ${main}${extras.length ? ' — ' + extras.join(', ') : ''}`;
}

function toHumanAnswer(question, queryTextOrPlan, rawResult) {
  if (rawResult == null) return 'I couldn’t find anything for that request.';

  // Scalar metrics
  if (isScalarCount(rawResult)) {
    const n = readScalarCount(rawResult);
    const q = (question || '').toLowerCase();

    if (q.includes('how many') || q.includes('count')) {
      return n === 0 ? 'There are no matching records.' : `There are ${fmtNum(n)} matching record(s).`;
    }
    if (q.includes('average') || q.includes('avg') || /avg|mean/i.test(q)) return `The average value is ${fmtNum(n)}.`;
    if (q.includes('sum') || q.includes('total')) return `The total is ${fmtNum(n)}.`;
    if (q.includes('min')) return `The minimum is ${fmtNum(n)}.`;
    if (q.includes('max')) return `The maximum is ${fmtNum(n)}.`;

    return n === 0 ? 'No results.' : `Result: ${fmtNum(n)}.`;
  }

  const arr = Array.isArray(rawResult) ? rawResult : [rawResult];

  // Grouped summaries
  if (isGroupedAggregate(arr)) {
    const entity = inferEntity(question);
    const sorted = [...arr].sort((a, b) => (readGroupValue(b) ?? 0) - (readGroupValue(a) ?? 0));
    const top = sorted.slice(0, 5);
    const bullets = top.map((g) => {
      const key =
        typeof g._id === 'object' && g._id != null
          ? Object.entries(g._id).map(([k, v]) => `${k}: ${v}`).join(', ')
          : String(g._id);
      const val = readGroupValue(g);
      const prettyVal = typeof val === 'number' ? fmtNum(val) : val;
      return `• ${key} — ${prettyVal}`;
    });
    const more = sorted.length > 5 ? `\n\n…and ${sorted.length - 5} more group${sorted.length - 5 > 1 ? 's' : ''}.` : '';
    return `Here’s the grouped summary for ${entity}s:\n\n${bullets.join('\n')}${more}`;
  }

  // Plain lists
  if (arr.length === 0) {
    return 'No results matched your filters. Try relaxing the constraints (e.g., a higher price or broader color).';
  }

  const entity = inferEntity(question);
  const lines = arr.slice(0, 5).map(prettyLine);

  if (arr.length === 1) return `Here’s the ${entity} I found:\n${lines[0]}`;
  const more =
    arr.length > 5 ? `\n\n…and ${arr.length - 5} more ${entity}${arr.length - 5 > 1 ? 's' : ''}.` : '';
  return `Here are ${plural(arr.length, entity)} I found:\n\n${lines.join('\n')}${more}`;
}

async function inferAnswerRole(answerText) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Decide who should see this answer in an e-commerce system.

Answer:
"""
${answerText}
"""

If the content is:
- general product info, greetings, prices, availability, order summaries → "user"
- contains management, analytics, inventory control, revenue, or sensitive operations → "admin"

Reply ONLY with one word: user OR admin.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text?.().trim().toLowerCase();
    return text.includes('admin') ? 'admin' : 'user';
  } catch {
    // fallback — default safe assumption
    return 'user';
  }
}

module.exports = {
  convertNaturalLanguageToQuery,
  toHumanAnswer,
  isSmalltalk,
  smalltalkReply,
  looksDestructive,
  inferAnswerRole,   
};