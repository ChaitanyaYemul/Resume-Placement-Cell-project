module.exports = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  res.status(403).json({ success: false, message: "Forbidden", errors: [] });
};