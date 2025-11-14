const mongoose = require("mongoose");
const { Schema } = mongoose;
const FebricModel = require("./fabricModel");

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title name is required."],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required."],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    salePrice: {
      type: Number,
      default: 0,
      min: [0, "Sale price cannot be negative."],
    },
    totalStock: {
      type: Number,
      required: [true, "Stock quantity is required."],
      min: [0, "Stock cannot be negative."],
      default: 0,
    },

    // ✅ Single image (uploaded via ProductImageUpload)
    image: {
      url: {
        type: String,
        trim: true,
        required: [true, "Product image is required."],
      },
    },

    // // ✅ (Optional) If a product is linked to a fabric
    // fabric_id: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Fabric",
    //   required: false,
    // },
  },
  { timestamps: true }
);

const ProductModel = mongoose.model("Product", productSchema);
module.exports = ProductModel;
