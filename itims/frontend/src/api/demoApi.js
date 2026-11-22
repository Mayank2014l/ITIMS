import axios from 'axios';

const demoUser = { id: 1, name: 'Admin User', email: 'admin@itims.com', role: 'ADMIN', createdAt: '2025-01-10T09:00:00.000Z' };
const staffUser = { id: 2, name: 'Jamie Patel', email: 'staff@itims.com', role: 'IT_STAFF', createdAt: '2025-02-01T09:00:00.000Z' };
const data = {
  computers: [
    { id: 1, assetTag: 'AST-PC-001', name: 'PC-HR-01', assignedTo: 'Anita Rao', department: 'HR', location: 'Block A', processor: 'Intel Core i5', ram: '16 GB', storage: '512 GB SSD', os: 'Windows 11', status: 'ACTIVE', purchaseDate: '2024-02-14', ipId: 2, ip: { id: 2, ipAddress: '10.10.20.21', subnet: '10.10.20.0/24', vlan: 'VLAN 20' } },
    { id: 2, assetTag: 'AST-PC-002', name: 'PC-FIN-04', assignedTo: 'Rahul Das', department: 'Finance', location: 'Block B', processor: 'Intel Core i7', ram: '16 GB', storage: '1 TB SSD', os: 'Windows 11', status: 'ACTIVE', purchaseDate: '2023-08-20', ipId: 3, ip: { id: 3, ipAddress: '10.10.20.22', subnet: '10.10.20.0/24', vlan: 'VLAN 20' } },
    { id: 3, assetTag: 'AST-LT-003', name: 'LT-OPS-02', assignedTo: 'Maya Singh', department: 'IT', location: 'Block A', processor: 'Intel Core i5', ram: '8 GB', storage: '512 GB SSD', os: 'Windows 10', status: 'UNDER_REPAIR', purchaseDate: '2022-05-01', ipId: null, ip: null },
  ],
  hardware: [
    { id: 1, itemType: 'Printer', brand: 'HP', model: 'LaserJet Pro', serialNo: 'HP-PR-2024-01', location: 'Block A · Floor 1', status: 'ACTIVE', purchaseDate: '2024-01-15', warrantyEnd: '2027-01-15' },
    { id: 2, itemType: 'UPS', brand: 'APC', model: 'Smart-UPS 1500', serialNo: 'APC-UPS-118', location: 'Server Room', status: 'ACTIVE', purchaseDate: '2023-06-10', warrantyEnd: '2026-06-10' },
  ],
  ips: [
    { id: 1, ipAddress: '10.10.10.1', subnet: '10.10.10.0/24', vlan: 'VLAN 10', deviceType: 'Router', deviceName: 'Core Router', status: 'ALLOCATED', assignedDate: '2024-01-01', remarks: 'Gateway' },
    { id: 2, ipAddress: '10.10.20.21', subnet: '10.10.20.0/24', vlan: 'VLAN 20', deviceType: 'Computer', deviceName: 'PC-HR-01', status: 'ALLOCATED', assignedDate: '2024-02-14' },
    { id: 3, ipAddress: '10.10.20.22', subnet: '10.10.20.0/24', vlan: 'VLAN 20', deviceType: 'Computer', deviceName: 'PC-FIN-04', status: 'ALLOCATED', assignedDate: '2023-08-20' },
    { id: 4, ipAddress: '10.10.20.25', subnet: '10.10.20.0/24', vlan: 'VLAN 20', status: 'FREE' },
    { id: 5, ipAddress: '10.10.30.10', subnet: '10.10.30.0/24', vlan: 'VLAN 30', deviceType: 'Access Point', deviceName: 'AP-Lobby', status: 'ALLOCATED' },
    { id: 6, ipAddress: '10.10.40.10', subnet: '10.10.40.0/24', vlan: 'VLAN 40', status: 'RESERVED' },
  ],
  'network-devices': [
    { id: 1, name: 'Core Router', type: 'Router', brand: 'Cisco', model: 'ISR 4331', location: 'Server Room', ipAddress: '10.10.10.1', status: 'ACTIVE', switches: [] },
    { id: 2, name: 'Core Switch 01', type: 'Switch', brand: 'Cisco', model: 'Catalyst 9300', location: 'Server Room', ipAddress: '10.10.10.2', status: 'ACTIVE', switches: [{ id: 1 }] },
    { id: 3, name: 'Access Switch A', type: 'Switch', brand: 'Aruba', model: '2930F', location: 'Block A', ipAddress: '10.10.10.3', status: 'ACTIVE', switches: [{ id: 2 }] },
  ],
  switches: [
    { id: 1, networkDeviceId: 2, networkDevice: { id: 2, name: 'Core Switch 01' }, totalPorts: 48, portNumber: 1, connectedDevice: 'Core Router', vlan: 'VLAN 10', portStatus: 'UP' },
    { id: 2, networkDeviceId: 3, networkDevice: { id: 3, name: 'Access Switch A' }, totalPorts: 24, portNumber: 8, connectedDevice: 'AP-Lobby', vlan: 'VLAN 30', portStatus: 'UP' },
    { id: 3, networkDeviceId: 3, networkDevice: { id: 3, name: 'Access Switch A' }, totalPorts: 24, portNumber: 12, connectedDevice: 'PC-HR-01', vlan: 'VLAN 20', portStatus: 'DOWN' },
  ],
  isps: [
    { id: 1, providerName: 'Airtel Business', linkType: 'PRIMARY', bandwidth: '300 Mbps', circuitId: 'AIR-882104', staticIp: '203.0.113.10', contactPerson: 'Support Desk', contactNumber: '1800-000-100', status: 'ACTIVE' },
    { id: 2, providerName: 'Jio Enterprise', linkType: 'BACKUP', bandwidth: '150 Mbps', circuitId: 'JIO-552018', staticIp: '198.51.100.20', contactPerson: 'NOC Team', contactNumber: '1800-000-200', status: 'DOWN' },
  ],
  firewalls: [
    { id: 1, name: 'Perimeter Firewall', brand: 'Fortinet', model: 'FortiGate 100F', ipAddress: '10.10.10.254', firmwareVersion: '7.2.8', policiesSummary: 'Inbound filtering, IPS, VPN, web filtering', licenseExpiry: '2027-03-31', status: 'ACTIVE' },
  ],
  'access-points': [
    { id: 1, name: 'AP-Lobby', location: 'Main Lobby', ipAddress: '10.10.30.10', macAddress: '00:11:22:33:44:55', ssid: 'ORG-Staff', status: 'ONLINE' },
    { id: 2, name: 'AP-Production', location: 'Production Floor', ipAddress: '10.10.30.11', macAddress: '00:11:22:33:44:66', ssid: 'ORG-Plant', status: 'ONLINE' },
    { id: 3, name: 'AP-Conference', location: 'Conference Room', ipAddress: '10.10.30.12', macAddress: '00:11:22:33:44:77', ssid: 'ORG-Guest', status: 'OFFLINE' },
  ],
  servers: [
    { id: 1, name: 'ITIMS-APP-01', role: 'Application Server', brand: 'Dell PowerEdge R650', os: 'Ubuntu Server 22.04', ipAddress: '10.10.10.15', rackNumber: 'Rack A · U12', patchPanel: 'PP-A-12', location: 'Server Room', status: 'ACTIVE' },
    { id: 2, name: 'FILE-SRV-01', role: 'File Server', brand: 'HPE ProLiant DL360', os: 'Windows Server 2022', ipAddress: '10.10.10.16', rackNumber: 'Rack A · U14', patchPanel: 'PP-A-14', location: 'Server Room', status: 'ACTIVE' },
  ],
  cctv: [
    { id: 1, cameraName: 'Main Gate', cameraType: 'IP', location: 'Entrance', recorderType: 'NVR', recorderName: 'NVR-01', ipAddress: '10.10.40.11', status: 'WORKING' },
    { id: 2, cameraName: 'Warehouse Aisle 2', cameraType: 'IP', location: 'Warehouse', recorderType: 'NVR', recorderName: 'NVR-01', ipAddress: '10.10.40.12', status: 'WORKING' },
    { id: 3, cameraName: 'Loading Bay', cameraType: 'ANALOG', location: 'Loading Bay', recorderType: 'DVR', recorderName: 'DVR-01', ipAddress: null, status: 'NOT_WORKING' },
  ],
  maintenance: [
    { id: 1, deviceType: 'Server', deviceName: 'FILE-SRV-01', recordType: 'MAINTENANCE', description: 'Quarterly backup restore test and disk health check', date: '2025-10-12', performedBy: 'Alex Morgan', remarks: 'Completed successfully' },
    { id: 2, deviceType: 'ISP', deviceName: 'Jio Enterprise', recordType: 'ISP_DOWNTIME', description: 'Intermittent packet loss reported to provider', date: '2025-10-20', performedBy: 'Network Team', remarks: 'Provider investigating' },
    { id: 3, deviceType: 'Firewall', deviceName: 'Perimeter Firewall', recordType: 'SECURITY_INCIDENT', description: 'Blocked repeated login attempts from external address', date: '2025-10-22', performedBy: 'Security Team', remarks: 'No impact to services' },
  ],
  complaints: [
    { id: 1, ticketNo: 'TKT-0024', title: 'Unable to print from Finance', description: 'Queue is stuck on the shared printer.', category: 'Hardware', priority: 'HIGH', status: 'OPEN', raisedBy: 'Rahul Das · Finance', assignedToId: null, assignedTo: null, createdAt: '2025-10-23T09:15:00.000Z' },
    { id: 2, ticketNo: 'TKT-0023', title: 'Wi-Fi drops in Conference Room', description: 'Connection disconnects during meetings.', category: 'Network', priority: 'MEDIUM', status: 'IN_PROGRESS', raisedBy: 'Maya Singh · IT', assignedToId: 2, assignedTo: { id: 2, name: 'Jamie Patel', role: 'IT_STAFF' }, createdAt: '2025-10-22T11:30:00.000Z' },
    { id: 3, ticketNo: 'TKT-0022', title: 'Camera feed not available', description: 'Loading bay camera is offline.', category: 'CCTV', priority: 'CRITICAL', status: 'RESOLVED', raisedBy: 'Security Desk', assignedToId: 2, assignedTo: { id: 2, name: 'Jamie Patel', role: 'IT_STAFF' }, createdAt: '2025-10-19T08:00:00.000Z', resolvedAt: '2025-10-20T14:30:00.000Z', resolutionNote: 'Replaced damaged network cable.' },
    { id: 4, ticketNo: 'TKT-0021', title: 'VPN access request', description: 'New remote access for project work.', category: 'Network', priority: 'LOW', status: 'CLOSED', raisedBy: 'Anita Rao · HR', assignedToId: 1, assignedTo: { id: 1, name: 'Alex Morgan', role: 'ADMIN' }, createdAt: '2025-10-16T10:00:00.000Z', resolvedAt: '2025-10-16T12:00:00.000Z', closedAt: '2025-10-17T09:00:00.000Z', resolutionNote: 'VPN access enabled and verified.' },
  ],
  users: [
    { ...demoUser },
    { id: 2, name: 'Jamie Patel', email: 'jamie.patel@itims.demo', role: 'IT_STAFF', createdAt: '2025-02-01T09:00:00.000Z' },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const ok = (payload, message = 'OK') => ({ success: true, data: payload, message });

function dashboardStats() {
  const count = (rows, key, value) => rows.filter((row) => row[key] === value).length;
  const categories = ['Hardware', 'Network', 'Software', 'CCTV', 'ISP', 'Other'];
  const statuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  return {
    cards: {
      totalComputers: data.computers.length,
      totalDevices: data.hardware.length + data['network-devices'].length + data.firewalls.length + data.servers.length + data['access-points'].length + data.cctv.length,
      activeIsp: count(data.isps, 'status', 'ACTIVE'),
      totalIsp: data.isps.length,
      pendingComplaints: data.complaints.filter((c) => ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length,
      cctvWorking: count(data.cctv, 'status', 'WORKING'),
      cctvNotWorking: count(data.cctv, 'status', 'NOT_WORKING'),
      freeIps: count(data.ips, 'status', 'FREE'),
      apOnline: count(data['access-points'], 'status', 'ONLINE'),
      totalAps: data['access-points'].length,
    },
    charts: {
      computerStatus: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'].map((name) => ({ name, value: count(data.computers, 'status', name) })),
      complaintCategory: categories.map((name) => ({ name, value: count(data.complaints, 'category', name) })),
      complaintStatus: statuses.map((name) => ({ name, value: count(data.complaints, 'status', name) })),
      isps: clone(data.isps),
    },
    recentComplaints: clone(data.complaints.slice(0, 5)),
  };
}

function requestUrl(config) {
  if (/^https?:\/\//i.test(config.url)) return new URL(config.url);
  const base = (config.baseURL || '').replace(/\/+$/, '');
  const path = (config.url || '').replace(/^\/+/, '');
  return new URL(`${base}/${path}`);
}

function listResponse(collection, params) {
  let rows = [...collection];
  for (const [key, value] of Object.entries(params)) {
    if (['search', 'page', 'limit'].includes(key) || value === '' || value == null) continue;
    rows = rows.filter((row) => String(row[key] ?? '') === String(value));
  }
  if (params.search) {
    const search = String(params.search).toLowerCase();
    rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(search));
  }
  const total = rows.length;
  const limit = Number(params.limit || 10);
  const page = Math.max(1, Number(params.page || 1));
  const items = limit === 0 ? rows : rows.slice((page - 1) * limit, page * limit);
  return { items: clone(items), page, pages: limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit)), total };
}

function handleRequest(config) {
  const url = requestUrl(config);
  const path = url.pathname.replace(/^\/api\/?/, '/').replace(/\/+$/, '') || '/';
  const method = (config.method || 'get').toLowerCase();
  const params = { ...Object.fromEntries(url.searchParams), ...(config.params || {}) };

  if (method === 'post' && path === '/auth/login') {
    let email = 'admin@itims.com';
    try {
      const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      if (body.email) email = body.email;
    } catch {}
    const isStaff = email.toLowerCase().includes('staff');
    const user = isStaff ? staffUser : demoUser;
    return ok({ token: 'demo-session', user: clone(user) }, 'Login successful');
  }
  if (method === 'get' && path === '/dashboard/stats') return ok(dashboardStats());
  if (method === 'get' && path === '/ips/summary') {
    const summary = { total: data.ips.length };
    for (const status of ['ALLOCATED', 'FREE', 'RESERVED']) summary[status] = data.ips.filter((ip) => ip.status === status).length;
    summary.subnets = [...new Set(data.ips.map((ip) => ip.subnet).filter(Boolean))];
    summary.vlans = [...new Set(data.ips.map((ip) => ip.vlan).filter(Boolean))];
    return ok(summary);
  }
  if (method === 'get' && path === '/ips/check') {
    const exists = data.ips.some((ip) => ip.ipAddress === params.ip && String(ip.id) !== String(params.id || ''));
    if (exists) throw new Error('This IP address is already in use');
    return ok({ available: true });
  }
  if (method === 'get' && path === '/users/staff') return ok(clone(data.users));

  const entry = Object.entries(data).find(([key]) => path === `/${key}` || path.startsWith(`/${key}/`));
  if (method === 'get' && entry) return ok(listResponse(entry[1], params));
  if (entry && ['post', 'put', 'delete'].includes(method)) {
    const [, collection] = entry;
    const idMatch = path.match(/\/(\d+)$/);
    if (method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
      const id = Math.max(0, ...collection.map((row) => Number(row.id) || 0)) + 1;
      const row = { ...body, id, createdAt: body.createdAt || new Date().toISOString() };
      if (entry[0] === 'complaints') {
        row.ticketNo = `TKT-${String(24 + id).padStart(4, '0')}`;
        row.status = row.status || 'OPEN';
        row.assignedToId = null;
        row.assignedTo = null;
      }
      if (entry[0] === 'computers') row.ip = clone(data.ips.find((ip) => ip.id === Number(row.ipId)) || null);
      collection.unshift(row);
      return ok(clone(row), 'Created successfully');
    }
    if (!idMatch) throw new Error('Demo record ID is required');
    const index = collection.findIndex((row) => String(row.id) === idMatch[1]);
    if (index < 0) throw new Error('Demo record not found');
    if (method === 'delete') return ok(collection.splice(index, 1)[0], 'Deleted successfully');
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    collection[index] = { ...collection[index], ...body };
    if (entry[0] === 'network-devices' && collection[index].type === 'Switch' && !collection[index].switches) collection[index].switches = [];
    return ok(clone(collection[index]), 'Updated successfully');
  }

  const complaintAction = path.match(/^\/complaints\/(\d+)\/(assign|status)$/);
  if (complaintAction && method === 'patch') {
    const [, id, action] = complaintAction;
    const complaint = data.complaints.find((row) => String(row.id) === id);
    if (!complaint) throw new Error('Demo complaint not found');
    const body = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});
    if (action === 'assign') {
      complaint.assignedToId = Number(body.assignedToId);
      complaint.assignedTo = clone(data.users.find((user) => user.id === complaint.assignedToId) || null);
      complaint.priority = body.priority || complaint.priority;
      complaint.status = 'ASSIGNED';
    } else {
      complaint.status = body.status;
      if (body.resolutionNote) {
        complaint.resolutionNote = body.resolutionNote;
        complaint.resolvedAt = new Date().toISOString();
      }
      if (body.status === 'CLOSED') complaint.closedAt = new Date().toISOString();
    }
    return ok(clone(complaint), 'Complaint updated');
  }

  throw new Error(`Demo mode does not support ${method.toUpperCase()} ${path}`);
}

export default function demoAdapter(config) {
  return Promise.resolve().then(() => ({
    data: handleRequest(config),
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: null,
  }));
}
