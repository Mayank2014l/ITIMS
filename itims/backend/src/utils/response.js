// Helpers so EVERY API reply has the same shape: { success, data, message }

// Send a success reply
function ok(res, data = null, message = 'OK', status = 200) {
  return res.status(status).json({ success: true, data, message });
}

// A custom error that carries an HTTP status code (e.g. 400, 404, 409)
class AppError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

module.exports = { ok, AppError };
