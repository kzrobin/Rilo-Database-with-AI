// middleware/roleMiddleware.js
const restrictToAdmin = (req, res, next) => {
  // This assumes your user model has a 'role' property, e.g., 'user' or 'admin'
  // console.log(req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "fail",
      message: "You do not have permission to perform this action.",
    });
  }
  next();
};

module.exports = { restrictToAdmin };
