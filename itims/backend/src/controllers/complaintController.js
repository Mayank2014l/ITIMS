// =============================================================
// IT COMPLAINTS - ticket workflow
//   OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
// (RESOLVED can go back to IN_PROGRESS if the user is not satisfied)
// =============================================================
const prisma = require('../prisma/client');
const makeCrud = require('./crudFactory');
const { ok, AppError } = require('../utils/response');

const include = { assignedTo: { select: { id: true, name: true, email: true } } };

const crud = makeCrud('complaint', {
  searchFields: ['ticketNo', 'title', 'description', 'raisedBy'],
  filterFields: ['status', 'priority', 'category', 'assignedToId'],
  intFields: ['assignedToId'],
  include,
});

// Which status can move to which next status
const NEXT = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
};

// Make the next ticket number: TKT-0001, TKT-0002 ...
async function nextTicketNo() {
  const last = await prisma.complaint.findFirst({ orderBy: { id: 'desc' } });
  const n = last ? parseInt(last.ticketNo.split('-')[1], 10) + 1 : 1;
  return 'TKT-' + String(n).padStart(4, '0');
}

// POST /api/complaints  -> always starts as OPEN
async function create(req, res, next) {
  try {
    const { title, category, priority, description, raisedBy } = req.body;
    if (!title || !category) throw new AppError('Title and category are required.', 400);
    const item = await prisma.complaint.create({
      data: {
        ticketNo: await nextTicketNo(),
        title, category, description,
        priority: priority || 'MEDIUM',
        raisedBy: raisedBy || req.user.name,
        status: 'OPEN',
      },
      include,
    });
    ok(res, item, `Complaint ${item.ticketNo} created`, 201);
  } catch (err) { next(err); }
}

// PUT /api/complaints/:id -> edit only the basic details (not the workflow)
async function update(req, res, next) {
  try {
    const { title, category, priority, description, raisedBy } = req.body;
    const item = await prisma.complaint.update({
      where: { id: Number(req.params.id) },
      data: { title, category, priority, description, raisedBy },
      include,
    });
    ok(res, item, 'Complaint updated');
  } catch (err) { next(err); }
}

// PATCH /api/complaints/:id/assign  { assignedToId, priority }
async function assign(req, res, next) {
  try {
    const id = Number(req.params.id);
    const c = await prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new AppError('Complaint not found.', 404);
    if (['RESOLVED', 'CLOSED'].includes(c.status)) throw new AppError(`Cannot assign a ${c.status} complaint.`, 400);
    if (!req.body.assignedToId) throw new AppError('Please select an IT staff member.', 400);

    const staff = await prisma.user.findUnique({ where: { id: Number(req.body.assignedToId) } });
    if (!staff) throw new AppError('Selected staff member not found.', 400);

    const item = await prisma.complaint.update({
      where: { id },
      data: {
        assignedToId: staff.id,
        priority: req.body.priority || c.priority,
        status: c.status === 'OPEN' ? 'ASSIGNED' : c.status, // re-assign keeps current status
      },
      include,
    });
    ok(res, item, `Assigned to ${staff.name}`);
  } catch (err) { next(err); }
}

// PATCH /api/complaints/:id/status  { status, resolutionNote }
async function changeStatus(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { status, resolutionNote } = req.body;
    const c = await prisma.complaint.findUnique({ where: { id } });
    if (!c) throw new AppError('Complaint not found.', 404);

    if (!NEXT[c.status].includes(status)) {
      throw new AppError(`Invalid step: cannot move from ${c.status} to ${status}. Allowed: ${NEXT[c.status].join(', ') || 'none'}.`, 400);
    }
    const data = { status };
    if (status === 'RESOLVED') {
      if (!resolutionNote) throw new AppError('Resolution note is required to resolve a complaint.', 400);
      data.resolutionNote = resolutionNote;
      data.resolvedAt = new Date();
    }
    if (status === 'CLOSED') data.closedAt = new Date();
    if (status === 'IN_PROGRESS' && c.status === 'RESOLVED') data.resolvedAt = null; // re-opened

    const item = await prisma.complaint.update({ where: { id }, data, include });
    ok(res, item, `Status changed to ${status}`);
  } catch (err) { next(err); }
}

module.exports = { ...crud, create, update, assign, changeStatus };
