// =============================================================
// GENERIC CRUD FACTORY
// -------------------------------------------------------------
// Instead of writing list/get/create/update/delete again and again
// for every table, we call makeCrud('server', options) and get all
// five controller functions ready-made.
//
// options:
//   searchFields : text columns used by ?search=
//   filterFields : columns that can be filtered exactly, e.g. ?status=ACTIVE
//   dateFields   : columns converted from "2024-01-31" string to Date
//   intFields    : columns converted from string to number
//   include      : related tables to load (Prisma include)
//   orderBy      : default sort
//   ip           : { field, nameField, deviceType } -> turns on duplicate-IP check
// =============================================================
const prisma = require('../prisma/client');
const { ok, AppError } = require('../utils/response');
const { checkIpConflict, allocateIp, releaseIp } = require('../middleware/ipValidator');

function makeCrud(model, options = {}) {
  const {
    searchFields = [],
    filterFields = ['status'],
    dateFields = [],
    intFields = [],
    include = undefined,
    orderBy = { id: 'desc' },
    ip = null,
  } = options;

  const table = prisma[model];

  // Clean the request body before saving
  function clean(body) {
    const data = { ...body };
    delete data.id; // never let the client change the id
    for (const key of Object.keys(data)) {
      // Remove nested objects (e.g. "ip": {...} sent back by the frontend)
      if (data[key] !== null && typeof data[key] === 'object' && !(data[key] instanceof Date)) delete data[key];
      else if (data[key] === '') data[key] = null; // empty input -> NULL
      else if (typeof data[key] === 'string') data[key] = data[key].trim();
    }
    dateFields.forEach((f) => { if (data[f]) data[f] = new Date(data[f]); });
    intFields.forEach((f) => { if (data[f] !== undefined && data[f] !== null) data[f] = Number(data[f]); });
    return data;
  }

  // Find the IP string a record is using (works for both text field and ipId relation)
  async function ipOf(data) {
    if (!ip) return null;
    if (ip.field === 'ipId') {
      if (!data.ipId) return null;
      const row = await prisma.ipAddress.findUnique({ where: { id: Number(data.ipId) } });
      if (!row) throw new AppError('Selected IP address does not exist.', 400);
      return row.ipAddress;
    }
    return data[ip.field] || null;
  }

  // GET /api/<module>?search=&status=&page=1&limit=10
  async function list(req, res, next) {
    try {
      const { search = '', page = 1, limit = 10 } = req.query;
      const where = {};

      // Text search across several columns (case-insensitive)
      if (search && searchFields.length) {
        where.OR = searchFields.map((f) => ({ [f]: { contains: search, mode: 'insensitive' } }));
      }
      // Exact filters like ?status=ACTIVE&location=Block A
      filterFields.forEach((f) => {
        if (req.query[f]) where[f] = intFields.includes(f) ? Number(req.query[f]) : req.query[f];
      });

      const take = Number(limit) === 0 ? undefined : Number(limit); // limit=0 -> all rows (for reports)
      const skip = take ? (Number(page) - 1) * take : undefined;

      const [items, total] = await Promise.all([
        table.findMany({ where, include, orderBy, skip, take }),
        table.count({ where }),
      ]);
      ok(res, { items, total, page: Number(page), pages: take ? Math.max(1, Math.ceil(total / take)) : 1 });
    } catch (err) { next(err); }
  }

  // GET /api/<module>/:id
  async function getOne(req, res, next) {
    try {
      const item = await table.findUnique({ where: { id: Number(req.params.id) }, include });
      if (!item) throw new AppError('Record not found.', 404);
      ok(res, item);
    } catch (err) { next(err); }
  }

  // POST /api/<module>
  async function create(req, res, next) {
    try {
      const data = clean(req.body);
      const ipValue = await ipOf(data);
      if (ip) await checkIpConflict({ ip: ipValue, model, deviceName: data[ip.nameField] });

      const item = await table.create({ data, include });
      if (ip) await allocateIp({ ip: ipValue, deviceType: ip.deviceType, deviceName: data[ip.nameField] });
      ok(res, item, 'Created successfully', 201);
    } catch (err) { next(err); }
  }

  // PUT /api/<module>/:id
  async function update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const old = await table.findUnique({ where: { id } });
      if (!old) throw new AppError('Record not found.', 404);

      const data = clean(req.body);
      const merged = { ...old, ...data };
      const ipValue = await ipOf(merged);
      const oldIp = await ipOf(old);
      // Allow the device to keep its own IP even if its name changes
      if (ip) await checkIpConflict({ ip: ipValue, model, id, deviceName: ipValue === oldIp ? old[ip.nameField] : merged[ip.nameField] });

      const item = await table.update({ where: { id }, data, include });
      if (ip) {
        if (oldIp && (oldIp !== ipValue || old[ip.nameField] !== merged[ip.nameField])) await releaseIp(oldIp, old[ip.nameField]);
        await allocateIp({ ip: ipValue, deviceType: ip.deviceType, deviceName: merged[ip.nameField] });
      }
      ok(res, item, 'Updated successfully');
    } catch (err) { next(err); }
  }

  // DELETE /api/<module>/:id   (ADMIN only - checked in routes)
  async function remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      const old = await table.findUnique({ where: { id } });
      if (!old) throw new AppError('Record not found.', 404);
      await table.delete({ where: { id } });
      if (ip) await releaseIp(await ipOf(old), old[ip.nameField]); // free the IP again
      ok(res, null, 'Deleted successfully');
    } catch (err) { next(err); }
  }

  return { list, getOne, create, update, remove };
}

module.exports = makeCrud;
