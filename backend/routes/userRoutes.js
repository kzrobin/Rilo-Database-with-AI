const express = require("express");
const { body } = require("express-validator");
const {
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController"); // Adjust path

const router = express.Router();
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Indalid Email"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name should be atleast three characters long"),
    body("fullname.lastname")
      .isLength({ min: 3 })
      .withMessage("Lastname must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password should be at least 6 characters long"),
  ],
  createUser
);

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

router.get("/", (req, res, next) => {
  res.send("Hello World");
});

module.exports = router;
