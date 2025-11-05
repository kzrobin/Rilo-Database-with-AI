const User = require("../models/User");

module.exports.homeController = (req, res) => {
  res.send("Hello Home Route");
};
