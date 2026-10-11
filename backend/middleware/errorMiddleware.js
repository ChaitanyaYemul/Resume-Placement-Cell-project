module.exports = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";
  let errors = [];

  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid value for ${err.path}`;
  }

  if (status === 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Internal server error";
  }
  res.status(status).json({ success: false, message, errors });
};