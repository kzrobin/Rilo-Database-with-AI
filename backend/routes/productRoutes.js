const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { productReviewRouter } = require("./reviewRoutes");

const router = express.Router();

router.use("/:productId/reviews", productReviewRouter);

router.route("/").post(createProduct).get(getAllProducts);

router
  .route("/:id")
  .get(getProductById)
  .patch(updateProduct)
  .delete(deleteProduct);

module.exports = router;
