// GET /api/dashboard/stats -> all numbers needed by the dashboard in ONE call
const prisma = require('../prisma/client');
const { ok } = require('../utils/response');

// Helper: turn Prisma groupBy result into [{ name, value }] for charts
const toChart = (rows, key) => rows.map((r) => ({ name: r[key], value: r._count }));

async function stats(req, res, next) {
  try {
    const [
      totalComputers, totalHardware, totalNetwork, totalServers, totalAps, totalFirewalls,
      activeIsp, totalIsp, pendingComplaints, cctvWorking, cctvNotWorking, freeIps,
      computerStatus, complaintCategory, complaintStatus, isps, recentComplaints, apOnline,
    ] = await Promise.all([
      prisma.computer.count(),
      prisma.hardwareInventory.count(),
      prisma.networkDevice.count(),
      prisma.server.count(),
      prisma.accessPoint.count(),
      prisma.firewall.count(),
      prisma.isp.count({ where: { status: 'ACTIVE' } }),
      prisma.isp.count(),
      prisma.complaint.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.cctvCamera.count({ where: { status: 'WORKING' } }),
      prisma.cctvCamera.count({ where: { status: 'NOT_WORKING' } }),
      prisma.ipAddress.count({ where: { status: 'FREE' } }),
      prisma.computer.groupBy({ by: ['status'], _count: true }),
      prisma.complaint.groupBy({ by: ['category'], _count: true }),
      prisma.complaint.groupBy({ by: ['status'], _count: true }),
      prisma.isp.findMany({ select: { providerName: true, linkType: true, status: true, bandwidth: true } }),
      prisma.complaint.findMany({ take: 6, orderBy: { createdAt: 'desc' }, include: { assignedTo: { select: { name: true } } } }),
      prisma.accessPoint.count({ where: { status: 'ONLINE' } }),
    ]);

    ok(res, {
      cards: {
        totalComputers,
        totalDevices: totalHardware + totalNetwork + totalServers + totalAps + totalFirewalls + cctvWorking + cctvNotWorking,
        activeIsp, totalIsp, pendingComplaints, cctvWorking, cctvNotWorking, freeIps,
        apOnline, totalAps,
      },
      charts: {
        computerStatus: toChart(computerStatus, 'status'),
        complaintCategory: toChart(complaintCategory, 'category'),
        complaintStatus: toChart(complaintStatus, 'status'),
        isps,
      },
      recentComplaints,
    });
  } catch (err) { next(err); }
}

module.exports = { stats };
