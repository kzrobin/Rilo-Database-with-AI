const Review = require("../models/reviewModel");
const Product = require("../models/productModel"); // Needed for some checks

/**
 * @desc    Create a new review for a product
 * @route   POST /api/products/:productId/reviews
 * @access  Private (User must be logged in)
 */
const createReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const productId = req.params.productId;
    const userId = req.user._id;

    // 1. Check if the product exists
    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found." });
    }

    // 2. Check if the user has already reviewed this product
    // The unique index on the model will also prevent this, but this gives a friendlier message.
    const alreadyReviewed = await Review.findOne({
      product_id: productId,
      user_id: userId,
    });
    if (alreadyReviewed) {
      return res.status(409).json({
        status: "fail",
        message: "You have already reviewed this product.",
      });
    }

    // 3. Create the review
    const newReview = await Review.create({
      rating,
      reviewText,
      product_id: productId,
      user_id: userId,
    });

    res.status(201).json({
      status: "success",
      message: "Review submitted successfully.",
      data: { review: newReview },
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ status: "fail", message: error.message });
    }
    console.error("CREATE REVIEW ERROR:", error);
    res
      .status(500)
      .json({ status: "fail", message: "Server error while creating review." });
  }
};

/**
 * @desc    Get all reviews for a specific product
 * @route   GET /api/products/:productId/reviews
 * @access  Public
 */
const getReviewsForProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product_id: req.params.productId })
      .populate(
        "user_id",
        "fullname.firstname fullname.lastname profilePicture"
      ) // Populate author details
      .sort({ createdAt: -1 }); // Show newest reviews first

    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: { reviews },
    });
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "Server error while fetching reviews.",
    });
  }
};

/**
 * @desc    Update a user's own review
 * @route   PATCH /api/reviews/:reviewId
 * @access  Private (User must own the review)
 */
const updateMyReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ status: "fail", message: "Review not found." });
    }

    // Authorization check: Ensure the logged-in user is the author of the review
    if (review.user_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this review.",
      });
    }

    // Update the fields if they were provided
    if (rating) review.rating = rating;
    if (reviewText) review.reviewText = reviewText;

    const updatedReview = await review.save();

    res.status(200).json({
      status: "success",
      message: "Review updated successfully.",
      data: { review: updatedReview },
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);
    res
      .status(500)
      .json({ status: "fail", message: "Server error while updating review." });
  }
};

/**
 * @desc    Delete a user's own review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Private (User must own the review or be an Admin)
 */
const deleteMyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res
        .status(404)
        .json({ status: "fail", message: "Review not found." });
    }

    // Authorization check: User must be the author OR an admin
    if (
      review.user_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to delete this review.",
      });
    }

    // The 'pre' hook on the model will trigger the static method to recalculate ratings
    await Review.findByIdAndDelete(req.params.reviewId);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    res
      .status(500)
      .json({ status: "fail", message: "Server error while deleting review." });
  }
};

module.exports = {
  createReview,
  getReviewsForProduct,
  updateMyReview,
  deleteMyReview,
};
