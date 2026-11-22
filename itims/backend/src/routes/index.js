// Main API router - every URL below starts with /api
const express = require('express');
const { protect, allow } = require('../middleware/auth');
const crudRouter = require('./crudRouter');

const auth = require('../controllers/authController');
const users = require('../controllers/userController');
const ips = require('../controllers/ipController');
const complaints = require('../controllers/complaintController');
const dashboard = require('../controllers/dashboardController');
const m = require('../controllers/moduleControllers');

const router = express.Router();

// ---- Public ----
router.post('/auth/login', auth.login);

// ---- Everything below needs a valid JWT ----
router.use(protect);
router.get('/auth/me', auth.me);

// Users: staff list for dropdowns is open to all; management is ADMIN only
router.get('/users/staff', users.staff);
router.get('/users', allow('ADMIN'), users.list);
router.post('/users', allow('ADMIN'), users.create);
router.put('/users/:id', allow('ADMIN'), users.update);
router.delete('/users/:id', allow('ADMIN'), users.remove);

router.get('/dashboard/stats', dashboard.stats);

router.use('/ips', crudRouter(ips, (r) => {
  r.get('/summary', ips.summary);
  r.get('/check', ips.check);
}));

router.use('/complaints', crudRouter(complaints, (r) => {
  r.patch('/:id/assign', complaints.assign);
  r.patch('/:id/status', complaints.changeStatus);
}));

router.use('/computers', crudRouter(m.computers));
router.use('/hardware', crudRouter(m.hardware));
router.use('/network-devices', crudRouter(m.networkDevices));
router.use('/switches', crudRouter(m.switches));
router.use('/isps', crudRouter(m.isps));
router.use('/firewalls', crudRouter(m.firewalls));
router.use('/access-points', crudRouter(m.accessPoints));
router.use('/servers', crudRouter(m.servers));
router.use('/cctv', crudRouter(m.cctv));
router.use('/maintenance', crudRouter(m.maintenance));

module.exports = router;
