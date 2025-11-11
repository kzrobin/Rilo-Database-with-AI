const { validationResult } = require("express-validator");
const userModel = require("../models/userModel");
const blackListTokenModel = require("../models/tokenBlackListModel.js");

// register user

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: "Data validation error",
      });
    }

    const { firstname, lastname, email, password } = req.body;

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashPassword = await userModel.hashPassword(password);

    // Create new user
    const user = await userModel.create({
      fullname: {
        firstname,
        lastname,
      },
      email,
      password: hashPassword,
    });

    const token = user.generateAuthToken();

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 1000, // 1h
    });

    // Response
    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};

// user login
const loginUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: "Data validation error" });
    }

    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = await user.generateAuthToken();
    res.cookie("token", token);

    res.status(200).json({
      // Changed to 200 OK, which is more standard for a successful login
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        createdAt: user.createdAt,
        fullname: user.fullname,
        role: user.role, // <-- Include role in the response
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res
      .status(500)
      .json({ status: "fail", message: "Server error during login." });
  }
};

// user profile
const getUser = async (req, res) => {
  // Note: For enhanced security, you might also want to protect this route
  // to ensure only admins can get arbitrary user profiles.
  try {
    const user = await userModel.findById(req.params.id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "No user found with that ID." });
    }

    res.status(200).json({ status: "success", data: { user } });
  } catch (error) {
    // ... (error handling remains the same)
  }
};

// update user
const updateUser = async (req, res) => {
  // CRITICAL SECURITY CHECK:
  // A user can only update their own profile, unless they are an admin.
  // req.user is attached by your authMiddleware.
  if (req.params.id !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to perform this action.",
    });
  }

  try {
    // Prevent a user from updating their own role.
    if (req.body.role) {
      return res
        .status(403)
        .json({ status: "fail", message: "You cannot change your own role." });
    }

    if (req.body.password) {
      return res.status(400).json({
        status: "fail",
        message: "This route is not for password updates.",
      });
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID to update.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully.",
      data: { user: updatedUser },
    });
  } catch (error) {
    // ... (error handling remains the same)
  }
};

// logout user
const logoutUser = async (req, res, next) => {
  // This function is fine as is, no changes needed.
  try {
    const token =
      req.cookies.token ||
      (req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : undefined);
    if (!token) {
      return res
        .status(400)
        .json({ message: "Already logged out or no token provided." });
    }
    await blackListTokenModel.create({ token });
    res.clearCookie("token");
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (err) {
    // ... (error handling remains the same)
  }
};

// remove user
const deleteUser = async (req, res) => {
  // CRITICAL SECURITY CHECK:
  // A user can only delete their own profile, unless they are an admin.
  if (req.params.id !== req.user._id.toString() && req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to perform this action.",
    });
  }

  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID to delete.",
      });
    }

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    // ... (error handling remains the same)
  }
};

module.exports = {
  register,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  logoutUser,
};
