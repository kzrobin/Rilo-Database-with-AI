// routes/productRoutes.js
const express = require("express");
const {
  handleImageUpload,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { upload } = require("../utils/cloudinary");
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

router.post("/upload-image", upload.single("my_file"), handleImageUpload);

router.post(
  "/products",
  [
    body("product_name")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Product name is required."),
    body("description")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Description is required."),
    body("category")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Category is required."),
    body("brand")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Brand is required."),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("salePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Sale price must be non-negative."),
    body("totalStock")
      .isInt({ min: 0 })
      .withMessage("Total stock must be a non-negative integer."),

    // Image validation
    body("image").isObject().withMessage("Image object is required."),
    body("image.url")
      .isURL({ require_protocol: true })
      .withMessage("Valid image URL is required."),
    body("image.public_id").optional().isString().trim(),
  ],
  validate,
  createProduct
);

router.get("/products", getAllProducts);
router.get("/products/:id", getProductById);
router.put(
  "/products/:id",
  [
    body("product_name")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Product name cannot be empty."),
    body("description")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Description cannot be empty."),
    body("category")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Category cannot be empty."),
    body("brand")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Brand cannot be empty."),

    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Price must be positive."),
    body("salePrice")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Sale price must be non-negative."),
    body("totalStock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stock must be a non-negative integer."),

    body("image").optional().isObject(),
    body("image.url")
      .optional()
      .isURL({ require_protocol: true })
      .withMessage("Image URL must be valid."),
    body("image.public_id").optional().isString().trim(),

    // body("fabric_id").optional().isMongoId(),
  ],
  validate,
  updateProduct
);

router.delete("/products/:id", deleteProduct);

module.exports = router;
