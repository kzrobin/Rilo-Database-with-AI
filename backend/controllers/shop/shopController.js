// controllers/productController.js
const ProductModel = require("../../models/productModel");
const { imageUploadUtil } = require("../../utils/cloudinary");
const { validationResult } = require("express-validator");

// get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (error) {
    console.error("GET ALL PRODUCTS ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching products.",
    });
  }
};

// get product by id
const getProductById = async (req, res) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status().json({ message: "Data validaton failed" });
    }
    const product = await ProductModel.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Server error.",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
};
