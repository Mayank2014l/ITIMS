// Module 6: ISP Management - providers, PRIMARY/BACKUP, status toggle, downtime history
import { useEffect, useState } from 'react';
import { Globe, History, Power, Gauge } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import Tabs from '../components/Tabs';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import recordConfig from './recordConfig';

export default function IspPage() {
  const toast = useToast();
  const [tab, setTab] = useState('isp');
  const [isps, setIsps] = useState([]);
  const loadCards = () => api.get('/isps', { params: { limit: 0 } }).then((r) => setIsps(r.data.data.items));
  useEffect(() => { loadCards(); }, []);

  // Quick ACTIVE <-> DOWN switch
  async function toggle(row, reload) {
    try {
      const status = row.status === 'ACTIVE' ? 'DOWN' : 'ACTIVE';
      await api.put(`/isps/${row.id}`, { status });
      toast.success(`${row.providerName} marked ${status}`);
      reload(); loadCards();
    } catch (e) { toast.error(errMsg(e)); }
  }

  const ispConfig = {
    endpoint: '/isps',
    entity: 'ISP',
    columns: [
      { key: 'providerName', label: 'Provider', render: (r) => <span className="font-medium text-slate-900">{r.providerName}</span> },
      { key: 'linkType', label: 'Link', render: (r) => <StatusBadge value={r.linkType} /> },
      { key: 'bandwidth', label: 'Bandwidth' },
      { key: 'circuitId', label: 'Circuit ID', render: (r) => <span className="font-mono text-xs">{r.circuitId}</span> },
      { key: 'staticIp', label: 'Static IP', render: (r) => <span className="font-mono text-xs">{r.staticIp}</span> },
      { key: 'contact', label: 'Contact', render: (r) => <span className="text-xs">{r.contactPerson}<br /><span className="text-slate-400">{r.contactNumber}</span></span> },
      { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    ],
    filters: [{ name: 'linkType', label: 'Link Types', options: ['PRIMARY', 'BACKUP'] }, { name: 'status', label: 'Status', options: ['ACTIVE', 'DOWN'] }],
    fields: [
      { name: 'providerName', label: 'Provider Name', required: true },
      { name: 'linkType', label: 'Link Type', type: 'select', options: ['PRIMARY', 'BACKUP'], required: true },
      { name: 'bandwidth', label: 'Bandwidth', placeholder: '100 Mbps' },
      { name: 'circuitId', label: 'Circuit ID' },
      { name: 'staticIp', label: 'Static (Public) IP' },
      { name: 'contactPerson', label: 'Contact Person' },
      { name: 'contactNumber', label: 'Contact Number' },
      { name: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'DOWN'], required: true },
    ],
    defaults: { linkType: 'PRIMARY', status: 'ACTIVE' },
    rowActions: (row, reload) => (
      <button title="Toggle status" onClick={() => toggle(row, reload)} className={`icon-btn ${row.status === 'ACTIVE' ? 'hover:!text-red-600' : 'hover:!text-emerald-600'}`}><Power className="h-4 w-4" /></button>
    ),
    onChanged: loadCards,
  };

  return (
    <div>
      <PageHeader title="ISP Management" subtitle="Internet links, failover and downtime history" icon={Globe} />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {isps.map((i) => (
          <div key={i.id} className={`card relative overflow-hidden p-5 ${i.status === 'ACTIVE' ? '' : 'ring-2 ring-red-200'}`}>
            <div className={`absolute inset-x-0 top-0 h-1 ${i.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{i.linkType} link</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{i.providerName}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><Gauge className="h-4 w-4" />{i.bandwidth}</p>
              </div>
              <span className="relative flex h-3 w-3">
                {i.status === 'ACTIVE' && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
                <span className={`relative inline-flex h-3 w-3 rounded-full ${i.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
              </span>
            </div>
            <div className="mt-3"><StatusBadge value={i.status} /></div>
          </div>
        ))}
      </div>

      <Tabs tabs={[{ key: 'isp', label: 'Providers', icon: Globe }, { key: 'down', label: 'Downtime Records', icon: History }]} active={tab} onChange={setTab} />
      {tab === 'isp'
        ? <CrudPage key="isp" config={ispConfig} />
        : <CrudPage key="down" config={recordConfig({ recordType: 'ISP_DOWNTIME', entity: 'Downtime Record', deviceType: 'ISP' })} />}
    </div>
  );
}
