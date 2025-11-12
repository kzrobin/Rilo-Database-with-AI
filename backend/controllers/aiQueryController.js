// controllers/aiQueryController.js
require('dotenv').config();

const mongoose = require('mongoose');
const vm = require('vm');
const { ObjectId } = require('mongodb');
const {
  convertNaturalLanguageToQuery,
  toHumanAnswer,
  isSmalltalk,
  smalltalkReply,
  looksDestructive,
} = require('../utils/translator');

// Allow-list for safety
const ALLOWED_METHODS = new Set(['find', 'countDocuments', 'aggregate']);
const ALLOWED_COLLECTIONS = new Set(['users', 'fabrics', 'products', 'carts', 'orders', 'reviews']);

const FORBIDDEN_KEYWORDS = [
  ' delete ', ' drop ', ' truncate ', ' remove all ', ' update all ', ' insert ', ' create ',
  ' delete', 'drop', 'truncate', 'remove all', 'update all', 'insert', 'create',
];

// Parse: db.<collection>.<method>(<args>)
function parseQuery(queryString) {
  const q = (queryString || '').trim().replace(/;$/, '');
  const m = /^db\.(\w+)\.(\w+)\(([\s\S]*?)\)$/.exec(q);
  if (!m) throw new Error('Unsupported or malformed query string.');

  const [, coll, method, argsStr] = m;

  if (!ALLOWED_COLLECTIONS.has(coll)) throw new Error(`Collection '${coll}' is not allowed.`);
  if (!ALLOWED_METHODS.has(method)) throw new Error(`Method '${method}' is not allowed.`);

  // Safely evaluate the argument list with a tiny sandbox
  const sandbox = { ObjectId, Date };
  const context = vm.createContext(sandbox);
  let args;
  try {
    args = vm.runInContext(`[${argsStr}]`, context);
  } catch (e) {
    throw new Error(`Failed to parse arguments: ${e.message}`);
  }

  return { coll, method, args };
}

async function executeMongoQuerySafely(queryString) {
  const db = mongoose?.connection?.db;
  if (!db || typeof db.collection !== 'function') {
    throw new Error('Database not available. Ensure mongoose is connected before calling this endpoint.');
  }

  // Quick extra safety scan
  const lower = ` ${queryString.toLowerCase()} `;
  if (FORBIDDEN_KEYWORDS.some(k => lower.includes(k))) {
    throw new Error('Query contains a forbidden operation.');
  }

  const { coll, method, args } = parseQuery(queryString);
  const collection = db.collection(coll);

  if (method === 'find') {
    const filter = args[0] || {};
    const proj = args[1] || {};
    return await collection.find(filter, { projection: proj }).toArray();
  }

  if (method === 'countDocuments') {
    const filter = args[0] || {};
    return await collection.countDocuments(filter);
  }

  if (method === 'aggregate') {
    const pipe = Array.isArray(args[0]) ? args[0] : [];
    return await collection.aggregate(pipe).toArray();
  }

  throw new Error(`Unsupported method: '${method}'.`);
}

const translateAndRunQuery = async (req, res) => {
  const question = (req.body?.question || req.body?.query || req.body?.message || '').trim();
  if (!question) return res.status(400).json({ ok: false, error: "A 'question' (or 'query'/'message') is required." });

  try {
    // 1) Small-talk handling
    if (isSmalltalk(question)) {
      return res.json({ ok: true, conversational: true, answer: smalltalkReply(question), results: [] });
    }

    // 2) Guard destructive intent at the natural-language level
    if (looksDestructive(question)) {
      return res.status(403).json({
        ok: false,
        error: 'Destructive intent refused',
        answer: "That looks like a destructive operation. I can only do read-only lookups and summaries.",
      });
    }

    // 3) Ask the LLM (with built-in retries/fallback) to produce a safe read-only Mongo query
    const { query: generatedQuery, planner_source } = await convertNaturalLanguageToQuery(question);

    // 4) Execute the query safely
    const results = await executeMongoQuerySafely(generatedQuery);

    // 5) Human-friendly answer
    const answer = toHumanAnswer(question, generatedQuery, results);
    const role = await require('../utils/translator').inferAnswerRole(answer);

    return res.json({
      ok: true,
      planner_source,                 // "llm" or "fallback"
      mongodb_query: generatedQuery,
      result_count: Array.isArray(results) ? results.length : (typeof results === 'number' ? results : 1),
      results,
      answer,
      role,
    });
  } catch (err) {
    console.error('AI query error:', err);
    return res.status(500).json({ ok: false, error: 'Unhandled error', detail: String(err.message || err) });
  }
};

module.exports = { translateAndRunQuery };