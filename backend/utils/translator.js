// utils/translator.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

// If key is missing, we'll throw when we actually try to call the model.
const genAI = GEMINI_API_KEY
  ? new GoogleGenerativeAI(GEMINI_API_KEY)
  : null;

// You can override models via env if you like.
const PLANNER_MODEL =
  process.env.GEMINI_PLANNER_MODEL || "gemini-2.5-flash-lite";
const ANSWER_MODEL =
  process.env.GEMINI_ANSWER_MODEL || "gemini-2.5-flash-lite";
const ROLE_MODEL =
  process.env.GEMINI_ROLE_MODEL || ANSWER_MODEL;

/* -------------------------------------------------------------------------- */
/*  1) Simple heuristics: smalltalk + destructive intent                      */
/* -------------------------------------------------------------------------- */

const SMALLTALK_PATTERNS = [
  /\bhi\b/i,
  /\bhello\b/i,
  /\bhey\b/i,
  /\bhow are you\b/i,
  /\bwho are you\b/i,
  /\bwhat can you do\b/i,
  /\bthank(s| you)\b/i,
];

function isSmalltalk(message) {
  return SMALLTALK_PATTERNS.some((re) => re.test(message));
}

function smalltalkReply(message) {
  const lower = message.toLowerCase();
  if (/how are you/.test(lower)) {
    return "I’m doing great, thanks for asking! I’m here to help you explore products, orders, carts, and reviews. What would you like to know?";
  }
  if (/who are you|what can you do/.test(lower)) {
    return "I’m your AI shopping assistant. You can ask me things like:\n- “Show red cotton kurtis under 1500 with stock”\n- “List my recent orders”\n- “Show the top reviewed products”";
  }
  if (/thank/.test(lower)) {
    return "You’re welcome! If you have more questions about products or orders, just ask. 😊";
  }
  if (/hi|hello|hey/.test(lower)) {
    return "Hi! 👋 How can I help you with products, orders, carts, or reviews today?";
  }
  return "Hi! I’m your shopping assistant. Ask me about products, orders, carts, or reviews and I’ll do my best to help.";
}

const DESTRUCTIVE_PATTERNS = [
  /drop\s+database/i,
  /drop\s+db/i,
  /delete\s+all\s+users?/i,
  /delete\s+everything/i,
  /truncate/i,
  /remove\s+all\s+orders?/i,
  /clear\s+orders?/i,
  /reset\s+database/i,
];

function looksDestructive(message) {
  return DESTRUCTIVE_PATTERNS.some((re) => re.test(message));
}

/* -------------------------------------------------------------------------- */
/*  2) Gemini helpers                                                         */
/* -------------------------------------------------------------------------- */

function ensureGemini() {
  if (!genAI) {
    throw new Error(
      "GEMINI_API_KEY / GOOGLE_API_KEY not set. Cannot call Gemini."
    );
  }
}

async function callGemini(modelName, systemText, userText) {
  ensureGemini();
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          { text: `<SYSTEM>\n${systemText}\n</SYSTEM>` },
          { text: `<USER>\n${userText}\n</USER>` },
        ],
      },
    ],
  });

  const text = result.response.text();
  return text.trim();
}

/* -------------------------------------------------------------------------- */
/*  3) Planner: natural language → MongoDB query string                       */
/* -------------------------------------------------------------------------- */

/**
 * We describe the *actual* collections & fields so Gemini doesn’t invent names.
 * This should mirror your current Mongoose schemas (productModel, orderModel,
 * cartModel, fabricModel, reviewModel).
 */
