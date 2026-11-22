// Module 7: Firewall & Security - firewalls, policy summary, security incidents
import { useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, toInputDate } from '../utils/format';
import recordConfig from './recordConfig';

// License badge: red if expired, yellow if < 60 days left
function License({ date }) {
  if (!date) return '—';
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  const color = days < 0 ? 'red' : days < 60 ? 'yellow' : 'green';
  return <StatusBadge value={`${fmtDate(date)}${days < 0 ? ' (expired)' : days < 60 ? ` (${days}d left)` : ''}`} color={color} />;
}

const fwConfig = {
  endpoint: '/firewalls',
  entity: 'Firewall',
  ip: { field: 'ipAddress', model: 'firewall', nameField: 'name' },
  columns: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'brand', label: 'Brand / Model', render: (r) => <span>{r.brand} <span className="text-slate-400">{r.model}</span></span> },
    { key: 'ipAddress', label: 'IP', render: (r) => <span className="font-mono text-xs">{r.ipAddress}</span> },
    { key: 'firmwareVersion', label: 'Firmware' },
    { key: 'policiesSummary', label: 'Policies', render: (r) => <span className="block max-w-xs truncate text-xs text-slate-500" title={r.policiesSummary}>{r.policiesSummary}</span> },
    { key: 'licenseExpiry', label: 'License Expiry', render: (r) => <License date={r.licenseExpiry} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [{ name: 'status', label: 'Status', options: ['ACTIVE', 'STANDBY', 'INACTIVE'] }],
  fields: [
    { name: 'name', label: 'Firewall Name', required: true },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'ipAddress', label: 'IP Address' },
    { name: 'firmwareVersion', label: 'Firmware Version' },
    { name: 'licenseExpiry', label: 'License Expiry', type: 'date' },
    { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'STANDBY', 'INACTIVE'], required: true },
    { name: 'policiesSummary', label: 'Policies Summary', type: 'textarea' },
  ],
  defaults: { status: 'ACTIVE' },
  toForm: (r) => ({ ...r, licenseExpiry: toInputDate(r.licenseExpiry) }),
};

export default function FirewallPage() {
  const [tab, setTab] = useState('fw');
  return (
    <div>
      <PageHeader title="Firewall & Security" subtitle="Perimeter firewalls, policies, licences and security incidents" icon={ShieldCheck} />
      <Tabs tabs={[{ key: 'fw', label: 'Firewalls', icon: ShieldCheck }, { key: 'inc', label: 'Security Incidents', icon: ShieldAlert }]} active={tab} onChange={setTab} />
      {tab === 'fw'
        ? <CrudPage key="fw" config={fwConfig} />
        : <CrudPage key="inc" config={recordConfig({ recordType: 'SECURITY_INCIDENT', entity: 'Security Incident', deviceType: 'Firewall' })} />}
    </div>
  );
}
