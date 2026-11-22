// =============================================================
// Module 11: IT Complaints (helpdesk tickets)
// Workflow: OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED
// Click a row to open the detail view with a status timeline (stepper).
// =============================================================
import { useEffect, useState, useCallback } from 'react';
import { Ticket, Plus, Search, UserPlus, Play, CheckCircle2, Lock, RotateCcw, Eye, Check } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, fmtDateTime } from '../utils/format';

const CATEGORIES = ['Hardware', 'Network', 'Software', 'CCTV', 'ISP', 'Other'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const formFields = [
  { name: 'title', label: 'Title', required: true, full: true },
  { name: 'category', label: 'Category', type: 'select', options: CATEGORIES, required: true },
  { name: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, required: true },
  { name: 'raisedBy', label: 'Raised By', placeholder: 'Employee name / department', full: true },
  { name: 'description', label: 'Description', type: 'textarea' },
];

// ---------- Status timeline ----------
function Stepper({ c }) {
  const current = STATUSES.indexOf(c.status);
  const times = { OPEN: c.createdAt, RESOLVED: c.resolvedAt, CLOSED: c.closedAt };
  return (
    <div className="flex items-start">
      {STATUSES.map((s, i) => {
        const done = i < current || c.status === 'CLOSED';
        const active = i === current && c.status !== 'CLOSED';
        return (
          <div key={s} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && <div className={`absolute right-1/2 top-4 h-0.5 w-full ${i <= current ? 'bg-indigo-500' : 'bg-slate-200'}`} />}
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition
              ${done ? 'border-indigo-500 bg-indigo-500 text-white' : active ? 'border-indigo-500 bg-white text-indigo-600 ring-4 ring-indigo-100' : 'border-slate-200 bg-white text-slate-400'}`}>
              {done ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <p className={`mt-2 text-[11px] font-semibold ${done || active ? 'text-slate-800' : 'text-slate-400'}`}>{s.replace('_', ' ')}</p>
            {times[s] && (done || active) && <p className="text-[10px] text-slate-400">{fmtDate(times[s])}</p>}
          </div>
        );
      })}
    </div>
  );
}

// ---------- Detail view with workflow buttons ----------
function ComplaintDetail({ complaint, staff, onClose, onUpdated }) {
  const toast = useToast();
  const [c, setC] = useState(complaint);
  const [assignee, setAssignee] = useState(complaint.assignedToId || '');
  const [priority, setPriority] = useState(complaint.priority);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run(fn, okMsg) {
    setBusy(true); setError('');
    try {
      const res = await fn();
      setC(res.data.data);
      toast.success(okMsg || res.data.message);
      onUpdated();
    } catch (e) { setError(errMsg(e)); toast.error(errMsg(e)); }
    finally { setBusy(false); }
  }
  const assign = () => run(() => api.patch(`/complaints/${c.id}/assign`, { assignedToId: assignee, priority }));
  const move = (status, extra = {}) => run(() => api.patch(`/complaints/${c.id}/status`, { status, ...extra }));

  return (
    <Modal open title={`${c.ticketNo} · ${c.title}`} onClose={onClose} size="max-w-3xl">
      <div className="mb-6 rounded-xl bg-slate-50 p-5"><Stepper c={c} /></div>

      <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
        <div><p className="label">Status</p><StatusBadge value={c.status} /></div>
        <div><p className="label">Priority</p><StatusBadge value={c.priority} /></div>
        <div><p className="label">Category</p><p className="font-medium">{c.category}</p></div>
        <div><p className="label">Raised By</p><p className="font-medium">{c.raisedBy}</p></div>
        <div><p className="label">Assigned To</p><p className="font-medium">{c.assignedTo?.name || '—'}</p></div>
        <div><p className="label">Created</p><p>{fmtDateTime(c.createdAt)}</p></div>
        <div><p className="label">Resolved</p><p>{fmtDateTime(c.resolvedAt)}</p></div>
        <div><p className="label">Closed</p><p>{fmtDateTime(c.closedAt)}</p></div>
      </div>
      {c.description && <div className="mt-4"><p className="label">Description</p><p className="text-sm text-slate-600">{c.description}</p></div>}
      {c.resolutionNote && <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><b>Resolution:</b> {c.resolutionNote}</div>}

      {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {/* Workflow actions depending on current status */}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">Next action</p>

        {['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status) && (
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_160px_auto]">
            <select className="input" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <option value="">— Select IT staff —</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role === 'ADMIN' ? 'Admin' : 'IT Staff'})</option>)}
            </select>
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
            <button className="btn-primary" disabled={busy || !assignee} onClick={assign}><UserPlus className="h-4 w-4" />{c.status === 'OPEN' ? 'Assign' : 'Re-assign'}</button>
          </div>
        )}

        {c.status === 'ASSIGNED' && <button className="btn-primary" disabled={busy} onClick={() => move('IN_PROGRESS')}><Play className="h-4 w-4" /> Start Work (In Progress)</button>}

        {c.status === 'IN_PROGRESS' && (
          <div className="space-y-3">
            <textarea className="input" rows={3} placeholder="Resolution note (required) - what was done to fix it?" value={note} onChange={(e) => setNote(e.target.value)} />
            <button className="btn-success" disabled={busy || !note.trim()} onClick={() => move('RESOLVED', { resolutionNote: note })}><CheckCircle2 className="h-4 w-4" /> Mark Resolved</button>
          </div>
        )}

        {c.status === 'RESOLVED' && (
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary" disabled={busy} onClick={() => move('CLOSED')}><Lock className="h-4 w-4" /> Close Ticket</button>
            <button className="btn-light" disabled={busy} onClick={() => move('IN_PROGRESS')}><RotateCcw className="h-4 w-4" /> Re-open</button>
          </div>
        )}

        {c.status === 'CLOSED' && <p className="text-sm text-slate-500">This ticket is closed. No further action needed.</p>}
      </div>
    </Modal>
  );
}

// ---------- Main page ----------
export default function Complaints() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [f, setF] = useState({ status: '', priority: '', category: '' });
  const [page, setPage] = useState(1);
  const [staff, setStaff] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formError, setFormError] = useState('');
  const [detail, setDetail] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [counts, setCounts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints', { params: { search, page, limit: 10, ...f } });
      setRows(res.data.data.items);
      setMeta(res.data.data);
      const all = await api.get('/complaints', { params: { limit: 0 } });
      const c = {}; all.data.data.items.forEach((x) => { c[x.status] = (c[x.status] || 0) + 1; });
      setCounts(c);
    } catch (e) { toast.error(errMsg(e)); }
    finally { setLoading(false); }
  }, [search, page, JSON.stringify(f)]); // eslint-disable-line

  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api.get('/users/staff').then((r) => setStaff(r.data.data)); }, []);

  async function save(values) {
    setFormError('');
    try {
      if (editing) await api.put(`/complaints/${editing.id}`, values);
      else {
        const r = await api.post('/complaints', values);
        toast.success(r.data.message);
      }
      if (editing) toast.success('Complaint updated');
      setFormOpen(false);
      load();
    } catch (e) { setFormError(errMsg(e)); toast.error(errMsg(e)); }
  }

  async function remove() {
    try { await api.delete(`/complaints/${toDelete.id}`); toast.success('Complaint deleted'); setToDelete(null); load(); }
    catch (e) { toast.error(errMsg(e)); }
  }

  const columns = [
    { key: 'ticketNo', label: 'Ticket', render: (r) => <span className="font-mono text-xs font-semibold text-indigo-600">{r.ticketNo}</span> },
    { key: 'title', label: 'Title', render: (r) => <span className="block max-w-xs truncate font-medium text-slate-900">{r.title}</span> },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority', render: (r) => <StatusBadge value={r.priority} /> },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> },
    { key: 'raisedBy', label: 'Raised By' },
    { key: 'assignedTo', label: 'Assigned To', render: (r) => r.assignedTo?.name || <span className="text-xs text-slate-300">Unassigned</span> },
    { key: 'createdAt', label: 'Created', render: (r) => fmtDate(r.createdAt) },
  ];

  return (
    <div>
      <PageHeader title="IT Complaints" subtitle="Raise, assign, track and close IT support tickets" icon={Ticket}>
        <button className="btn-primary" onClick={() => { setEditing(null); setFormError(''); setFormOpen(true); }}><Plus className="h-4 w-4" /> New Complaint</button>
      </PageHeader>

      {/* Status pills = quick filter */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setF((x) => ({ ...x, status: x.status === s ? '' : s })); setPage(1); }}
            className={`card cursor-pointer p-4 text-left transition hover:shadow-md ${f.status === s ? 'ring-2 ring-indigo-500' : ''}`}>
            <p className="text-2xl font-bold text-slate-900">{counts[s] || 0}</p>
            <div className="mt-1"><StatusBadge value={s} /></div>
          </button>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search ticket no, title, raised by..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {[['status', 'Status', STATUSES], ['priority', 'Priorities', PRIORITIES], ['category', 'Categories', CATEGORIES]].map(([k, l, opts]) => (
          <select key={k} className="input md:!w-44" value={f[k]} onChange={(e) => { setF((x) => ({ ...x, [k]: e.target.value })); setPage(1); }}>
            <option value="">All {l}</option>
            {opts.map((o) => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
          </select>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={meta.page}
        pages={meta.pages}
        total={meta.total}
        onPageChange={setPage}
        onRowClick={setDetail}
        actions={(r) => <button title="View & update workflow" className="icon-btn" onClick={() => setDetail(r)}><Eye className="h-4 w-4" /></button>}
        onEdit={(r) => { setEditing(r); setFormError(''); setFormOpen(true); }}
        onDelete={setToDelete}
        canDelete={isAdmin}
      />

      <FormModal open={formOpen} title={editing ? `Edit ${editing.ticketNo}` : 'New Complaint'} fields={formFields}
        initial={editing || { priority: 'MEDIUM', category: 'Hardware' }} formError={formError} onSubmit={save} onClose={() => setFormOpen(false)} />

      {detail && <ComplaintDetail key={detail.id} complaint={detail} staff={staff} onClose={() => setDetail(null)} onUpdated={load} />}

      <ConfirmDialog open={!!toDelete} message={`Delete complaint ${toDelete?.ticketNo}? This cannot be undone.`} onConfirm={remove} onCancel={() => setToDelete(null)} />
    </div>
  );
}
