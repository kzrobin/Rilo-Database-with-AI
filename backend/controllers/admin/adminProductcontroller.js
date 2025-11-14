// controllers/productController.js
const ProductModel = require("../../models/productModel");
const { imageUploadUtil } = require("../../utils/cloudinary");
const { validationResult } = require("express-validator");

const allowedFields = [
  "product_name",
  "description",
  "category",
  "brand",
  "price",
  "salePrice",
  "totalStock",
  "image",
  // "fabric_id",
];

const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded." });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;
    const result = await imageUploadUtil(dataUri);

    res.json({
      success: true,
      message: "Image uploaded successfully.",
      result, // { url, public_id }
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Image upload failed.",
      error: error.message,
    });
  }
};

//  create product

const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: errors.array(),
      });
    }

    const {
      title,
      category,
      price,
      salePrice,
      image,
      description,
      totalStock,
    } = req.body;

    const product = new ProductModel({
      title,
      category,
      description,
      image: image ? { url: image.url } : undefined,
      price: Number(price),
      salePrice: Number(salePrice || 0),
      totalStock: Number(totalStock || 0),
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product.",
      error: error.message,
    });
  }
};

// get all products
const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.find();

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

// update product
const updateProduct = async (req, res) => {
  try {
    const data = pick(req.body, allowedFields);

    const updated = await ProductModel.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.json({
      success: true,
      message: "Product updated.",
      data: updated,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update product.",
      error: error.message,
    });
  }
};

// delete products
const deleteProduct = async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found." });
    }

    res.json({ success: true, message: "Product deleted." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: error.message,
    });
  }
};

module.exports = {
  handleImageUpload,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
