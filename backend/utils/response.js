exports.ok = (res, data, message = "OK", status = 200) =>
  res.status(status).json({ success: true, message, data });

exports.fail = (res, message, status = 400, errors = []) =>
  res.status(status).json({ success: false, message, errors });