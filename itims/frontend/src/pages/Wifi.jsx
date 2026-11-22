// Module 8: Wi-Fi & Access Point Management
import { Wifi } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';

const config = {
  endpoint: '/access-points',
  entity: 'Access Point',
  ip: { field: 'ipAddress', model: 'accessPoint', nameField: 'name' },
  columns: [
    { key: 'name', label: 'AP Name', render: (r) => <span className="flex items-center gap-2 font-medium text-slate-900"><Wifi className={`h-4 w-4 ${r.status === 'ONLINE' ? 'text-emerald-500' : 'text-red-400'}`} />{r.name}</span> },
    { key: 'location', label: 'Location' },
    { key: 'ipAddress', label: 'IP Address', render: (r) => <span className="font-mono text-xs">{r.ipAddress}</span> },
    { key: 'macAddress', label: 'MAC Address', render: (r) => <span className="font-mono text-xs">{r.macAddress}</span> },
    { key: 'ssid', label: 'SSID', render: (r) => <StatusBadge value={r.ssid} color="indigo" /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [{ name: 'status', label: 'Status', options: ['ONLINE', 'OFFLINE'] }, { name: 'ssid', label: 'SSIDs', options: ['ORG-Staff', 'ORG-Guest', 'ORG-Plant'] }],
  fields: [
    { name: 'name', label: 'AP Name', required: true },
    { name: 'location', label: 'Location' },
    { name: 'ipAddress', label: 'IP Address', placeholder: '10.10.30.30' },
    { name: 'macAddress', label: 'MAC Address' },
    { name: 'ssid', label: 'SSID' },
    { name: 'status', label: 'Status', type: 'select', options: ['ONLINE', 'OFFLINE'], required: true },
  ],
  defaults: { status: 'ONLINE' },
};

export default function WifiPage() {
  return (
    <div>
      <PageHeader title="Wi-Fi & Access Points" subtitle="Wireless access points, SSIDs and their online status" icon={Wifi} />
      <CrudPage config={config} />
    </div>
  );
}
