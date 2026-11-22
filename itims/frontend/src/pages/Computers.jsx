// Module 3: Computer & Hardware (two tabs, both use the generic CrudPage)
import { useState } from 'react';
import { Monitor, Printer } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, toInputDate } from '../utils/format';

const computerConfig = {
  endpoint: '/computers',
  entity: 'Computer',
  ip: { field: 'ipId', model: 'computer', nameField: 'name', live: false }, // duplicate errors shown under IP field
  columns: [
    { key: 'assetTag', label: 'Asset Tag', render: (r) => <span className="font-mono text-xs font-semibold text-indigo-600">{r.assetTag}</span> },
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'assignedTo', label: 'Assigned To' },
    { key: 'department', label: 'Department' },
    { key: 'specs', label: 'Specs', render: (r) => <span className="text-xs text-slate-500">{r.processor}<br />{r.ram} · {r.storage}</span> },
    { key: 'ip', label: 'IP Address', render: (r) => r.ip ? <span className="font-mono text-xs">{r.ip.ipAddress}</span> : <span className="text-slate-300">DHCP</span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [
    { name: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'] },
    { name: 'department', label: 'Departments', options: ['HR', 'Finance', 'IT', 'Production', 'Quality', 'Stores', 'Sales', 'Administration', 'Security'] },
  ],
  // Load FREE IPs (+ the computer's current IP) for the IP dropdown
  loadOptions: async (row) => {
    const res = await api.get('/ips', { params: { status: 'FREE', limit: 0 } });
    const list = res.data.data.items;
    if (row?.ip) list.unshift(row.ip);
    return { ips: list.map((i) => ({ value: i.id, label: `${i.ipAddress}  (${i.vlan || i.subnet || ''})` })) };
  },
  fields: (opts) => [
    { name: 'assetTag', label: 'Asset Tag', required: true, placeholder: 'AST-PC-016' },
    { name: 'name', label: 'Computer Name', required: true, placeholder: 'PC-HR-03' },
    { name: 'assignedTo', label: 'Assigned To' },
    { name: 'department', label: 'Department' },
    { name: 'location', label: 'Location' },
    { name: 'processor', label: 'Processor' },
    { name: 'ram', label: 'RAM', placeholder: '8 GB' },
    { name: 'storage', label: 'Storage', placeholder: '512 GB SSD' },
    { name: 'os', label: 'Operating System' },
    { name: 'macAddress', label: 'MAC Address', placeholder: 'AA:BB:CC:DD:EE:FF' },
    { name: 'ipId', label: 'IP Address (from IP pool)', type: 'select', options: opts.ips || [], hint: 'Only FREE IPs are listed - prevents duplicates' },
    { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'], required: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
  ],
  defaults: { status: 'ACTIVE' },
  toForm: (r) => ({ ...r, purchaseDate: toInputDate(r.purchaseDate), ipId: r.ipId ?? '' }),
};

const hardwareConfig = {
  endpoint: '/hardware',
  entity: 'Hardware Item',
  columns: [
    { key: 'itemType', label: 'Type', render: (r) => <span className="font-medium">{r.itemType}</span> },
    { key: 'brand', label: 'Brand / Model', render: (r) => <span>{r.brand} <span className="text-slate-400">{r.model}</span></span> },
    { key: 'serialNo', label: 'Serial No', render: (r) => <span className="font-mono text-xs">{r.serialNo}</span> },
    { key: 'location', label: 'Location' },
    { key: 'purchaseDate', label: 'Purchased', render: (r) => fmtDate(r.purchaseDate) },
    { key: 'warrantyEnd', label: 'Warranty', render: (r) => r.warrantyEnd ? <StatusBadge value={new Date(r.warrantyEnd) < new Date() ? 'EXPIRED' : fmtDate(r.warrantyEnd)} color={new Date(r.warrantyEnd) < new Date() ? 'red' : 'green'} /> : '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [
    { name: 'itemType', label: 'Types', options: ['Printer', 'Scanner', 'UPS', 'Monitor', 'Other'] },
    { name: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'] },
  ],
  fields: [
    { name: 'itemType', label: 'Item Type', type: 'select', options: ['Printer', 'Scanner', 'UPS', 'Monitor', 'Other'], required: true },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'serialNo', label: 'Serial No' },
    { name: 'location', label: 'Location' },
    { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'], required: true },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date' },
    { name: 'warrantyEnd', label: 'Warranty End', type: 'date' },
  ],
  defaults: { status: 'ACTIVE' },
  toForm: (r) => ({ ...r, purchaseDate: toInputDate(r.purchaseDate), warrantyEnd: toInputDate(r.warrantyEnd) }),
};

export default function Computers() {
  const [tab, setTab] = useState('computers');
  return (
    <div>
      <PageHeader title="Computer & Hardware" subtitle="Desktops, laptops, printers, scanners, UPS and monitors" icon={Monitor} />
      <Tabs tabs={[{ key: 'computers', label: 'Computers', icon: Monitor }, { key: 'hardware', label: 'Hardware Inventory', icon: Printer }]} active={tab} onChange={setTab} />
      {tab === 'computers' ? <CrudPage key="c" config={computerConfig} /> : <CrudPage key="h" config={hardwareConfig} />}
    </div>
  );
}
