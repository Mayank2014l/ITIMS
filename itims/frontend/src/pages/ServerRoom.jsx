// Module 9: Server Room - servers, rack & patch panel, maintenance records
import { useState } from 'react';
import { Server, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import recordConfig from './recordConfig';

const STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'];

const serverConfig = {
  endpoint: '/servers',
  entity: 'Server',
  ip: { field: 'ipAddress', model: 'server', nameField: 'name' },
  columns: [
    { key: 'name', label: 'Server', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'role', label: 'Role' },
    { key: 'brand', label: 'Hardware' },
    { key: 'os', label: 'OS' },
    { key: 'ipAddress', label: 'IP', render: (r) => <span className="font-mono text-xs">{r.ipAddress}</span> },
    { key: 'rack', label: 'Rack / Patch Panel', render: (r) => <span className="text-xs"><b>{r.rackNumber}</b><br /><span className="text-slate-400">{r.patchPanel}</span></span> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [{ name: 'status', label: 'Status', options: STATUSES }],
  fields: [
    { name: 'name', label: 'Server Name', required: true },
    { name: 'role', label: 'Role', placeholder: 'File Server' },
    { name: 'brand', label: 'Brand / Model' },
    { name: 'os', label: 'Operating System' },
    { name: 'ipAddress', label: 'IP Address', placeholder: '10.10.10.15' },
    { name: 'rackNumber', label: 'Rack Number' },
    { name: 'patchPanel', label: 'Patch Panel' },
    { name: 'location', label: 'Location' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  ],
  defaults: { status: 'ACTIVE', location: 'Server Room' },
};

export default function ServerRoom() {
  const [tab, setTab] = useState('srv');
  return (
    <div>
      <PageHeader title="Server Room" subtitle="Servers, racks, patch panels and maintenance log" icon={Server} />
      <Tabs tabs={[{ key: 'srv', label: 'Servers', icon: Server }, { key: 'mnt', label: 'Maintenance Records', icon: Wrench }]} active={tab} onChange={setTab} />
      {tab === 'srv'
        ? <CrudPage key="srv" config={serverConfig} />
        : <CrudPage key="mnt" config={recordConfig({ recordType: 'MAINTENANCE', entity: 'Maintenance Record', deviceType: 'Server', deviceTypes: ['Server', 'Switch', 'UPS', 'Firewall'] })} />}
    </div>
  );
}
