const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    rating: {
      type: Number,
      required: [true, "Rating is required."],
      min: [0, "Rating cannot be less than 0."],
      max: [5, "Rating cannot exceed 5."],
    },
    description: {
      type: String,
      required: [true, "Review description is required."],
      trim: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const ReviewModel = mongoose.model("Review", reviewSchema);
module.exports = ReviewModel;
   
