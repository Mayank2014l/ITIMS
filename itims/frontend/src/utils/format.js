// Small display helpers
export const fmtDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const fmtDateTime = (v) => (v ? new Date(v).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
export const toInputDate = (v) => (v ? new Date(v).toISOString().slice(0, 10) : ''); // for <input type="date">
export const label = (v) => (v ? String(v).replace(/_/g, ' ') : '—'); // UNDER_REPAIR -> UNDER REPAIR
