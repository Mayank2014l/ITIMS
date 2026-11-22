// =============================================================
// CrudPage - ONE generic screen used by almost every module.
// Give it a config and it shows: search box, filters, Add button,
// DataTable with pagination, Add/Edit FormModal and delete confirm.
//
// config = {
//   endpoint: '/servers',             API path
//   entity: 'Server',                 name used in buttons/messages
//   columns: [...],                   DataTable columns
//   fields: [...] or (opts) => [...], FormModal fields
//   filters: [{ name, label, options }],
//   fixedParams: { recordType: 'ISP_DOWNTIME' }  always sent (list + create)
//   ip: { field: 'ipAddress', model: 'server', nameField: 'name' }  live duplicate-IP check
//   toForm: (row) => values           convert a row into form values (dates etc.)
//   loadOptions: async (row) => opts  load dropdown data before opening the form
//   rowActions: (row, reload) => JSX  extra buttons per row
//   onChanged: () => {}               called after add/edit/delete
// }
// =============================================================
import { useEffect, useState, useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DataTable from './DataTable';
import FormModal from './FormModal';
import ConfirmDialog from './ConfirmDialog';

export default function CrudPage({ config }) {
  const { endpoint, entity, columns, filters = [], fixedParams = {}, ip, toForm, loadOptions, rowActions, onChanged } = config;
  const { isAdmin } = useAuth();
  const toast = useToast();

  // ---- list state ----
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [page, setPage] = useState(1);

  // ---- form state ----
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [opts, setOpts] = useState({});
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  // ---- delete state ----
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint, { params: { search, page, limit: 10, ...fixedParams, ...filterValues } });
      setRows(res.data.data.items);
      setMeta(res.data.data);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setLoading(false);
    }
  }, [endpoint, search, page, JSON.stringify(filterValues), JSON.stringify(fixedParams)]); // eslint-disable-line

  // Wait 350ms after typing before searching (debounce)
  useEffect(() => { const t = setTimeout(load, 350); return () => clearTimeout(t); }, [load]);

  async function openForm(row = null) {
    setEditing(row);
    setErrors({});
    setFormError('');
    if (loadOptions) setOpts(await loadOptions(row));
    setFormOpen(true);
  }

  // Live duplicate-IP check when the user leaves the IP field
  async function onFieldBlur(name, value, values) {
    if (!ip || name !== ip.field || ip.live === false) return;
    if (!value) { setErrors((e) => ({ ...e, [name]: undefined })); return; }
    try {
      await api.get('/ips/check', { params: { ip: value, model: ip.model, id: editing?.id, deviceName: values[ip.nameField] || editing?.[ip.nameField] } });
      setErrors((e) => ({ ...e, [name]: undefined }));
    } catch (err) {
      setErrors((e) => ({ ...e, [name]: errMsg(err) }));
    }
  }

  async function handleSubmit(values) {
    setErrors({});
    setFormError('');
    try {
      const body = { ...values, ...fixedParams };
      if (editing) await api.put(`${endpoint}/${editing.id}`, body);
      else await api.post(endpoint, body);
      toast.success(`${entity} ${editing ? 'updated' : 'added'} successfully`);
      setFormOpen(false);
      load();
      onChanged?.();
    } catch (err) {
      const msg = errMsg(err);
      // Show IP errors in red right under the IP field (inline)
      if (ip && /ip/i.test(msg) && (err.response?.status === 409 || /IPv4/.test(msg))) setErrors({ [ip.field]: msg });
      else setFormError(msg);
      toast.error(msg);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`${endpoint}/${toDelete.id}`);
      toast.success(`${entity} deleted`);
      setToDelete(null);
      load();
      onChanged?.();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setDeleting(false);
    }
  }

  const fields = typeof config.fields === 'function' ? config.fields(opts, editing) : config.fields;

  return (
    <div>
      {/* Toolbar: search + filters + add */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input !pl-9" placeholder="Search by any field..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        {filters.map((f) => (
          <select key={f.name} className="input md:!w-48" value={filterValues[f.name] || ''} onChange={(e) => { setFilterValues((s) => ({ ...s, [f.name]: e.target.value })); setPage(1); }}>
            <option value="">All {f.label}</option>
            {f.options.map((o) => {
              const opt = typeof o === 'object' ? o : { value: o, label: String(o).replace(/_/g, ' ') };
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
        ))}
        <button className="btn-primary whitespace-nowrap" onClick={() => openForm(null)}><Plus className="h-4 w-4" /> Add {entity}</button>
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        page={meta.page}
        pages={meta.pages}
        total={meta.total}
        onPageChange={setPage}
        onEdit={(row) => openForm(row)}
        onDelete={(row) => setToDelete(row)}
        canDelete={isAdmin}
        actions={rowActions ? (row) => rowActions(row, () => { load(); onChanged?.(); }) : undefined}
      />

      <FormModal
        open={formOpen}
        title={`${editing ? 'Edit' : 'Add'} ${entity}`}
        fields={fields}
        initial={editing ? (toForm ? toForm(editing) : editing) : (config.defaults || {})}
        errors={errors}
        formError={formError}
        onFieldBlur={onFieldBlur}
        onSubmit={handleSubmit}
        onClose={() => setFormOpen(false)}
      />

      <ConfirmDialog
        open={!!toDelete}
        message={`Are you sure you want to delete this ${entity.toLowerCase()}? This cannot be undone.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