const PLANNER_SYSTEM_PROMPT = `
You are a MongoDB query planner for an e-commerce backend.

You receive a natural language question and must return EXACTLY ONE JavaScript expression:
- Either:  db.<collection>.find(<filterObject>).limit(<N>)
- Or:      db.<collection>.aggregate(<pipelineArray>)
No extra code, no comments, no markdown, no backticks, no trailing semicolon.

Collections & fields (match the real schemas):

1) products
   - _id                 (ObjectId)
   - product_name        (string)
   - price               (number)
   - stock_quantity      (number)
   - fabric_id           (ObjectId -> fabrics._id)
   - title               (string)
   - description         (string)
   - category            (string)   // e.g. "men", "women", "kids"
   - salePrice           (number)
   - totalStock          (number)
   - image               (object { url })

2) fabrics
   - _id
   - fabric_name         (string)
   - material            (string)   // e.g. "cotton", "linen"
   - color               (string)   // e.g. "red", "blue"

3) carts
   - _id
   - user                (ObjectId -> users._id, if present)
   - items: [
       {
         product_id: ObjectId -> products._id,
         quantity:   number
       }
     ]

4) orders
   - _id
   - user                (ObjectId -> users._id)
   - items: [
       {
         product_id: ObjectId -> products._id,
         quantity:   number,
         price:      number
       }
     ]
   - totalAmount         (number)   // total price of the order
   - status              (string)   // e.g. "Pending","Shipped","Delivered","Cancelled"
   - createdAt           (Date)

5) reviews
   - _id
   - product_id          (ObjectId -> products._id)
   - user_id             (ObjectId -> users._id)
   - rating              (number, 1..5)
   - title               (string)
   - comment             (string)
   - createdAt           (Date)

General intent mapping:

- Product discovery:
  - “Show red cotton kurtis under 1500 with stock”
  - Use:  db.products.aggregate([...]) with:
    - $lookup to fabrics on fabric_id -> _id
    - $match with:
        product_name regex "kurti"
        price < 1500
        stock_quantity > 0
        fabric_details.color regex "red"
        fabric_details.material regex "cotton"
    - $project relevant fields.
  - Example pattern (do NOT copy literally, but structure like this):
    db.products.aggregate([
      { $lookup: { from: "fabrics", localField: "fabric_id", foreignField: "_id", as: "fabric_details" } },
      { $unwind: "$fabric_details" },
      { $match: {
          product_name: { $regex: "kurti", $options: "i" },
          price: { $lt: 1500 },
          stock_quantity: { $gt: 0 },
          "fabric_details.color": { $regex: "red", $options: "i" },
          "fabric_details.material": { $regex: "cotton", $options: "i" }
        }
      },
      { $project: {
          _id: 0,
          product_name: 1,
          price: 1,
          stock_quantity: 1,
          color: "$fabric_details.color",
          material: "$fabric_details.material"
        }
      },
      { $limit: 20 }
    ])

- Orders:
  - If the user says “list/show/get orders”, “list the orders of the user”,
    “show all orders”, etc., default to a simple listing, NOT aggregation.
    Example:
      db.orders.find({}).limit(20)
  - Only use aggregate when the user explicitly asks for statistics or totals:
    - “What is the total revenue?” → sum totalAmount
    - “How many orders have been placed?” → count orders
    Example:
      db.orders.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$totalAmount" } } }
      ])

- Carts:
  - “Show the items in the cart”, “what’s in my cart”:
    - Use: db.carts.find({...}).limit(1) or aggregate if you want to expand product details.

- Reviews / top reviewed products:
  - “Show the top reviewed products”, “Which products have the best ratings?”:
    - Use reviews + products:
      db.reviews.aggregate([
        { $group: { _id: "$product_id", averageRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
        { $sort: { averageRating: -1, reviewCount: -1 } },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $project: { _id: 0, product: "$product", averageRating: 1, reviewCount: 1 } },
        { $limit: 20 }
      ])

Rules:

1) Use ONLY the collections and fields listed above. Do NOT invent field names.
   - For orders, use "totalAmount", not "total_price".
   - For reviews, use "product_id", not "productId" or "product".

2) For listing entities (“list/show/get orders/products/carts/reviews”),
   prefer db.<collection>.find({...}).limit(N) with a reasonable filter (or {}).

3) For analytics/statistics (“total”, “sum”, “average”, “count”, “top N”),
   use aggregate with $group / $sum / $avg / $sort.

4) Always set a limit (default 20) in either:
   - .limit(N)  for find
   - {$limit: N} for aggregate

5) Never include a trailing semicolon or any extra statements.
   Output MUST be a SINGLE expression starting with "db.".

6) For this project, smalltalk (like “hi”, “how are you”) is handled elsewhere.
   Here, assume the question requires a DB query.
`;

