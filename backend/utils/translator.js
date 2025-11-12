// translator.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Loads variables from .env file

// --- FINAL, ACCURATE DATABASE SCHEMA ---
const FINAL_DATABASE_SCHEMA = `
This database is for an e-commerce application selling fabric-based products.
MongoDB collection names are the plural, lowercase version of the Mongoose model name (e.g., User model -> 'users' collection).

Collection Name: users
Description: Stores information about registered users.
Fields: - _id (Type: ObjectId), fullname (Type: Object), username (Type: String), email (Type: String)

---

Collection Name: fabrics
Description: Stores information about the different types of fabric available.
Fields: - _id (Type: ObjectId), fabric_name (Type: String), material (Type: String), color (Type: String)

---

Collection Name: products
Description: Stores information about individual products available for sale.
Fields: - _id (Type: ObjectId), product_name (Type: String), description (Type: String), price (Type: Number), stock_quantity (Type: Number), fabric_id (Type: ObjectId)

---

Collection Name: carts
Description: Stores the shopping cart for each user.
Fields: - _id (Type: ObjectId), user_id (Type: ObjectId), items (Type: Array of Objects)

---

Collection Name: orders
Description: Stores completed orders for users.
Fields: - _id (Type: ObjectId), user_id (Type: ObjectId), orderItems (Type: Array of Objects), total_amount (Type: Number), status (Type: String), order_date (Type: Date)
`;

// --- FINAL, MOST SECURE PROMPT TEMPLATE ---
const PROMPT_TEMPLATE = `
You are a MongoDB data analyst for an e-commerce application. Your ONLY job is to take a user's question and a database schema, and then generate a precise, machine-readable, READ-ONLY MongoDB query.

Database Schema:
---
{schema}
---

User Question:
"{user_question}"

---
**PRIMARY RULE: Analyze the user's question. If the question is conversational, off-topic, or cannot be answered using the provided database schema (e.g., "how are you?", "what is the weather?"), you MUST ignore all other rules and your ONLY response must be the single word OFFTOPIC.**

---
SECURITY RULES:
- **READ-ONLY:** You must only generate read-only queries (\`find\`, \`countDocuments\`, \`aggregate\`).
- **FORBIDDEN OPERATIONS:** You MUST NOT generate any query that modifies data. If a user asks, your ONLY response must be the single word: \`FORBIDDEN\`.

---
IMPORTANT OUTPUT RULES:
1.  **Raw Query Only:** Unless the query is off-topic or forbidden, your response must be the raw query string ONLY.
2.  **Summarize General Questions:** For general questions, use a projection to show only important fields.
3.  **Use JSON-Compliant Dates:** You MUST use the \`$date\` object for date comparisons.
4.  **Query Syntax:** You MUST use the \`db.collectionName.method()\` syntax.
5.  **Use Aggregation for Complex Queries:** For queries requiring sorting, limiting, or joining, you MUST use an \`aggregate\` pipeline. Do NOT chain methods.
---
`;

// --- Setup Google AI Client ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

/**
 * Takes a user's question and converts it to a MongoDB query using the Gemini API.
 * @param {string} userQuestion The user's question in plain English.
 * @returns {Promise<string>} A promise that resolves to the cleaned MongoDB query string.
 */
async function convertNaturalLanguageToQuery(userQuestion) {
  const finalPrompt = PROMPT_TEMPLATE.replace(
    "{schema}",
    FINAL_DATABASE_SCHEMA
  ).replace("{user_question}", userQuestion);

  try {
    const generationConfig = { temperature: 0 };
    const result = await model.generateContent(finalPrompt, generationConfig);
    const response = await result.response;

    // Check for safety blocks
    if (!response.text) {
      throw new Error("Response was blocked for safety reasons or was empty.");
    }
    const rawQuery = response.text();

    // Clean the response
    const cleanedQuery = rawQuery
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return cleanedQuery;
  } catch (error) {
    console.error("An error occurred with the Gemini API:", error);
    throw new Error("Failed to generate query from AI provider.");
  }
}

// Export the function so other files can use it
module.exports = { convertNaturalLanguageToQuery };
