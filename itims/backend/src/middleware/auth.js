// Authentication + role based access control (RBAC)
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { AppError } = require('../utils/response');

// 1) protect: checks the "Authorization: Bearer <token>" header
async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new AppError('Not logged in. Please login first.', 401);

    // Verify the token signature using our secret key
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user (without password) and attach to the request
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new AppError('User no longer exists.', 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired token. Please login again.', 401));
    }
    next(err);
  }
}

// 2) allow(...roles): only lets the listed roles continue
//    Example: allow('ADMIN') on DELETE routes
function allow(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action.', 403));
    }
    next();
  };
}

module.exports = { protect, allow };