async function convertNaturalLanguageToQuery(message) {
  // Let Gemini plan the MongoDB query
  const userText = `User question:\n${message}\n\nReturn ONLY a MongoDB JS expression, starting with db., no backticks, no markdown, no trailing semicolon.`;

  const raw = await callGemini(PLANNER_MODEL, PLANNER_SYSTEM_PROMPT, userText);

  // Strip any accidental code fences
  const cleaned = raw
    .replace(/```[\s\S]*?```/g, (block) =>
      block.replace(/```(json|js|javascript)?/g, "").replace(/```/g, "")
    )
    .trim();

  // Also strip a trailing semicolon if LLM still added one
  const query = cleaned.replace(/;+\s*$/, "");

  return {
    query,
    planner_source: "llm",
  };
}

/* -------------------------------------------------------------------------- */
/*  4) Answer verbalization: results → human text                             */
/* -------------------------------------------------------------------------- */

const ANSWER_SYSTEM_PROMPT = `
You are an e-commerce assistant. You receive:
- The original user question
- The MongoDB query that was executed
- The JSON results of that query

Your job: answer the user in clear, friendly natural language.

Guidelines:
- DO NOT dump the full MongoDB query back to the user.
- Summarize the results in a human way.
- Be concise but helpful.
- If there are no results, say so and suggest how they might adjust filters
  (e.g., increase budget, change color/material, etc.).
- For products:
  - Mention product_name, price, stock_quantity, and key fabric info (color/material) if present.
- For orders:
  - Mention order count, basic status, totalAmount, and createdAt if present.
- For carts:
  - Mention products and quantities.
- For reviews / top reviewed products:
  - Mention product name, rating, and review count.

Return ONLY the natural language answer text. No markdown fences, no code.
`;

async function toHumanAnswer(message, mongoQuery, results) {
  const userText = `
User question:
${message}

MongoDB query that was run:
${mongoQuery}

Raw JSON results:
${JSON.stringify(results, null, 2)}
`;

  const answer = await callGemini(ANSWER_MODEL, ANSWER_SYSTEM_PROMPT, userText);
  return answer;
}

/* -------------------------------------------------------------------------- */
/*  5) Role inference: user vs admin                                          */
/* -------------------------------------------------------------------------- */

const ROLE_SYSTEM_PROMPT = `
You are a role classifier for an e-commerce assistant.

You receive ONLY the assistant's answer text. Determine which role it is intended for:

- "user": Normal customer-facing answer about products, carts, orders, reviews, recommendations.
- "admin": Technical or sensitive content that should only be seen by an admin,
           such as internal system status, raw MongoDB queries, schema details,
           config keys, stack traces, or debugging info.

Rules:
- If the answer includes explicit low-level technical details (e.g., "I ran this query: db...."),
  or internal error/debug info, classify as "admin".
- Otherwise, default to "user".

Return EXACTLY one word: either "user" or "admin".
`;

async function inferAnswerRole(answerText) {
  const text = await callGemini(
    ROLE_MODEL,
    ROLE_SYSTEM_PROMPT,
    `Assistant's answer:\n${answerText}`
  );

  const norm = text.trim().toLowerCase();
  if (norm.includes("admin")) return "admin";
  return "user";
}

/* -------------------------------------------------------------------------- */
/*  6) Exports                                                               */
/* -------------------------------------------------------------------------- */

module.exports = {
  isSmalltalk,
  looksDestructive,
  smalltalkReply,
  convertNaturalLanguageToQuery,
  toHumanAnswer,
  inferAnswerRole,
};