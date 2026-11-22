// Reusable Add/Edit form inside a modal, built from a "fields" list.
// field = { name, label, type: text|number|date|select|textarea|password|email, options, required, full, placeholder }
import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';

export default function FormModal({ open, title, fields, initial = {}, onSubmit, onClose, errors = {}, formError, onFieldBlur }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  // Reset the form every time it opens
  useEffect(() => { if (open) setValues({ ...initial }); }, [open]); // eslint-disable-line

  const set = (name, v) => setValues((s) => ({ ...s, [name]: v }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try { await onSubmit(values); } finally { setSaving(false); }
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {formError}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {fields.map((f) => {
            const err = errors[f.name];
            const common = {
              id: f.name,
              required: f.required,
              value: values[f.name] ?? '',
              onChange: (e) => set(f.name, e.target.value),
              onBlur: (e) => onFieldBlur?.(f.name, e.target.value, values),
              className: `input ${err ? 'input-error' : ''}`,
              placeholder: f.placeholder,
            };
            return (
              <div key={f.name} className={f.full || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label htmlFor={f.name} className="label">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
                {f.type === 'select' ? (
                  <select {...common}>
                    <option value="">— Select —</option>
                    {(f.options || []).map((o) => {
                      const opt = typeof o === 'object' ? o : { value: o, label: String(o).replace(/_/g, ' ') };
                      return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                    })}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea rows={3} {...common} />
                ) : (
                  <input type={f.type || 'text'} {...common} />
                )}
                {err && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600"><AlertCircle className="h-3.5 w-3.5" />{err}</p>}
                {!err && f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
          <button type="button" className="btn-light" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </Modal>
  );
}
