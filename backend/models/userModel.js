const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      firstname: {
        type: String,
        require: true,
        minlength: [3, "First name Should be at least three characters long"],
      },
      lastname: {
        type: String,
        require: true,
        minlength: [3, "Last name Should be at least three characters long"],
      },
    },
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },

    // ======================= ROLE FIELD ADDED HERE =======================
    role: {
      type: String,
      // enum ensures the role can only be one of these two values
      enum: ["user", "admin"],
      // By default, any new user will have the 'user' role
      default: "user",
    },
    // =====================================================================

    verifyOtp: {
      type: String,
      default: null,
    },
    verifyOtpExpire: {
      type: Boolean,
      default: false,
    },

    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/kz-cloud/image/upload/v1739721991/gbl7pu9pdzw5w3wkxuqp.svg",
    },

    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Date,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    // THE FIX: Add 'role: this.role' to the payload
    { _id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  return token;
};

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
