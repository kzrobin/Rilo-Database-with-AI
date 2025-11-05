const User = require("../models/userModel");

module.exports.homeController = (req, res) => {
  res.send("Hello Home Route");
};
