// User management (ADMIN only). Passwords are always stored as bcrypt hashes.
const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');
const { ok, AppError } = require('../utils/response');

const safe = { id: true, name: true, email: true, role: true, createdAt: true }; // never select password

async function list(req, res, next) {
  try {
    const { search = '', role } = req.query;
    const where = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }];
    if (role) where.role = role;
    const items = await prisma.user.findMany({ where, select: safe, orderBy: { id: 'asc' } });
    ok(res, { items, total: items.length, page: 1, pages: 1 });
  } catch (err) { next(err); }
}

// GET /api/users/staff -> list for "Assign to" dropdown (any logged-in user)
async function staff(req, res, next) {
  try {
    ok(res, await prisma.user.findMany({ select: { id: true, name: true, role: true }, orderBy: { name: 'asc' } }));
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) throw new AppError('Name, email and password are required.', 400);
    if (password.length < 6) throw new AppError('Password must be at least 6 characters.', 400);
    const user = await prisma.user.create({
      data: { name, email: email.toLowerCase().trim(), role: role || 'IT_STAFF', password: await bcrypt.hash(password, 10) },
      select: safe,
    });
    ok(res, user, 'User created', 201);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const data = { name, role };
    if (email) data.email = email.toLowerCase().trim();
    if (password) data.password = await bcrypt.hash(password, 10); // change password only if given
    const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data, select: safe });
    ok(res, user, 'User updated');
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    if (Number(req.params.id) === req.user.id) throw new AppError('You cannot delete your own account.', 400);
    await prisma.user.delete({ where: { id: Number(req.params.id) } });
    ok(res, null, 'User deleted');
  } catch (err) { next(err); }
}

module.exports = { list, staff, create, update, remove };
