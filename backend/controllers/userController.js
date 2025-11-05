const { validationResult } = require("express-validator");
const User = require("../models/userModel");

// register user
const createUser = async (req, res, next) => {
  console.log("Reached");
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ errors: errors.array(), message: "Data validation error" });
    }

    const { username, email, password, fullname } = req.body;

    const hashPassword = await User.hashPassword(password);

    const newUser = await User.create({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      username,
      email,
      password: hashPassword,
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully.",
      data: {
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          createdAt: newUser.createdAt,
        },
      },
    });
  } catch (error) {
    let message = "An error occurred while creating the user.";
    let statusCode = 500; // Internal Server Error by default

    if (error.code === 11000) {
      statusCode = 409; // Conflict
      const field = Object.keys(error.keyValue)[0];
      message = `An account with that ${field} already exists.`;
    }

    if (error.name === "ValidationError") {
      statusCode = 400; // Bad Request
      message = Object.values(error.errors)
        .map((val) => val.message)
        .join(". ");
    }

    console.error("CREATE USER ERROR:", error);
    res.status(statusCode).json({
      status: "fail",
      message,
    });
  }
};

// user profile
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID.",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("GET USER ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while fetching the user.",
    });
  }
};

// update user
const updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      return res.status(400).json({
        status: "fail",
        message:
          "This route is not for password updates. Please use /update-password.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID to update.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "User updated successfully.",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    let message = "An error occurred while updating the user.";
    let statusCode = 500;

    if (error.code === 11000) {
      statusCode = 409; // Conflict
      const field = Object.keys(error.keyValue)[0];
      message = `An account with that ${field} already exists.`;
    }

    console.error("UPDATE USER ERROR:", error);
    res.status(statusCode).json({
      status: "fail",
      message,
    });
  }
};

// remove user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "No user found with that ID to delete.",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({
      status: "fail",
      message: "An error occurred while deleting the user.",
    });
  }
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  deleteUser,
};
