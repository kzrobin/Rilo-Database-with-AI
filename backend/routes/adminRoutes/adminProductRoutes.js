// routes/productRoutes.js
const express = require("express");
const {
  handleImageUpload,
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/adminProductcontroller");
const { upload } = require("../../utils/cloudinary");
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

// upload image
router.post(
  "/upload-image",
  async (req, res, next) => {
    console.log(req.file);
    next();
  },
  upload.single("my_file"),
  handleImageUpload
);

// add products
router.post(
  "/products",
  [
    body("title")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Title is required."),
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

// get all products
router.get("/", getAllProducts);

// get products by id
router.get("/:id", getProductById);
// edit product by id

router.put(
  "/products/:id",
  [
    body("title")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Product title cannot be empty."),
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
// delete products by id
router.delete("/:id", deleteProduct);

module.exports = router;
