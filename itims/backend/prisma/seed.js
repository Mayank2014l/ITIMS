// =============================================================
// SEED: fills the database with realistic demo data
// Run with:  npx prisma db seed
// =============================================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const d = (s) => new Date(s);
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// Subnet / VLAN plan of the organisation
const NET = {
  infra: { subnet: '10.10.10.0/24', vlan: 'VLAN 10 - Infra' },
  users: { subnet: '10.10.20.0/24', vlan: 'VLAN 20 - Users' },
  wifi: { subnet: '10.10.30.0/24', vlan: 'VLAN 30 - WiFi' },
  cctv: { subnet: '10.10.40.0/24', vlan: 'VLAN 40 - CCTV' },
};

// We collect every IP a device uses, then save them into the IpAddress table as ALLOCATED
const allocated = [];
const use = (ip, net, deviceType, deviceName) => { allocated.push({ ipAddress: ip, ...NET[net], deviceType, deviceName }); return ip; };

async function main() {
  console.log('Clearing old data...');
  // Delete in child -> parent order
  await prisma.complaint.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.switch.deleteMany();
  await prisma.computer.deleteMany();
  await prisma.ipAddress.deleteMany();
  await prisma.networkDevice.deleteMany();
  await prisma.hardwareInventory.deleteMany();
  await prisma.isp.deleteMany();
  await prisma.firewall.deleteMany();
  await prisma.accessPoint.deleteMany();
  await prisma.server.deleteMany();
  await prisma.cctvCamera.deleteMany();
  await prisma.user.deleteMany();

  // ---------------- USERS ----------------
  console.log('Seeding users...');
  const admin = await prisma.user.create({ data: { name: 'Rajesh Kumar', email: 'admin@itims.com', password: await bcrypt.hash('Admin@123', 10), role: 'ADMIN' } });
  const staff = await prisma.user.create({ data: { name: 'Amit Verma', email: 'staff@itims.com', password: await bcrypt.hash('Staff@123', 10), role: 'IT_STAFF' } });
  const staff2 = await prisma.user.create({ data: { name: 'Neha Singh', email: 'neha@itims.com', password: await bcrypt.hash('Staff@123', 10), role: 'IT_STAFF' } });
  const staff3 = await prisma.user.create({ data: { name: 'Vikram Rao', email: 'vikram@itims.com', password: await bcrypt.hash('Staff@123', 10), role: 'IT_STAFF' } });

  // ---------------- NETWORK DEVICES ----------------
  console.log('Seeding network devices...');
  const net = [
    { name: 'Core-Router-01', type: 'Router', brand: 'Cisco', model: 'ISR 4331', location: 'Server Room', ipAddress: use('10.10.10.1', 'infra', 'Router', 'Core-Router-01'), status: 'ACTIVE' },
    { name: 'Core-Switch-01', type: 'Switch', brand: 'Cisco', model: 'Catalyst 9300-48P', location: 'Server Room', ipAddress: use('10.10.10.2', 'infra', 'Switch', 'Core-Switch-01'), status: 'ACTIVE' },
    { name: 'Access-Switch-Admin', type: 'Switch', brand: 'HP Aruba', model: '2930F-24G', location: 'Admin Block', ipAddress: use('10.10.10.3', 'infra', 'Switch', 'Access-Switch-Admin'), status: 'ACTIVE' },
    { name: 'Access-Switch-Plant', type: 'Switch', brand: 'D-Link', model: 'DGS-1210-28', location: 'Plant Office', ipAddress: use('10.10.10.4', 'infra', 'Switch', 'Access-Switch-Plant'), status: 'ACTIVE' },
    { name: 'ISP-Modem-Airtel', type: 'Modem', brand: 'Huawei', model: 'HG8245H', location: 'Server Room', ipAddress: use('10.10.10.5', 'infra', 'Modem', 'ISP-Modem-Airtel'), status: 'ACTIVE' },
  ];
  const netRows = [];
  for (const n of net) netRows.push(await prisma.networkDevice.create({ data: n }));

  // Switch port details for the three switches
  const ports = [
    [netRows[1], 48, [[1, 'Core-Router-01', 'VLAN 10', 'UP'], [2, 'FW-Primary', 'VLAN 10', 'UP'], [3, 'Access-Switch-Admin', 'Trunk', 'UP'], [4, 'Access-Switch-Plant', 'Trunk', 'UP'], [5, 'SRV-DC01', 'VLAN 10', 'UP'], [6, 'SRV-FILE01', 'VLAN 10', 'UP'], [7, 'SRV-ERP01', 'VLAN 10', 'UP'], [8, 'NVR-Main', 'VLAN 40', 'DOWN']]],
    [netRows[2], 24, [[1, 'Core-Switch-01 (Uplink)', 'Trunk', 'UP'], [2, 'PC-HR-01', 'VLAN 20', 'UP'], [3, 'PC-FIN-01', 'VLAN 20', 'UP'], [4, 'AP-Admin-Lobby', 'VLAN 30', 'UP'], [5, 'Printer-HR', 'VLAN 20', 'DOWN']]],
    [netRows[3], 24, [[1, 'Core-Switch-01 (Uplink)', 'Trunk', 'UP'], [2, 'PC-PROD-01', 'VLAN 20', 'UP'], [3, 'AP-Plant-Floor', 'VLAN 30', 'UP'], [4, 'Cam-Gate-01', 'VLAN 40', 'UP']]],
  ];
  for (const [dev, total, list] of ports) {
    for (const [portNumber, connectedDevice, vlan, portStatus] of list) {
      await prisma.switch.create({ data: { networkDeviceId: dev.id, totalPorts: total, portNumber, connectedDevice, vlan, portStatus } });
    }
  }

  // ---------------- FIREWALLS ----------------
  console.log('Seeding firewalls...');
  await prisma.firewall.createMany({ data: [
    { name: 'FW-Primary', brand: 'Fortinet', model: 'FortiGate 100F', ipAddress: use('10.10.10.254', 'infra', 'Firewall', 'FW-Primary'), firmwareVersion: 'FortiOS 7.4.3', policiesSummary: '42 policies: LAN->WAN allow, block P2P & torrent, social media blocked for staff VLAN, VPN for 25 remote users, IPS enabled', licenseExpiry: d('2027-03-31'), status: 'ACTIVE' },
    { name: 'FW-Backup', brand: 'Sophos', model: 'XGS 2100', ipAddress: use('10.10.10.253', 'infra', 'Firewall', 'FW-Backup'), firmwareVersion: 'SFOS 20.0', policiesSummary: 'HA standby: mirror of primary policies, web filtering, anti-virus gateway', licenseExpiry: d('2026-12-15'), status: 'STANDBY' },
  ] });

  // ---------------- SERVERS ----------------
  console.log('Seeding servers...');
  await prisma.server.createMany({ data: [
    { name: 'SRV-DC01', role: 'Domain Controller / DNS', brand: 'Dell PowerEdge R650', os: 'Windows Server 2022', ipAddress: use('10.10.10.10', 'infra', 'Server', 'SRV-DC01'), rackNumber: 'Rack-A', patchPanel: 'PP-A1 Port 05', location: 'Server Room', status: 'ACTIVE' },
    { name: 'SRV-FILE01', role: 'File Server', brand: 'HPE ProLiant DL380', os: 'Windows Server 2019', ipAddress: use('10.10.10.11', 'infra', 'Server', 'SRV-FILE01'), rackNumber: 'Rack-A', patchPanel: 'PP-A1 Port 06', location: 'Server Room', status: 'ACTIVE' },
    { name: 'SRV-ERP01', role: 'ERP Application (SAP)', brand: 'Dell PowerEdge R750', os: 'SUSE Linux 15', ipAddress: use('10.10.10.12', 'infra', 'Server', 'SRV-ERP01'), rackNumber: 'Rack-B', patchPanel: 'PP-B1 Port 01', location: 'Server Room', status: 'ACTIVE' },
    { name: 'SRV-MAIL01', role: 'Mail Relay', brand: 'Lenovo ThinkSystem SR630', os: 'Ubuntu 22.04', ipAddress: use('10.10.10.13', 'infra', 'Server', 'SRV-MAIL01'), rackNumber: 'Rack-B', patchPanel: 'PP-B1 Port 02', location: 'Server Room', status: 'ACTIVE' },
    { name: 'SRV-BACKUP01', role: 'Backup (Veeam)', brand: 'Synology RS1221+', os: 'DSM 7.2', ipAddress: use('10.10.10.14', 'infra', 'Server', 'SRV-BACKUP01'), rackNumber: 'Rack-B', patchPanel: 'PP-B1 Port 03', location: 'Server Room', status: 'UNDER_MAINTENANCE' },
  ] });

  // ---------------- ACCESS POINTS ----------------
  console.log('Seeding access points...');
  const aps = [
    ['AP-Admin-Lobby', 'Admin Block - Lobby', '21', 'ORG-Staff', 'ONLINE'],
    ['AP-Admin-Floor1', 'Admin Block - 1st Floor', '22', 'ORG-Staff', 'ONLINE'],
    ['AP-Conference', 'Conference Hall', '23', 'ORG-Guest', 'ONLINE'],
    ['AP-Canteen', 'Canteen', '24', 'ORG-Guest', 'OFFLINE'],
    ['AP-Plant-Floor', 'Plant - Shop Floor', '25', 'ORG-Plant', 'ONLINE'],
    ['AP-Plant-Store', 'Plant - Stores', '26', 'ORG-Plant', 'ONLINE'],
    ['AP-Training', 'Training Centre', '27', 'ORG-Staff', 'OFFLINE'],
    ['AP-Security', 'Main Gate Security', '28', 'ORG-Staff', 'ONLINE'],
  ];
  await prisma.accessPoint.createMany({ data: aps.map(([name, location, last, ssid, status], i) => ({
    name, location, ssid, status,
    ipAddress: use(`10.10.30.${last}`, 'wifi', 'Access Point', name),
    macAddress: `F0:9F:C2:1A:3B:${(16 + i).toString(16).toUpperCase().padStart(2, '0')}`,
  })) });

  // ---------------- CCTV (12 cameras) ----------------
  console.log('Seeding CCTV cameras...');
  const cams = [
    ['Cam-Gate-01', 'IP', 'Main Gate - Entry', 'NVR', 'NVR-Main', '10.10.40.11', 'WORKING'],
    ['Cam-Gate-02', 'IP', 'Main Gate - Exit', 'NVR', 'NVR-Main', '10.10.40.12', 'WORKING'],
    ['Cam-Parking', 'IP', 'Parking Area', 'NVR', 'NVR-Main', '10.10.40.13', 'NOT_WORKING'],
    ['Cam-Lobby', 'IP', 'Admin Lobby', 'NVR', 'NVR-Main', '10.10.40.14', 'WORKING'],
    ['Cam-ServerRoom', 'IP', 'Server Room', 'NVR', 'NVR-Main', '10.10.40.15', 'WORKING'],
    ['Cam-Stores', 'IP', 'Plant Stores', 'NVR', 'NVR-Plant', '10.10.40.16', 'WORKING'],
    ['Cam-Plant-A', 'ANALOG', 'Shop Floor A', 'DVR', 'DVR-Plant-01', null, 'WORKING'],
    ['Cam-Plant-B', 'ANALOG', 'Shop Floor B', 'DVR', 'DVR-Plant-01', null, 'WORKING'],
    ['Cam-Dispatch', 'ANALOG', 'Dispatch Bay', 'DVR', 'DVR-Plant-01', null, 'NOT_WORKING'],
    ['Cam-Canteen', 'ANALOG', 'Canteen', 'DVR', 'DVR-Admin-01', null, 'WORKING'],
    ['Cam-Boundary-N', 'ANALOG', 'Boundary Wall North', 'DVR', 'DVR-Admin-01', null, 'WORKING'],
    ['Cam-Boundary-S', 'ANALOG', 'Boundary Wall South', 'DVR', 'DVR-Admin-01', null, 'NOT_WORKING'],
  ];
  await prisma.cctvCamera.createMany({ data: cams.map(([cameraName, cameraType, location, recorderType, recorderName, ip, status]) => ({
    cameraName, cameraType, location, recorderType, recorderName, status,
    ipAddress: ip ? use(ip, 'cctv', 'CCTV Camera', cameraName) : null,
  })) });

  // ---------------- IP ADDRESSES ----------------
  console.log('Seeding IP addresses...');
  // 1) all device IPs collected above -> ALLOCATED
  await prisma.ipAddress.createMany({ data: allocated.map((a, i) => ({ ...a, status: 'ALLOCATED', assignedDate: daysAgo(400 - i * 7) })) });
  // 2) IPs for computers (allocated) + free + reserved ones
  const pcIps = ['10.10.20.11', '10.10.20.12', '10.10.20.13', '10.10.20.14', '10.10.20.15', '10.10.20.16'];
  for (const ip of pcIps) await prisma.ipAddress.create({ data: { ipAddress: ip, ...NET.users, status: 'FREE' } });
  const extra = [
    ['10.10.20.17', 'users', 'FREE'], ['10.10.20.18', 'users', 'FREE'], ['10.10.20.19', 'users', 'FREE'], ['10.10.20.20', 'users', 'FREE'],
    ['10.10.10.20', 'infra', 'FREE'], ['10.10.30.29', 'wifi', 'FREE'], ['10.10.40.17', 'cctv', 'FREE'],
    ['10.10.10.50', 'infra', 'RESERVED', 'Future SRV-APP02'], ['10.10.20.100', 'users', 'RESERVED', 'Network printer pool'],
  ];
  for (const [ip, n, status, remarks] of extra) {
    await prisma.ipAddress.create({ data: { ipAddress: ip, ...NET[n], status, remarks: remarks || null, deviceName: status === 'RESERVED' ? remarks : null } });
  }

  // ---------------- COMPUTERS (15) ----------------
  console.log('Seeding computers...');
  const pcs = [
    ['PC-HR-01', 'Priya Sharma', 'HR', 'Admin Block', 'Intel Core i5-12400', '16 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2023-04-10'],
    ['PC-HR-02', 'Rohit Mehta', 'HR', 'Admin Block', 'Intel Core i5-12400', '8 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2023-04-10'],
    ['PC-FIN-01', 'Sunita Gupta', 'Finance', 'Admin Block', 'Intel Core i7-12700', '16 GB', '1 TB SSD', 'Windows 11 Pro', 'ACTIVE', '2023-01-15'],
    ['PC-FIN-02', 'Manoj Tiwari', 'Finance', 'Admin Block', 'Intel Core i5-11400', '8 GB', '256 GB SSD', 'Windows 10 Pro', 'UNDER_REPAIR', '2021-08-22'],
    ['PC-IT-01', 'Amit Verma', 'IT', 'Server Room', 'AMD Ryzen 7 5700G', '32 GB', '1 TB NVMe', 'Ubuntu 22.04', 'ACTIVE', '2024-02-01'],
    ['PC-IT-02', 'Neha Singh', 'IT', 'Server Room', 'Intel Core i7-13700', '32 GB', '1 TB NVMe', 'Windows 11 Pro', 'ACTIVE', '2024-02-01'],
    ['PC-PROD-01', 'Harpreet Singh', 'Production', 'Plant Office', 'Intel Core i3-10100', '8 GB', '500 GB HDD', 'Windows 10 Pro', 'ACTIVE', '2020-11-05'],
    ['PC-PROD-02', 'Gurpreet Kaur', 'Production', 'Plant Office', 'Intel Core i3-10100', '8 GB', '500 GB HDD', 'Windows 10 Pro', 'INACTIVE', '2020-11-05'],
    ['PC-QA-01', 'Deepak Yadav', 'Quality', 'Plant Office', 'Intel Core i5-10400', '8 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2022-06-18'],
    ['PC-STORE-01', 'Ravi Shankar', 'Stores', 'Plant Stores', 'Intel Core i3-12100', '8 GB', '256 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2023-09-12'],
    ['PC-SALES-01', 'Kavita Joshi', 'Sales', 'Admin Block', 'Intel Core i5-1235U (Laptop)', '16 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2024-05-20'],
    ['PC-SALES-02', 'Arjun Nair', 'Sales', 'Admin Block', 'Intel Core i5-1235U (Laptop)', '16 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2024-05-20'],
    ['PC-ADMIN-01', 'Meena Kumari', 'Administration', 'Admin Block', 'Intel Core i5-12400', '8 GB', '512 GB SSD', 'Windows 11 Pro', 'ACTIVE', '2023-04-10'],
    ['PC-SEC-01', 'Security Desk', 'Security', 'Main Gate', 'Intel Pentium G6400', '4 GB', '500 GB HDD', 'Windows 10 Pro', 'UNDER_REPAIR', '2019-12-01'],
    ['PC-TRN-01', 'Training Room', 'HR', 'Training Centre', 'Intel Core i5-12400', '16 GB', '512 GB SSD', 'Windows 11 Pro', 'INACTIVE', '2023-04-10'],
  ];
  for (let i = 0; i < pcs.length; i++) {
    const [name, assignedTo, department, location, processor, ram, storage, os, status, pd] = pcs[i];
    let ipId = null;
    if (i < pcIps.length) {
      // first 6 PCs get a static IP -> mark it ALLOCATED to that PC
      const row = await prisma.ipAddress.update({ where: { ipAddress: pcIps[i] }, data: { status: 'ALLOCATED', deviceType: 'Computer', deviceName: name, assignedDate: d(pd) } });
      ipId = row.id;
    }
    await prisma.computer.create({ data: {
      assetTag: `AST-PC-${String(i + 1).padStart(3, '0')}`, name, assignedTo, department, location, processor, ram, storage, os, status,
      macAddress: `3C:52:82:4D:${(32 + i).toString(16).toUpperCase()}:${(160 + i * 3).toString(16).toUpperCase()}`,
      ipId, purchaseDate: d(pd),
    } });
  }

  // ---------------- HARDWARE (10) ----------------
  console.log('Seeding hardware inventory...');
  await prisma.hardwareInventory.createMany({ data: [
    { itemType: 'Printer', brand: 'HP', model: 'LaserJet Pro M404dn', serialNo: 'VNB3K12345', location: 'HR Dept', status: 'ACTIVE', purchaseDate: d('2022-03-10'), warrantyEnd: d('2025-03-10') },
    { itemType: 'Printer', brand: 'Canon', model: 'imageRUNNER 2206N', serialNo: 'CN-IR-77821', location: 'Finance Dept', status: 'ACTIVE', purchaseDate: d('2023-07-01'), warrantyEnd: d('2026-07-01') },
    { itemType: 'Printer', brand: 'Epson', model: 'L3250 Ink Tank', serialNo: 'EPS-X8812', location: 'Plant Office', status: 'UNDER_REPAIR', purchaseDate: d('2022-10-14'), warrantyEnd: d('2024-10-14') },
    { itemType: 'Scanner', brand: 'Fujitsu', model: 'fi-7160', serialNo: 'FJ-716-0091', location: 'Admin Block', status: 'ACTIVE', purchaseDate: d('2023-02-20'), warrantyEnd: d('2026-02-20') },
    { itemType: 'UPS', brand: 'APC', model: 'Smart-UPS 10kVA', serialNo: 'APC-SRT10K-551', location: 'Server Room', status: 'ACTIVE', purchaseDate: d('2022-01-05'), warrantyEnd: d('2027-01-05') },
    { itemType: 'UPS', brand: 'Microtek', model: '1 kVA Online', serialNo: 'MT-1K-2290', location: 'Main Gate', status: 'INACTIVE', purchaseDate: d('2020-05-11'), warrantyEnd: d('2022-05-11') },
    { itemType: 'Monitor', brand: 'Dell', model: 'P2422H 24"', serialNo: 'CN-0D1-4421', location: 'IT Dept', status: 'ACTIVE', purchaseDate: d('2024-02-01'), warrantyEnd: d('2027-02-01') },
    { itemType: 'Monitor', brand: 'LG', model: '22MP400 22"', serialNo: 'LG-22-99012', location: 'Plant Office', status: 'ACTIVE', purchaseDate: d('2021-09-09'), warrantyEnd: d('2024-09-09') },
    { itemType: 'Monitor', brand: 'Samsung', model: 'S24R350 24"', serialNo: 'SM-24-55710', location: 'Finance Dept', status: 'ACTIVE', purchaseDate: d('2023-01-15'), warrantyEnd: d('2026-01-15') },
    { itemType: 'Other', brand: 'Logitech', model: 'Rally Video Conference Kit', serialNo: 'LGT-RLY-0042', location: 'Conference Hall', status: 'ACTIVE', purchaseDate: d('2024-08-30'), warrantyEnd: d('2026-08-30') },
  ] });

  // ---------------- ISP (2) ----------------
  console.log('Seeding ISPs...');
  await prisma.isp.createMany({ data: [
    { providerName: 'Airtel Business', linkType: 'PRIMARY', bandwidth: '200 Mbps (1:1 Leased Line)', circuitId: 'AIRTEL-ILL-PB-0045821', staticIp: '122.160.45.18', contactPerson: 'Sandeep Arora', contactNumber: '+91 98140 11223', status: 'ACTIVE' },
    { providerName: 'Jio Business Fibre', linkType: 'BACKUP', bandwidth: '100 Mbps (Broadband)', circuitId: 'JIO-FTTH-778120', staticIp: '49.36.112.75', contactPerson: 'Pooja Malhotra', contactNumber: '+91 70090 55441', status: 'DOWN' },
  ] });

  // ---------------- COMPLAINTS (15) ----------------
  console.log('Seeding complaints...');
  const cs = [
    ['Printer not printing in HR', 'Hardware', 'MEDIUM', 'CLOSED', 'Priya Sharma', staff, 'Replaced toner cartridge and cleared paper jam.', 30],
    ['Internet very slow in Finance', 'Network', 'HIGH', 'RESOLVED', 'Sunita Gupta', staff2, 'Faulty patch cord replaced on Access-Switch-Admin port 3.', 21],
    ['Outlook not syncing emails', 'Software', 'MEDIUM', 'CLOSED', 'Rohit Mehta', staff, 'Recreated Outlook profile.', 25],
    ['Parking camera offline', 'CCTV', 'HIGH', 'IN_PROGRESS', 'Security Desk', staff3, null, 5],
    ['Backup ISP link down', 'ISP', 'CRITICAL', 'IN_PROGRESS', 'Rajesh Kumar', staff2, null, 2],
    ['PC-FIN-02 not booting', 'Hardware', 'HIGH', 'ASSIGNED', 'Manoj Tiwari', staff, null, 3],
    ['Need SAP access for new joiner', 'Software', 'LOW', 'OPEN', 'Priya Sharma', null, null, 1],
    ['Wi-Fi not available in canteen', 'Network', 'MEDIUM', 'ASSIGNED', 'Meena Kumari', staff3, null, 4],
    ['Dispatch bay camera blurry', 'CCTV', 'LOW', 'OPEN', 'Ravi Shankar', null, null, 2],
    ['Security desk PC hangs', 'Hardware', 'MEDIUM', 'IN_PROGRESS', 'Security Desk', staff, null, 6],
    ['Antivirus expired on PC-PROD-01', 'Software', 'HIGH', 'RESOLVED', 'Harpreet Singh', staff2, 'Renewed licence and ran full scan.', 12],
    ['VPN not connecting from home', 'Network', 'MEDIUM', 'OPEN', 'Kavita Joshi', null, null, 0],
    ['Training room projector issue', 'Other', 'LOW', 'CLOSED', 'Meena Kumari', staff3, 'HDMI cable replaced.', 40],
    ['Boundary south camera no video', 'CCTV', 'CRITICAL', 'OPEN', 'Security Desk', null, null, 1],
    ['ERP server slow response', 'Software', 'HIGH', 'ASSIGNED', 'Deepak Yadav', staff2, null, 2],
  ];
  for (let i = 0; i < cs.length; i++) {
    const [title, category, priority, status, raisedBy, user, note, ago] = cs[i];
    const createdAt = daysAgo(ago);
    await prisma.complaint.create({ data: {
      ticketNo: 'TKT-' + String(i + 1).padStart(4, '0'),
      title, category, priority, status, raisedBy,
      description: `${title}. Reported by ${raisedBy}.`,
      assignedToId: user ? user.id : null,
      resolutionNote: note,
      createdAt,
      resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? new Date(createdAt.getTime() + 86400000) : null,
      closedAt: status === 'CLOSED' ? new Date(createdAt.getTime() + 2 * 86400000) : null,
    } });
  }

  // ---------------- MAINTENANCE / DOWNTIME / INCIDENTS (10) ----------------
  console.log('Seeding maintenance records...');
  await prisma.maintenanceRecord.createMany({ data: [
    { deviceType: 'Server', deviceName: 'SRV-DC01', recordType: 'MAINTENANCE', description: 'Monthly Windows patching and reboot', date: daysAgo(10), performedBy: 'Amit Verma', remarks: 'Completed in 30 mins' },
    { deviceType: 'Server', deviceName: 'SRV-BACKUP01', recordType: 'MAINTENANCE', description: 'Replaced failed HDD in RAID-5 array', date: daysAgo(3), performedBy: 'Neha Singh', remarks: 'Rebuild in progress' },
    { deviceType: 'UPS', deviceName: 'APC Smart-UPS 10kVA', recordType: 'MAINTENANCE', description: 'Quarterly battery health check', date: daysAgo(35), performedBy: 'Vendor - APC', remarks: 'Batteries OK' },
    { deviceType: 'Switch', deviceName: 'Core-Switch-01', recordType: 'MAINTENANCE', description: 'IOS upgrade to 17.9.4', date: daysAgo(60), performedBy: 'Vikram Rao', remarks: 'Done after office hours' },
    { deviceType: 'ISP', deviceName: 'Airtel Business', recordType: 'ISP_DOWNTIME', description: 'Fibre cut near highway - link down 2h 15m', date: daysAgo(18), performedBy: 'Airtel NOC', remarks: 'Auto failover to Jio worked' },
    { deviceType: 'ISP', deviceName: 'Jio Business Fibre', recordType: 'ISP_DOWNTIME', description: 'Backup link down - ONT power issue', date: daysAgo(2), performedBy: 'Jio Support', remarks: 'Ticket JIO-88213 raised' },
    { deviceType: 'ISP', deviceName: 'Airtel Business', recordType: 'ISP_DOWNTIME', description: 'Planned maintenance window 1h', date: daysAgo(45), performedBy: 'Airtel NOC', remarks: 'Notified 2 days earlier' },
    { deviceType: 'Firewall', deviceName: 'FW-Primary', recordType: 'SECURITY_INCIDENT', description: 'Brute-force VPN login attempts from foreign IPs blocked', date: daysAgo(7), performedBy: 'Rajesh Kumar', remarks: 'Geo-blocking enabled' },
    { deviceType: 'Firewall', deviceName: 'FW-Primary', recordType: 'SECURITY_INCIDENT', description: 'Malware download blocked on PC-PROD-01', date: daysAgo(12), performedBy: 'Neha Singh', remarks: 'PC scanned and cleaned' },
    { deviceType: 'Firewall', deviceName: 'FW-Backup', recordType: 'MAINTENANCE', description: 'Firmware upgraded to SFOS 20.0', date: daysAgo(28), performedBy: 'Vikram Rao', remarks: 'HA sync verified' },
  ] });

  console.log('✅ Seed complete. Login: admin@itims.com / Admin@123  |  staff@itims.com / Staff@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
