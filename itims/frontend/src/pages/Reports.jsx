// Module 12: Reports & Analytics - each report card has filters + PDF / Excel download
import { useState } from 'react';
import { FileBarChart, FileText, FileSpreadsheet, Monitor, Binary, Globe, Cctv, Ticket, Printer } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import { exportPDF, exportExcel } from '../utils/exportUtils';
import { fmtDate } from '../utils/format';

// Definition of every report: API, filters, and which columns to export
const REPORTS = [
  {
    key: 'computers', title: 'Computer Inventory Report', icon: Monitor, tone: 'bg-indigo-100 text-indigo-600', endpoint: '/computers',
    filters: [{ name: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'] }, { name: 'department', label: 'Department', options: ['HR', 'Finance', 'IT', 'Production', 'Quality', 'Stores', 'Sales', 'Administration', 'Security'] }],
    columns: [['Asset Tag', 'assetTag'], ['Name', 'name'], ['Assigned To', 'assignedTo'], ['Department', 'department'], ['Location', 'location'], ['Processor', 'processor'], ['RAM', 'ram'], ['Storage', 'storage'], ['OS', 'os'], ['IP', 'ip'], ['Status', 'status'], ['Purchase Date', 'purchaseDate']],
    map: (r) => ({ ...r, ip: r.ip?.ipAddress || 'DHCP', purchaseDate: fmtDate(r.purchaseDate) }),
  },
  {
    key: 'hardware', title: 'Hardware Inventory Report', icon: Printer, tone: 'bg-sky-100 text-sky-600', endpoint: '/hardware',
    filters: [{ name: 'itemType', label: 'Type', options: ['Printer', 'Scanner', 'UPS', 'Monitor', 'Other'] }, { name: 'status', label: 'Status', options: ['ACTIVE', 'INACTIVE', 'UNDER_REPAIR'] }],
    columns: [['Type', 'itemType'], ['Brand', 'brand'], ['Model', 'model'], ['Serial No', 'serialNo'], ['Location', 'location'], ['Status', 'status'], ['Purchased', 'purchaseDate'], ['Warranty End', 'warrantyEnd']],
    map: (r) => ({ ...r, purchaseDate: fmtDate(r.purchaseDate), warrantyEnd: fmtDate(r.warrantyEnd) }),
  },
  {
    key: 'ips', title: 'IP Address Report', icon: Binary, tone: 'bg-violet-100 text-violet-600', endpoint: '/ips',
    filters: [{ name: 'status', label: 'Status', options: ['ALLOCATED', 'FREE', 'RESERVED'] }, { name: 'subnet', label: 'Subnet', options: ['10.10.10.0/24', '10.10.20.0/24', '10.10.30.0/24', '10.10.40.0/24'] }],
    columns: [['IP Address', 'ipAddress'], ['Subnet', 'subnet'], ['VLAN', 'vlan'], ['Device Type', 'deviceType'], ['Device Name', 'deviceName'], ['Status', 'status'], ['Assigned', 'assignedDate'], ['Remarks', 'remarks']],
    map: (r) => ({ ...r, assignedDate: fmtDate(r.assignedDate) }),
  },
  {
    key: 'isp', title: 'ISP Report', icon: Globe, tone: 'bg-emerald-100 text-emerald-600', endpoint: '/isps',
    filters: [{ name: 'linkType', label: 'Link Type', options: ['PRIMARY', 'BACKUP'] }, { name: 'status', label: 'Status', options: ['ACTIVE', 'DOWN'] }],
    columns: [['Provider', 'providerName'], ['Link Type', 'linkType'], ['Bandwidth', 'bandwidth'], ['Circuit ID', 'circuitId'], ['Static IP', 'staticIp'], ['Contact', 'contactPerson'], ['Phone', 'contactNumber'], ['Status', 'status']],
  },
  {
    key: 'isp-down', title: 'ISP Downtime Report', icon: Globe, tone: 'bg-rose-100 text-rose-600', endpoint: '/maintenance', fixed: { recordType: 'ISP_DOWNTIME' },
    filters: [],
    columns: [['Date', 'date'], ['ISP', 'deviceName'], ['Description', 'description'], ['Reported By', 'performedBy'], ['Remarks', 'remarks']],
    map: (r) => ({ ...r, date: fmtDate(r.date) }),
  },
  {
    key: 'cctv', title: 'CCTV Report', icon: Cctv, tone: 'bg-amber-100 text-amber-600', endpoint: '/cctv',
    filters: [{ name: 'status', label: 'Status', options: ['WORKING', 'NOT_WORKING'] }, { name: 'cameraType', label: 'Camera Type', options: ['ANALOG', 'IP'] }],
    columns: [['Camera', 'cameraName'], ['Type', 'cameraType'], ['Location', 'location'], ['Recorder Type', 'recorderType'], ['Recorder', 'recorderName'], ['IP', 'ipAddress'], ['Status', 'status']],
  },
  {
    key: 'complaints', title: 'Complaints Report', icon: Ticket, tone: 'bg-red-100 text-red-600', endpoint: '/complaints',
    filters: [
      { name: 'status', label: 'Status', options: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] },
      { name: 'priority', label: 'Priority', options: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
      { name: 'category', label: 'Category', options: ['Hardware', 'Network', 'Software', 'CCTV', 'ISP', 'Other'] },
    ],
    columns: [['Ticket', 'ticketNo'], ['Title', 'title'], ['Category', 'category'], ['Priority', 'priority'], ['Status', 'status'], ['Raised By', 'raisedBy'], ['Assigned To', 'assignee'], ['Created', 'createdAt'], ['Resolved', 'resolvedAt'], ['Resolution', 'resolutionNote']],
    map: (r) => ({ ...r, assignee: r.assignedTo?.name || '-', createdAt: fmtDate(r.createdAt), resolvedAt: fmtDate(r.resolvedAt) }),
  },
];

function ReportCard({ report }) {
  const toast = useToast();
  const [filters, setFilters] = useState({});
  const [busy, setBusy] = useState('');

  async function download(type) {
    setBusy(type);
    try {
      // limit=0 -> fetch ALL matching rows
      const res = await api.get(report.endpoint, { params: { limit: 0, ...report.fixed, ...filters } });
      const rows = res.data.data.items.map(report.map || ((r) => r));
      if (!rows.length) { toast.error('No records match these filters'); return; }
      const columns = report.columns.map(([header, key]) => ({ header, key }));
      const filtersText = Object.entries(filters).filter(([, v]) => v).map(([k, v]) => `${k}=${v}`).join(', ');
      if (type === 'pdf') exportPDF({ title: report.title, columns, rows, filtersText });
      else exportExcel({ title: report.title, columns, rows });
      toast.success(`${report.title} downloaded (${rows.length} rows)`);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setBusy(''); }
  }

  return (
    <div className="card flex flex-col p-5 transition hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <div className={`rounded-xl p-2.5 ${report.tone}`}><report.icon className="h-5 w-5" /></div>
        <h3 className="font-semibold text-slate-800">{report.title}</h3>
      </div>
      <div className="flex-1 space-y-2">
        {report.filters.map((f) => (
          <select key={f.name} className="input" value={filters[f.name] || ''} onChange={(e) => setFilters((s) => ({ ...s, [f.name]: e.target.value }))}>
            <option value="">All {f.label}</option>
            {f.options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
          </select>
        ))}
        {!report.filters.length && <p className="text-sm text-slate-400">Full history, newest first.</p>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="btn-light !text-red-600" disabled={!!busy} onClick={() => download('pdf')}><FileText className="h-4 w-4" />{busy === 'pdf' ? '...' : 'Download PDF'}</button>
        <button className="btn-light !text-emerald-700" disabled={!!busy} onClick={() => download('xlsx')}><FileSpreadsheet className="h-4 w-4" />{busy === 'xlsx' ? '...' : 'Download Excel'}</button>
      </div>
    </div>
  );
}

export default function Reports() {
  return (
    <div>
      <PageHeader title="Reports & Analytics" subtitle="Filter and export inventory, IP, ISP, CCTV and complaint reports" icon={FileBarChart} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {REPORTS.map((r) => <ReportCard key={r.key} report={r} />)}
      </div>
    </div>
  );
}
