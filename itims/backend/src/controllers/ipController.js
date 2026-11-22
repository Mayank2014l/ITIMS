// IP Address Management = generic CRUD + duplicate check + summary
const prisma = require('../prisma/client');
const makeCrud = require('./crudFactory');
const { ok } = require('../utils/response');
const { checkIpConflict } = require('../middleware/ipValidator');

const crud = makeCrud('ipAddress', {
  searchFields: ['ipAddress', 'deviceName', 'deviceType', 'subnet', 'remarks'],
  filterFields: ['status', 'subnet', 'vlan'],
  dateFields: ['assignedDate'],
  orderBy: { id: 'asc' },
});

// Before create/update: validate IPv4 format + reject duplicates (HTTP 409)
async function create(req, res, next) {
  try {
    await checkIpConflict({ ip: req.body.ipAddress, model: 'ipAddress' });
    return crud.create(req, res, next);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    if (req.body.ipAddress) await checkIpConflict({ ip: req.body.ipAddress, model: 'ipAddress', id: req.params.id });
    return crud.update(req, res, next);
  } catch (err) { next(err); }
}

// GET /api/ips/summary -> counts + list of subnets and VLANs for the filters
async function summary(req, res, next) {
  try {
    const byStatus = await prisma.ipAddress.groupBy({ by: ['status'], _count: true });
    const counts = { ALLOCATED: 0, FREE: 0, RESERVED: 0 };
    byStatus.forEach((r) => { counts[r.status] = r._count; });
    const subnets = (await prisma.ipAddress.findMany({ distinct: ['subnet'], select: { subnet: true } })).map((r) => r.subnet).filter(Boolean);
    const vlans = (await prisma.ipAddress.findMany({ distinct: ['vlan'], select: { vlan: true } })).map((r) => r.vlan).filter(Boolean);
    ok(res, { total: counts.ALLOCATED + counts.FREE + counts.RESERVED, ...counts, subnets, vlans });
  } catch (err) { next(err); }
}

// GET /api/ips/check?ip=1.2.3.4 -> lets the frontend show an inline error while typing
async function check(req, res, next) {
  try {
    await checkIpConflict({ ip: req.query.ip, model: req.query.model || 'ipAddress', id: req.query.id, deviceName: req.query.deviceName });
    ok(res, { available: true }, 'IP is available');
  } catch (err) { next(err); }
}

module.exports = { ...crud, create, update, summary, check };
