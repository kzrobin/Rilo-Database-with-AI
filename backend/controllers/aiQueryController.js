// controllers/aiQueryController.js

const {
  isSmalltalk,
  looksDestructive,
  smalltalkReply,
  convertNaturalLanguageToQuery,
  toHumanAnswer,
  inferAnswerRole,
} = require("../utils/translator");

// Mongoose models (adjust paths if needed)
const Product = require("../models/productModel");
const Fabric = require("../models/fabricModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const Review = require("../models/reviewModel");

// Map MongoDB collection name → Mongoose model
function getModelByCollection(name) {
  switch (name) {
    case "products":
      return Product;
    case "fabrics":
      return Fabric;
    case "carts":
      return Cart;
    case "orders":
      return Order;
    case "reviews":
      return Review;
    default:
      throw new Error(`Unknown collection in query: ${name}`);
  }
}

// Safely eval a JS literal (object/array) coming from the LLM.
// We restrict to data structures only; no functions or code.
function evalLiteral(literalText) {
  // Wrap in parentheses so object literals parse correctly
  const wrapped = `return (${literalText});`;
  // eslint-disable-next-line no-new-func
  const fn = new Function(wrapped);
  return fn();
}

// Execute a Mongo-style string like:
//   db.products.find({ ... }).limit(20)
//   db.orders.aggregate([ ... ])
async function executeMongoQueryFromString(queryString) {
  if (!queryString || typeof queryString !== "string") {
    throw new Error("Empty or invalid query string");
  }

  const q = queryString.trim().replace(/;+\s*$/, "");
  if (!q.startsWith("db.")) {
    throw new Error(`Query must start with "db.": ${q}`);
  }

  // Extract "collection.method(...)..."
  const afterDb = q.slice(3); // remove "db."
  const firstDotIdx = afterDb.indexOf(".");
  if (firstDotIdx === -1) {
    throw new Error(`Invalid query format (no collection method): ${q}`);
  }

  const collection = afterDb.slice(0, firstDotIdx).trim();
  const rest = afterDb.slice(firstDotIdx + 1).trim(); // e.g. "find({ ... }).limit(10)"

  const Model = getModelByCollection(collection);

  // Handle aggregate(...)
  if (rest.startsWith("aggregate(")) {
    // Match aggregate( [ ... ] )
    const aggMatch = rest.match(/aggregate\s*\(\s*(\[[\s\S]*\])\s*\)/);
    if (!aggMatch) {
      throw new Error(`Could not parse aggregate pipeline from: ${q}`);
    }
    const pipelineLiteral = aggMatch[1];
    const pipeline = evalLiteral(pipelineLiteral);
    if (!Array.isArray(pipeline)) {
      throw new Error("Parsed aggregate pipeline is not an array");
    }
    const docs = await Model.aggregate(pipeline);
    return docs;
  }

  // Handle find(...)
  if (rest.startsWith("find(")) {
    // Pattern: find({ ... })[.limit(N)]
    const findMatch = rest.match(
      /find\s*\(\s*([\s\S]*?)\s*\)(?:\s*\.limit\s*\(\s*(\d+)\s*\))?/
    );
    if (!findMatch) {
      throw new Error(`Could not parse find query from: ${q}`);
    }

    const filterLiteral =
      findMatch[1] && findMatch[1].trim() ? findMatch[1].trim() : "{}";
    const limitStr = findMatch[2];
    const limit = limitStr ? parseInt(limitStr, 10) : 20;

    const filter = evalLiteral(filterLiteral);
    const docs = await Model.find(filter).limit(limit).lean();
    return docs;
  }

  throw new Error(`Unsupported query type in: ${q}`);
}

// Main controller
// POST /ai-query
// Body: { "question": "..." }
async function translateAndRunQuery(req, res) {
  try {
    const { question } = req.body || {};
    const message = (question || "").toString().trim();

    if (!message) {
      return res.status(400).json({
        ok: false,
        error: "Empty question",
      });
    }

    // 1) Handle smalltalk (no DB)
    if (isSmalltalk(message)) {
      const answer = smalltalkReply(message);
      return res.json({
        ok: true,
        planner_source: "smalltalk",
        mongodb_query: null,
        result_count: 0,
        results: [],
        answer,
        role: "user",
      });
    }

    // 2) Block obviously destructive intent
    if (looksDestructive(message)) {
      return res.status(400).json({
        ok: false,
        planner_source: "blocked",
        mongodb_query: null,
        result_count: 0,
        results: [],
        answer:
          "That kind of destructive operation isn't allowed. Please ask about products, stock, orders, or reviews instead.",
        role: "user",
      });
    }

    // 3) Ask LLM to convert natural language → Mongo query string
    const { query: generatedQuery, planner_source } =
      await convertNaturalLanguageToQuery(message);

    if (!generatedQuery) {
      return res.status(500).json({
        ok: false,
        error: "Planner failed to produce a query",
      });
    }

    // 4) Execute the MongoDB query
    const results = await executeMongoQueryFromString(generatedQuery);

    // 5) Turn results into natural language answer (IMPORTANT: await!)
    const answerText = await toHumanAnswer(message, generatedQuery, results);

    // 6) Ask LLM which role this answer is intended for (user/admin)
    const role = await inferAnswerRole(answerText);

    // Compute result_count for convenience
    let resultCount = 0;
    if (Array.isArray(results)) {
      resultCount = results.length;
    } else if (typeof results === "number") {
      resultCount = 1;
    }

    return res.json({
      ok: true,
      planner_source,
      mongodb_query: generatedQuery,
      result_count: resultCount,
      results,
      answer: answerText,
      role,
    });
  } catch (err) {
    console.error("[aiQueryController] error:", err);
    return res.status(500).json({
      ok: false,
      error: "Unhandled error",
      detail: err.message || String(err),
    });
  }
}

module.exports = {
  translateAndRunQuery,
};