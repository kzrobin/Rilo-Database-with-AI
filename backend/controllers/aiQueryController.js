// controllers/aiQueryController.js

const mongoose = require("mongoose");
const { ObjectId } = require("mongodb"); // Import ObjectId from the native driver
const vm = require("vm");
const { convertNaturalLanguageToQuery } = require("../utils/translator"); // Assuming you move translator.js to a utils folder

// --- The core logic from your server.js, now as modular functions ---

const FORBIDDEN_KEYWORDS = [
  "delete",
  "remove",
  "drop",
  "update",
  "insert",
  "create",
  "runcommand",
];

/**
 * Parses and safely executes a MongoDB shell query string.
 * @param {string} queryString The raw query string from the AI.
 * @returns {Promise<any>} The database result.
 */
async function executeMongoQuerySafely(queryString) {
  // IMPORTANT: We get the native database connection directly from Mongoose
  const db = mongoose.connection.db;

  const match = /db\.(\w+)\.(\w+)\(([\s\S]*?)\)$/.exec(queryString);
  if (!match) {
    throw new Error("Unsupported or malformed query string.");
  }

  const [, collectionName, method, argsStr] = match;
  const collection = db.collection(collectionName);

  const sandbox = { ObjectId };
  const context = vm.createContext(sandbox);

  try {
    const args = vm.runInContext(`[${argsStr}]`, context);

    if (method === "find") {
      return await collection
        .find(args[0] || {}, { projection: args[1] || {} })
        .toArray();
    } else if (method === "countDocuments") {
      return await collection.countDocuments(args[0] || {});
    } else if (method === "aggregate") {
      return await collection.aggregate(args[0] || []).toArray();
    } else {
      throw new Error(`Unsupported method: '${method}'.`);
    }
  } catch (e) {
    throw new Error(`Could not execute query arguments. Error: ${e.message}`);
  }
}

/**
 * @desc    Accepts a natural language question, translates it, and executes the query.
 * @route   POST /api/ai-query/
 * @access  Private/Admin
 */
const translateAndRunQuery = async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res
      .status(400)
      .json({ error: "A 'question' is required in the request body." });
  }

  try {
    const generatedQuery = await convertNaturalLanguageToQuery(question);
    console.log(`AI Generated query: ${generatedQuery}`);

    // --- Security & Validation Checkpoint ---
    const queryUpper = generatedQuery.trim().toUpperCase();
    if (queryUpper === "OFFTOPIC") {
      return res
        .status(400)
        .json({ error: "I can only answer questions about the database." });
    }
    if (queryUpper === "FORBIDDEN") {
      return res
        .status(403)
        .json({ error: "This type of query is not allowed." });
    }
    if (
      FORBIDDEN_KEYWORDS.some((keyword) =>
        generatedQuery.toLowerCase().includes(keyword)
      )
    ) {
      return res
        .status(403)
        .json({ error: "This query contains a forbidden operation." });
    }

    const resultData = await executeMongoQuerySafely(generatedQuery);

    res.json({
      mongodb_query: generatedQuery,
      query_result: resultData,
    });
  } catch (error) {
    console.error("An error occurred during the AI query process:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  translateAndRunQuery,
};
