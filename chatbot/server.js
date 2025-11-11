// server.js

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb"); // Import MongoClient and ObjectId
const vm = require("vm"); // The built-in, secure Virtual Machine module for parsing
const { convertNaturalLanguageToQuery } = require("./translator"); // Our AI Specialist
require("dotenv").config();

// --- Express App and Database Connection ---
const app = express();
app.use(express.json()); // Middleware to parse incoming JSON request bodies

const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING);
let db;

/**
 * Connects to the MongoDB Atlas cluster and selects the database.
 * This function is called once at startup.
 */
async function connectToDb() {
  try {
    await mongoClient.connect();
    // IMPORTANT: Replace "palateParadise" if your database has a different name
    db = mongoClient.db("test");
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1); // Exit the application if the database connection fails
  }
}
// ------------------------------------------

// A "Deny List" of keywords for our security checkpoint to prevent write/delete operations
const FORBIDDEN_KEYWORDS = [
    'delete', 'remove', 'drop', 'update', 'insert', 'create', 'runcommand'
];

/**
 * Parses a MongoDB shell query string and executes it safely using a sandboxed VM.
 * This is the core of the execution engine.
 * @param {string} queryString The raw query string from the AI.
 * @returns {Promise<any>} A promise that resolves to the database result.
 */
async function executeMongoQuerySafely(queryString) {
    // This regex captures the collection, method, and arguments from a query string.
    const match = /db\.(\w+)\.(\w+)\(([\s\S]*?)\)$/.exec(queryString);

    if (!match) {
        throw new Error("Unsupported or malformed query string. Could not find db.collection.method() pattern.");
    }

    const [, collectionName, method, argsStr] = match;
    const collection = db.collection(collectionName);

    // --- THE SECURE SANDBOX ---
    // Create a secure, empty context. The code executed inside can't access your server's file system or network.
    const sandbox = {
      ObjectId: ObjectId // We safely provide the ObjectId constructor for queries that might need it.
    };
    const context = vm.createContext(sandbox);
    // -------------------

    try {
        // We wrap the arguments in an array `[ ... ]` and execute the string in the sandbox.
        // This safely converts the MongoDB shell arguments into native JavaScript objects.
        const args = vm.runInContext(`[${argsStr}]`, context);

        // Based on the method detected, call the appropriate safe pymongo function.
        if (method === "find") {
            const filter = args[0] || {};
            const projection = args[1] || {};
            return await collection.find(filter, { projection }).toArray();
        } else if (method === "countDocuments") {
            const filter = args[0] || {};
            return await collection.countDocuments(filter);
        } else if (method === "aggregate") {
            const pipeline = args[0] || [];
            return await collection.aggregate(pipeline).toArray();
        } else {
            throw new Error(`Unsupported method: '${method}'. Only find, countDocuments, and aggregate are allowed.`);
        }
    } catch (e) {
        // This will catch any syntax errors in the AI's generated arguments.
        throw new Error(`Could not execute query arguments: ${argsStr}. Error: ${e.message}`);
    }
}


// --- THE MAIN API ENDPOINT ---
app.post("/translate-and-run", async (req, res) => {
  const { question } = req.body;
  if (!question) { /* ... */ }

  try {
    const generatedQuery = await convertNaturalLanguageToQuery(question);
    console.log(`Generated query: ${generatedQuery}`);

    // --- UPGRADED SECURITY & VALIDATION CHECKPOINT ---
    const queryUpper = generatedQuery.trim().toUpperCase();

    // Check #1: Did the AI identify the question as off-topic?
    if (queryUpper === 'OFFTOPIC') {
      return res.status(400).json({ 
          error: "I can only answer questions about the database. Please ask something about users, products, or orders." 
      });
    }

    // Check #2: Did the AI identify the question as a forbidden operation?
    if (queryUpper === 'FORBIDDEN') {
      return res.status(403).json({ error: "This type of query is not allowed." });
    }

    // Check #3: Does the generated query contain any dangerous keywords?
    const queryLower = generatedQuery.toLowerCase();
    if (FORBIDDEN_KEYWORDS.some(keyword => queryLower.includes(keyword))) {
        console.log(`SECURITY ALERT: Forbidden keyword detected in query.`);
        return res.status(403).json({ error: "This query contains a forbidden operation and cannot be processed." });
    }
    // --------------------------------------------------

    const resultData = await executeMongoQuerySafely(generatedQuery);
    
    res.json({
      mongodb_query: generatedQuery,
      query_result: resultData,
    });

  } catch (error) {
    console.error("An error occurred during the process:", error);
    res.status(500).json({ error: error.message });
  }
});


// --- Start the Server ---
const PORT = process.env.PORT || 3000;
// We must connect to the database *before* we start listening for web requests.
connectToDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});