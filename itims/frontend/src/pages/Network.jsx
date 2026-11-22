// Module 5: Network Management - devices, switch ports and a simple topology view
import { useEffect, useState } from 'react';
import { Network, Router, Cable, Share2, Globe, ShieldCheck, Server, Monitor, Wifi, Cctv } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import Spinner from '../components/Spinner';

const STATUSES = ['ACTIVE', 'INACTIVE', 'DOWN'];

const deviceConfig = {
  endpoint: '/network-devices',
  entity: 'Network Device',
  ip: { field: 'ipAddress', model: 'networkDevice', nameField: 'name' },
  columns: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'type', label: 'Type', render: (r) => <StatusBadge value={r.type} color="indigo" /> },
    { key: 'brand', label: 'Brand / Model', render: (r) => <span>{r.brand} <span className="text-slate-400">{r.model}</span></span> },
    { key: 'location', label: 'Location' },
    { key: 'ipAddress', label: 'IP Address', render: (r) => <span className="font-mono text-xs">{r.ipAddress}</span> },
    { key: 'ports', label: 'Ports Mapped', render: (r) => r.switches?.length || '—' },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
  ],
  filters: [{ name: 'type', label: 'Types', options: ['Router', 'Switch', 'Modem', 'Other'] }, { name: 'status', label: 'Status', options: STATUSES }],
  fields: [
    { name: 'name', label: 'Device Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Router', 'Switch', 'Modem', 'Other'], required: true },
    { name: 'brand', label: 'Brand' },
    { name: 'model', label: 'Model' },
    { name: 'location', label: 'Location' },
    { name: 'ipAddress', label: 'IP Address', placeholder: '10.10.10.6' },
    { name: 'status', label: 'Status', type: 'select', options: STATUSES, required: true },
  ],
  defaults: { status: 'ACTIVE', type: 'Switch' },
};

function portConfig(switches) {
  return {
    endpoint: '/switches',
    entity: 'Switch Port',
    columns: [
      { key: 'sw', label: 'Switch', render: (r) => <span className="font-medium">{r.networkDevice?.name}</span> },
      { key: 'portNumber', label: 'Port', render: (r) => <span className="font-mono">Gi1/0/{r.portNumber}</span> },
      { key: 'totalPorts', label: 'Total Ports' },
      { key: 'connectedDevice', label: 'Connected Device' },
      { key: 'vlan', label: 'VLAN' },
      { key: 'portStatus', label: 'Port Status', render: (r) => <StatusBadge value={r.portStatus} /> },
    ],
    filters: [
      { name: 'networkDeviceId', label: 'Switches', options: switches.map((s) => ({ value: s.id, label: s.name })) },
      { name: 'portStatus', label: 'Port Status', options: ['UP', 'DOWN'] },
    ],
    fields: [
      { name: 'networkDeviceId', label: 'Switch', type: 'select', required: true, options: switches.map((s) => ({ value: s.id, label: s.name })) },
      { name: 'totalPorts', label: 'Total Ports', type: 'number', required: true },
      { name: 'portNumber', label: 'Port Number', type: 'number', required: true },
      { name: 'connectedDevice', label: 'Connected Device' },
      { name: 'vlan', label: 'VLAN' },
      { name: 'portStatus', label: 'Port Status', type: 'select', options: ['UP', 'DOWN'], required: true },
    ],
    defaults: { totalPorts: 24, portStatus: 'UP' },
  };
}

// ---------- Topology: Internet -> Firewall -> Core Switch -> Access Switches -> Devices ----------
function Node({ icon: Icon, title, sub, status, tone = 'indigo' }) {
  const tones = { indigo: 'from-indigo-500 to-indigo-600', red: 'from-rose-500 to-red-600', blue: 'from-sky-500 to-blue-600', green: 'from-emerald-500 to-emerald-600', slate: 'from-slate-500 to-slate-700' };
  return (
    <div className="card relative z-10 flex min-w-[170px] items-center gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`rounded-lg bg-gradient-to-br p-2 text-white ${tones[tone]}`}><Icon className="h-5 w-5" /></div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-800">{title}</p>
        {sub && <p className="truncate font-mono text-[11px] text-slate-400">{sub}</p>}
        {status && <div className="mt-1"><StatusBadge value={status} /></div>}
      </div>
    </div>
  );
}
const Line = () => <div className="mx-auto h-8 w-0.5 bg-gradient-to-b from-indigo-300 to-indigo-200" />;
const Row = ({ children }) => <div className="flex flex-wrap justify-center gap-4">{children}</div>;

