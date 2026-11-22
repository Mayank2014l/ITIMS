// Shared config for MaintenanceRecord tables.
// The same table stores 3 kinds of records, separated by "recordType":
//   MAINTENANCE (server room), ISP_DOWNTIME (ISP page), SECURITY_INCIDENT (firewall page)
import { createElement as h } from 'react';
import StatusBadge from '../components/StatusBadge';
import { fmtDate, toInputDate } from '../utils/format';

export default function recordConfig({ recordType, entity, deviceType, deviceTypes }) {
  return {
    endpoint: '/maintenance',
    entity,
    fixedParams: { recordType }, // list shows only this type, and new records get this type
    columns: [
      { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) },
      { key: 'deviceType', label: 'Device Type' },
      { key: 'deviceName', label: 'Device', render: (r) => h('span', { className: 'font-medium text-slate-900' }, r.deviceName) },
      { key: 'description', label: 'Description', render: (r) => h('span', { className: 'block max-w-xs truncate', title: r.description }, r.description) },
      { key: 'performedBy', label: 'Performed / Reported By' },
      { key: 'remarks', label: 'Remarks', render: (r) => h('span', { className: 'block max-w-[200px] truncate text-slate-500', title: r.remarks }, r.remarks) },
      { key: 'recordType', label: 'Type', render: (r) => h(StatusBadge, { value: r.recordType }) },
    ],
    filters: deviceTypes ? [{ name: 'deviceType', label: 'Device Types', options: deviceTypes }] : [],
    fields: [
      { name: 'deviceType', label: 'Device Type', required: true },
      { name: 'deviceName', label: 'Device Name', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'performedBy', label: 'Performed / Reported By' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
    defaults: { deviceType, date: new Date().toISOString().slice(0, 10) },
    toForm: (r) => ({ ...r, date: toInputDate(r.date) }),
  };
}
