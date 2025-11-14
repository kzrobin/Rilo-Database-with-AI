const express = require("express");
const { body } = require("express-validator");
const authuser = require("../middleware/authUser.js");

const {
  register,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
} = require("../controllers/userController"); // Adjust path

const router = express.Router();
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("lastname")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("invalid email or password"),
    body("password").isLength({ min: 6 }),
  ],
  loginUser
);

router.post("/logout", authuser, logoutUser);
router.get("/auth-user", authuser, (req, res, next) => {
  console.log(req.user);
  return res.status(200).json({
    user: req.user,
  });
});

router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

router.get("/", (req, res, next) => {
  res.send("Hello World");
});

module.exports = router;
