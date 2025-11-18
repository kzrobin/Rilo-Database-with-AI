const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  createAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} = require("../../controllers/shop/addressContorller");

const authUser = require("../../middleware/authUser");

router.post(
  "/",
  authUser,
  [
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode is required")
      .isPostalCode("any")
      .withMessage("Invalid pincode"),
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^(01[3-9]\d{8})$/)
      .withMessage("Invalid Bangladeshi phone number"),
  ],
  createAddress
);

router.get("/", authUser, getUserAddresses);

router.put(
  "/:id",
  authUser,
  [
    body("address").notEmpty().withMessage("Address is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("pincode")
      .notEmpty()
      .withMessage("Pincode is required")
      .isPostalCode("any")
      .withMessage("Invalid pincode"),
    body("phone")
      .notEmpty()
      .withMessage("Phone is required")
      .matches(/^(01[3-9]\d{8})$/)
      .withMessage("Invalid Bangladeshi phone number"),
  ],
  updateAddress
);

router.delete("/:id", authUser, deleteAddress);

module.exports = router;
