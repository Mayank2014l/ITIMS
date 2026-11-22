// =============================================================
// DUPLICATE IP VALIDATION  (one reusable helper for ALL modules)
// -------------------------------------------------------------
// Rules:
//  1. IP must be a valid IPv4 address (e.g. 192.168.1.10).
//  2. IpAddress table: the same IP cannot be entered twice.
//  3. Device modules (Computer, AccessPoint, Server, CCTV, NetworkDevice,
//     Firewall): an IP cannot be used by two devices, and cannot be taken
//     if the IpAddress table says it is ALLOCATED/RESERVED for someone else.
//  Any conflict -> HTTP 409 with a clear message.
// =============================================================
const prisma = require('../prisma/client');
const { AppError } = require('../utils/response');

// Simple IPv4 check: 4 numbers (0-255) separated by dots
function isValidIPv4(ip) {
  const parts = String(ip).trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255 && String(Number(p)) === p);
}

// All device tables that store a plain "ipAddress" text field
const DEVICE_MODELS = {
  accessPoint: { label: 'Access Point', nameField: 'name' },
  server: { label: 'Server', nameField: 'name' },
  cctvCamera: { label: 'CCTV Camera', nameField: 'cameraName' },
  networkDevice: { label: 'Network Device', nameField: 'name' },
  firewall: { label: 'Firewall', nameField: 'name' },
};

// Check one IP for conflicts.
// model    = the table being saved ('server', 'computer', 'ipAddress', ...)
// id       = id of the record being updated (null when creating)
// deviceName = name of the device being saved (to allow its own IP)
async function checkIpConflict({ ip, model, id = null, deviceName = null }) {
  if (!ip) return; // IP is optional for devices
  ip = String(ip).trim();

  if (!isValidIPv4(ip)) {
    throw new AppError(`"${ip}" is not a valid IPv4 address (example: 192.168.1.10).`, 400);
  }

  // Rule 2: IpAddress table itself
  if (model === 'ipAddress') {
    const existing = await prisma.ipAddress.findUnique({ where: { ipAddress: ip } });
    if (existing && existing.id !== Number(id)) {
      throw new AppError(`Duplicate IP: ${ip} already exists in IP Address Management.`, 409);
    }
    return;
  }

  // Rule 3a: is the IP used by another device in any device table?
  for (const [m, info] of Object.entries(DEVICE_MODELS)) {
    const where = { ipAddress: ip };
    if (m === model && id) where.NOT = { id: Number(id) }; // ignore the record itself
    const clash = await prisma[m].findFirst({ where });
    if (clash) {
      throw new AppError(`Duplicate IP: ${ip} is already assigned to ${info.label} "${clash[info.nameField]}".`, 409);
    }
  }
  // Computers store IP via relation (ipId)
  const pcWhere = { ip: { ipAddress: ip } };
  if (model === 'computer' && id) pcWhere.NOT = { id: Number(id) };
  const pc = await prisma.computer.findFirst({ where: pcWhere });
  if (pc) throw new AppError(`Duplicate IP: ${ip} is already assigned to Computer "${pc.name}".`, 409);

  // Rule 3b: is it allocated/reserved for someone else in the IP table?
  const ipRow = await prisma.ipAddress.findUnique({ where: { ipAddress: ip } });
  if (ipRow && ipRow.status !== 'FREE' && ipRow.deviceName && ipRow.deviceName !== deviceName) {
    throw new AppError(`Duplicate IP: ${ip} is ${ipRow.status} to "${ipRow.deviceName}" in IP Address Management.`, 409);
  }
}

// After a device is saved, keep the IP table in sync:
// mark the IP as ALLOCATED to this device (create the row if missing).
async function allocateIp({ ip, deviceType, deviceName }) {
  if (!ip) return;
  await prisma.ipAddress.upsert({
    where: { ipAddress: ip },
    update: { status: 'ALLOCATED', deviceType, deviceName, assignedDate: new Date() },
    create: { ipAddress: ip, status: 'ALLOCATED', deviceType, deviceName, assignedDate: new Date(), remarks: 'Auto-allocated' },
  });
}

// When a device changes/removes its IP, free the old one
async function releaseIp(ip, deviceName) {
  if (!ip) return;
  await prisma.ipAddress.updateMany({
    where: { ipAddress: ip, deviceName },
    data: { status: 'FREE', deviceType: null, deviceName: null, assignedDate: null },
  });
}

module.exports = { isValidIPv4, checkIpConflict, allocateIp, releaseIp, DEVICE_MODELS };
