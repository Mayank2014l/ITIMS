// Module 4: IP Address Management (with duplicate IP validation + Free/Allocated summary)
import { useEffect, useState } from 'react';
import { Binary, CheckCircle2, CircleDot, Lock, Layers } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import CrudPage from '../components/CrudPage';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, toInputDate } from '../utils/format';

export default function IpManagement() {
  const [summary, setSummary] = useState(null);
  const loadSummary = () => api.get('/ips/summary').then((r) => setSummary(r.data.data));
  useEffect(() => { loadSummary(); }, []);

  const used = summary ? Math.round((summary.ALLOCATED / Math.max(1, summary.total)) * 100) : 0;

  const config = {
    endpoint: '/ips',
    entity: 'IP Address',
    ip: { field: 'ipAddress', model: 'ipAddress', nameField: 'deviceName' }, // live duplicate check
    columns: [
      { key: 'ipAddress', label: 'IP Address', render: (r) => <span className="font-mono font-semibold text-slate-900">{r.ipAddress}</span> },
      { key: 'subnet', label: 'Subnet', render: (r) => <span className="font-mono text-xs">{r.subnet}</span> },
      { key: 'vlan', label: 'VLAN' },
      { key: 'deviceType', label: 'Device Type' },
      { key: 'deviceName', label: 'Device Name', render: (r) => r.deviceName || <span className="text-slate-300">—</span> },
      { key: 'assignedDate', label: 'Assigned', render: (r) => fmtDate(r.assignedDate) },
      { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    ],
    filters: [
      { name: 'status', label: 'Status', options: ['ALLOCATED', 'FREE', 'RESERVED'] },
      { name: 'subnet', label: 'Subnets', options: summary?.subnets || [] },
      { name: 'vlan', label: 'VLANs', options: summary?.vlans || [] },
    ],
    fields: [
      { name: 'ipAddress', label: 'IP Address', required: true, placeholder: '10.10.20.21', hint: 'Must be a valid & unique IPv4 address' },
      { name: 'subnet', label: 'Subnet', placeholder: '10.10.20.0/24' },
      { name: 'vlan', label: 'VLAN', placeholder: 'VLAN 20 - Users' },
      { name: 'status', label: 'Status', type: 'select', options: ['ALLOCATED', 'FREE', 'RESERVED'], required: true },
      { name: 'deviceType', label: 'Device Type', placeholder: 'Computer / Printer / Server' },
      { name: 'deviceName', label: 'Device Name' },
      { name: 'assignedDate', label: 'Assigned Date', type: 'date' },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
    defaults: { status: 'FREE' },
    toForm: (r) => ({ ...r, assignedDate: toInputDate(r.assignedDate) }),
    onChanged: loadSummary,
  };

  return (
    <div>
      <PageHeader title="IP Address Management" subtitle="IP pool, subnets and VLANs — duplicate IPs are blocked automatically" icon={Binary} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total IPs" value={summary?.total} icon={Layers} tone="indigo" />
        <StatCard title="Allocated" value={summary?.ALLOCATED} icon={CircleDot} tone="blue" hint={`${used}% of pool used`} />
        <StatCard title="Free" value={summary?.FREE} icon={CheckCircle2} tone="green" />
        <StatCard title="Reserved" value={summary?.RESERVED} icon={Lock} tone="amber" />
      </div>
      <CrudPage config={config} />
    </div>
  );
}
