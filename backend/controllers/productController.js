const Product = require("../models/productModel");
const Fabric = require("../models/fabricModel");
const { imageUploadUtil, upload } = require("../utils/cloudinary");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;

    const result = await imageUploadUtil(url);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while uploading image.",
      error: error.message || error,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const { product_name, description, price, stock_quantity, fabric_id } =
      req.body;

    if (
      !product_name ||
      !description ||
      !price ||
      !stock_quantity ||
      !fabric_id
    ) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide all required product details.",
      });
    }

    const fabricExists = await Fabric.findById(fabric_id);
    if (!fabricExists) {
      return res.status(404).json({
        status: "fail",
        message: "The specified fabric ID does not exist.",
      });
    }

    const newProduct = await Product.create({
      product_name,
      description,
      price,
      stock_quantity,
      fabric_id,
    });

    res.status(201).json({
      status: "success",
      message: "Product created successfully.",
      data: {
        product: newProduct,
      },
    });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while creating the product.",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    // .populate(
    //   "fabric_id",
    //   "fabric_name material color"
    // );

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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("fabric_id");

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("GET PRODUCT BY ID ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching the product.",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID to update.",
      });
    }

    await updatedProduct.populate("fabric_id");

    res.status(200).json({
      status: "success",
      message: "Product updated successfully.",
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while updating the product.",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "No product found with that ID to delete.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the product.",
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  handleImageUpload,
};

