// routes/productRoutes.js
const express = require("express");
const {
  getAllProducts,
  getProductById,
} = require("../../controllers/shop/shopController");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// get all products
router.get("/", getAllProducts);

// get products by id
router.get("/:id", getProductById);

module.exports = router;
