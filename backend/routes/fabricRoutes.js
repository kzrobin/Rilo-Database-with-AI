const express = require("express");
const {
  createFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
} = require("../controllers/fabricController"); // Adjust path as needed

const router = express.Router();

// Routes for the collection (/api/fabrics)
router.route("/").post(createFabric).get(getAllFabrics);

// Routes for a specific document (/api/fabrics/:id)
router
  .route("/:id")
  .get(getFabricById)
  .patch(updateFabric)
  .delete(deleteFabric);

module.exports = router;