function Topology() {
  const [d, setD] = useState(null);
  useEffect(() => {
    Promise.all([
      api.get('/isps', { params: { limit: 0 } }),
      api.get('/firewalls', { params: { limit: 0 } }),
      api.get('/network-devices', { params: { limit: 0 } }),
      api.get('/dashboard/stats'),
      api.get('/servers', { params: { limit: 0 } }),
    ]).then(([isp, fw, nd, st, sv]) => setD({ isp: isp.data.data.items, fw: fw.data.data.items, nd: nd.data.data.items, st: st.data.data.cards, servers: sv.data.data.items.length }));
  }, []);
  if (!d) return <Spinner text="Drawing topology..." />;

  const routers = d.nd.filter((n) => n.type === 'Router' || n.type === 'Modem');
  const switches = d.nd.filter((n) => n.type === 'Switch');
  const core = switches.find((s) => /core/i.test(s.name)) || switches[0];
  const access = switches.filter((s) => s !== core);

  return (
    <div className="card overflow-x-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] p-8 [background-size:18px_18px]">
      <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Logical Network Topology</p>
      <Row><Node icon={Globe} title="Internet" sub="WAN" tone="slate" /></Row>
      <Line />
      <Row>{d.isp.map((i) => <Node key={i.id} icon={Globe} title={i.providerName} sub={`${i.linkType} · ${i.bandwidth || ''}`} status={i.status} tone={i.status === 'ACTIVE' ? 'green' : 'red'} />)}</Row>
      <Line />
      <Row>{routers.map((r) => <Node key={r.id} icon={Router} title={r.name} sub={r.ipAddress} status={r.status} tone="blue" />)}</Row>
      <Line />
      <Row>{d.fw.map((f) => <Node key={f.id} icon={ShieldCheck} title={f.name} sub={f.ipAddress} status={f.status} tone="red" />)}</Row>
      <Line />
      <Row>{core && <Node icon={Share2} title={core.name} sub={`Core · ${core.ipAddress}`} status={core.status} />}</Row>
      <Line />
      <div className="mx-auto mb-0 h-0.5 max-w-xl bg-indigo-200" />
      <div className="flex flex-wrap justify-center gap-10">
        {access.map((a) => (
          <div key={a.id} className="flex flex-col items-center">
            <div className="h-6 w-0.5 bg-indigo-200" />
            <Node icon={Share2} title={a.name} sub={`Access · ${a.ipAddress}`} status={a.status} />
          </div>
        ))}
        <div className="flex flex-col items-center">
          <div className="h-6 w-0.5 bg-indigo-200" />
          <Node icon={Server} title="Server Farm" sub={`${d.servers} servers · Rack A/B`} tone="slate" />
        </div>
      </div>
      <Line />
      <Row>
        <Node icon={Monitor} title={`${d.st.totalComputers} Computers`} sub="VLAN 20 - Users" tone="blue" />
        <Node icon={Wifi} title={`${d.st.totalAps} Access Points`} sub={`${d.st.apOnline} online · VLAN 30`} tone="green" />
        <Node icon={Cctv} title={`${d.st.cctvWorking + d.st.cctvNotWorking} CCTV Cameras`} sub="VLAN 40 - CCTV" tone="slate" />
      </Row>
    </div>
  );
}

export default function NetworkPage() {
  const [tab, setTab] = useState('devices');
  const [switches, setSwitches] = useState([]);
  useEffect(() => { api.get('/network-devices', { params: { type: 'Switch', limit: 0 } }).then((r) => setSwitches(r.data.data.items)); }, [tab]);

  return (
    <div>
      <PageHeader title="Network Management" subtitle="Routers, switches, modems, port mapping and topology" icon={Network} />
      <Tabs
        tabs={[{ key: 'devices', label: 'Network Devices', icon: Router }, { key: 'ports', label: 'Switch Ports', icon: Cable }, { key: 'topology', label: 'Topology View', icon: Share2 }]}
        active={tab}
        onChange={setTab}
      />
      {tab === 'devices' && <CrudPage config={deviceConfig} />}
      {tab === 'ports' && <CrudPage config={portConfig(switches)} />}
      {tab === 'topology' && <Topology />}
    </div>
  );
}
