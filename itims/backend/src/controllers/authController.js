// Login and "who am I" endpoints
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const { ok, AppError } = require('../utils/response');

// POST /api/auth/login  { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required.', 400);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    // Compare typed password with the stored bcrypt hash
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError('Invalid email or password.', 401);
    }

    // Create a JWT token valid for 1 day
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const { password: _, ...safeUser } = user; // remove password before sending
    ok(res, { token, user: safeUser }, 'Login successful');
  } catch (err) { next(err); }
}

// GET /api/auth/me  -> returns the logged-in user
async function me(req, res) {
  ok(res, req.user);
}

module.exports = { login, me };
