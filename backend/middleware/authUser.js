const tokenBlackListModel = require("../models/tokenBlackListModel.js");
const userModel = require("../models/userModel.js");
const jwt = require("jsonwebtoken");

const authuser = async (req, res, next) => {
  const token =
    req.cookies.token ||
    (req.headers.Authorization
      ? req.headers.authorization.split(" ")[1]
      : undefined);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
  const isBlacklisted = await tokenBlackListModel.findOne({ token: token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decode._id);

    const userData = {
      _id: user._id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
    };
    req.user = userData;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

module.exports = authuser;
