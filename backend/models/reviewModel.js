const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    // The main content of the review
    reviewText: {
      type: String,
      trim: true,
      required: [true, "Review text cannot be empty."],
    },

    // The star rating
    rating: {
      type: Number,
      required: [true, "A rating is required."],
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot be more than 5."],
    },

    // --- Relationships ---

    // Foreign Key reference to the Product being reviewed
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "A review must belong to a product."],
    },

    // Foreign Key reference to the User who wrote the review
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "A review must have an author."],
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true,
  }
);

// --- INDEXES FOR PERFORMANCE ---
// Create a compound index to ensure that a single user can only review a single product once.
// This prevents spam.
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true });

// --- STATIC METHOD TO CALCULATE AVERAGE RATING (Advanced but recommended) ---
// This function will be called after a review is saved or deleted to update the parent product.
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product_id: productId },
    },
    {
      $group: {
        _id: "$product_id",
        numRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (stats.length > 0) {
    // Find the product and update it with the new average rating and count
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      averageRating: stats[0].avgRating,
      numReviews: stats[0].numRatings,
    });
  } else {
    // If no reviews are left, reset the product's rating fields
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      averageRating: 0,
      numReviews: 0,
    });
  }
};

// --- MIDDLEWARE HOOKS ---
// Call the calculateAverageRating function after a new review is saved
reviewSchema.post("save", function () {
  this.constructor.calculateAverageRating(this.product_id);
});

// Call the calculateAverageRating function when a review is deleted
// We use a pre hook here to get access to the review document before it's deleted
reviewSchema.pre("findOneAndDelete", async function (next) {
  // 'this.getFilter()' gets the query conditions, e.g., { _id: ... }
  this.review = await this.model.findOne(this.getFilter());
  next();
});

reviewSchema.post("findOneAndDelete", async function () {
  if (this.review) {
    await this.review.constructor.calculateAverageRating(
      this.review.product_id
    );
  }
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
