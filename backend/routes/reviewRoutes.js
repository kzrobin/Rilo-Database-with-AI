const express = require("express");
const {
  createReview,
  getReviewsForProduct,
  updateMyReview,
  deleteMyReview,
} = require("../controllers/reviewController");
const authMiddleware = require("../middleware/authUser");

// By setting mergeParams to true, this router will be able to access
// URL parameters (like :productId) from parent routers.
const router = express.Router({ mergeParams: true });

// --- ROUTES ---

// These routes will be mounted under /api/products/:productId/reviews
router
  .route("/")
  .post(authMiddleware, createReview) // POST to /api/products/:productId/reviews
  .get(getReviewsForProduct); // GET  to /api/products/:productId/reviews

// These routes operate on a specific review and will be mounted under /api/reviews
// We need a separate router for this, or handle it in the main app.js
// For simplicity, let's create a separate router for direct review access.

const reviewIdRouter = express.Router();

reviewIdRouter
  .route("/:reviewId")
  .patch(authMiddleware, updateMyReview) // PATCH  to /api/reviews/:reviewId
  .delete(authMiddleware, deleteMyReview); // DELETE to /api/reviews/:reviewId

// We export both routers
module.exports = {
  productReviewRouter: router,
  reviewRouter: reviewIdRouter,
};
