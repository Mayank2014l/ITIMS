// Module 10: CCTV Management - cameras, analog/IP, DVR/NVR, working status
import { useEffect, useState } from 'react';
import { Cctv, CheckCircle2, XCircle, Video, HardDrive } from 'lucide-react';
import api from '../api/axios';
import PageHeader from '../components/PageHeader';
import CrudPage from '../components/CrudPage';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export default function CctvPage() {
  const [all, setAll] = useState([]);
  const load = () => api.get('/cctv', { params: { limit: 0 } }).then((r) => setAll(r.data.data.items));
  useEffect(() => { load(); }, []);

  const count = (fn) => all.filter(fn).length;
  const config = {
    endpoint: '/cctv',
    entity: 'Camera',
    ip: { field: 'ipAddress', model: 'cctvCamera', nameField: 'cameraName' },
    columns: [
      { key: 'cameraName', label: 'Camera', render: (r) => <span className="flex items-center gap-2 font-medium text-slate-900"><Video className={`h-4 w-4 ${r.status === 'WORKING' ? 'text-emerald-500' : 'text-red-400'}`} />{r.cameraName}</span> },
      { key: 'cameraType', label: 'Type', render: (r) => <StatusBadge value={r.cameraType} /> },
      { key: 'location', label: 'Location' },
      { key: 'recorderType', label: 'Recorder', render: (r) => <span className="flex items-center gap-2"><StatusBadge value={r.recorderType} /><span className="text-xs text-slate-500">{r.recorderName}</span></span> },
      { key: 'ipAddress', label: 'IP Address', render: (r) => r.ipAddress ? <span className="font-mono text-xs">{r.ipAddress}</span> : <span className="text-xs text-slate-300">Analog (no IP)</span> },
      { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    ],
    filters: [
      { name: 'status', label: 'Status', options: ['WORKING', 'NOT_WORKING'] },
      { name: 'cameraType', label: 'Camera Types', options: ['ANALOG', 'IP'] },
      { name: 'recorderType', label: 'Recorders', options: ['DVR', 'NVR'] },
    ],
    fields: [
      { name: 'cameraName', label: 'Camera Name', required: true },
      { name: 'cameraType', label: 'Camera Type', type: 'select', options: ['ANALOG', 'IP'], required: true },
      { name: 'location', label: 'Location' },
      { name: 'recorderType', label: 'Recorder Type', type: 'select', options: ['DVR', 'NVR'], required: true },
      { name: 'recorderName', label: 'Recorder Name' },
      { name: 'ipAddress', label: 'IP Address (IP cameras only)', placeholder: '10.10.40.18' },
      { name: 'status', label: 'Status', type: 'select', options: ['WORKING', 'NOT_WORKING'], required: true },
    ],
    defaults: { cameraType: 'IP', recorderType: 'NVR', status: 'WORKING' },
    onChanged: load,
  };

  return (
    <div>
      <PageHeader title="CCTV Management" subtitle="Analog & IP cameras with DVR / NVR recorders" icon={Cctv} />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total Cameras" value={all.length} icon={Cctv} tone="indigo" />
        <StatCard title="Working" value={count((c) => c.status === 'WORKING')} icon={CheckCircle2} tone="green" />
        <StatCard title="Not Working" value={count((c) => c.status === 'NOT_WORKING')} icon={XCircle} tone="red" />
        <StatCard title="IP / Analog" value={`${count((c) => c.cameraType === 'IP')} / ${count((c) => c.cameraType === 'ANALOG')}`} icon={HardDrive} tone="blue" hint={`${count((c) => c.recorderType === 'NVR')} on NVR · ${count((c) => c.recorderType === 'DVR')} on DVR`} />
      </div>
      <CrudPage config={config} />
    </div>
  );
}
