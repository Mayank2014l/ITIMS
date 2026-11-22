// All "simple" modules are created here with ONE line each using the generic CRUD factory.
// "ip" option switches on the reusable duplicate-IP validation.
const makeCrud = require('./crudFactory');

module.exports = {
  computers: makeCrud('computer', {
    searchFields: ['assetTag', 'name', 'assignedTo', 'department', 'location', 'macAddress'],
    filterFields: ['status', 'department'],
    dateFields: ['purchaseDate'],
    intFields: ['ipId'],
    include: { ip: true },
    ip: { field: 'ipId', nameField: 'name', deviceType: 'Computer' },
  }),
  hardware: makeCrud('hardwareInventory', {
    searchFields: ['itemType', 'brand', 'model', 'serialNo', 'location'],
    filterFields: ['status', 'itemType'],
    dateFields: ['purchaseDate', 'warrantyEnd'],
  }),
  networkDevices: makeCrud('networkDevice', {
    searchFields: ['name', 'type', 'brand', 'model', 'location', 'ipAddress'],
    filterFields: ['status', 'type'],
    include: { switches: true },
    orderBy: { id: 'asc' },
    ip: { field: 'ipAddress', nameField: 'name', deviceType: 'Network Device' },
  }),
  switches: makeCrud('switch', {
    searchFields: ['connectedDevice', 'vlan'],
    filterFields: ['portStatus', 'networkDeviceId'],
    intFields: ['networkDeviceId', 'totalPorts', 'portNumber'],
    include: { networkDevice: { select: { id: true, name: true } } },
    orderBy: [{ networkDeviceId: 'asc' }, { portNumber: 'asc' }],
  }),
  isps: makeCrud('isp', {
    searchFields: ['providerName', 'circuitId', 'staticIp', 'contactPerson'],
    filterFields: ['status', 'linkType'],
    orderBy: { id: 'asc' },
  }),
  firewalls: makeCrud('firewall', {
    searchFields: ['name', 'brand', 'model', 'ipAddress', 'firmwareVersion'],
    dateFields: ['licenseExpiry'],
    ip: { field: 'ipAddress', nameField: 'name', deviceType: 'Firewall' },
  }),
  accessPoints: makeCrud('accessPoint', {
    searchFields: ['name', 'location', 'ipAddress', 'macAddress', 'ssid'],
    filterFields: ['status', 'ssid'],
    ip: { field: 'ipAddress', nameField: 'name', deviceType: 'Access Point' },
  }),
  servers: makeCrud('server', {
    searchFields: ['name', 'role', 'brand', 'os', 'ipAddress', 'rackNumber'],
    ip: { field: 'ipAddress', nameField: 'name', deviceType: 'Server' },
  }),
  cctv: makeCrud('cctvCamera', {
    searchFields: ['cameraName', 'location', 'recorderName', 'ipAddress'],
    filterFields: ['status', 'cameraType', 'recorderType'],
    orderBy: { id: 'asc' },
    ip: { field: 'ipAddress', nameField: 'cameraName', deviceType: 'CCTV Camera' },
  }),
  maintenance: makeCrud('maintenanceRecord', {
    searchFields: ['deviceType', 'deviceName', 'description', 'performedBy'],
    filterFields: ['recordType', 'deviceType'],
    dateFields: ['date'],
    orderBy: { date: 'desc' },
  }),
};
