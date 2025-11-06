const { validationResult } = require("express-validator");
const userModel = require("../models/userModel");
const blackListTokenModel = require("../models/tokenBlackListModel.js");

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

    const hashPassword = await userModel.hashPassword(password);

    const newUser = await userModel.create({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      username,
      email,
      password: hashPassword,
    });

    // gen token
    const token = newUser.generateAuthToken();
    res.cookie("token", token);

    res.status(201).json({
      message: "User created successfully.",
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        fullname: newUser.fullname,
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

// user login
const loginUser = async (req, res, next) => {
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

  // gen token
  const token = user.generateAuthToken();
  res.cookie("token", token);

  res.status(201).json({
    message: "Login successfull",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      fullname: user.fullname,
    },
  });
};

// user profile
const getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);

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

// logout user
const logoutUser = async (req, res, next) => {
  try {
    const token =
      req.cookies.token ||
      (req.headers.Authorization
        ? req.headers.authorization.split(" ")[1]
        : undefined);

    if (!token) {
      return res.status(400).json({ message: "Unauthorized access" });
    }

    // Add the token to the blacklist
    await blackListTokenModel.create({ token });

    // Clear the cookie
    res.clearCookie("token");

    // response
    return res.status(200).json({ message: "Logout Successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: err.message,
    });
  }
};

// remove user
const deleteUser = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);

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
  loginUser,
  logoutUser,
};
