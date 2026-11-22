// Coloured pill for any status / priority value
// green = good, red = bad, yellow = pending/medium, blue = open/in progress
const COLORS = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  gray: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

const MAP = {
  green: ['ACTIVE', 'WORKING', 'ONLINE', 'RESOLVED', 'UP', 'FREE', 'LOW', 'CLOSED_OK'],
  red: ['DOWN', 'OFFLINE', 'NOT_WORKING', 'CRITICAL', 'INACTIVE', 'SECURITY_INCIDENT', 'ISP_DOWNTIME', 'EXPIRED'],
  yellow: ['PENDING', 'MEDIUM', 'UNDER_REPAIR', 'RESERVED', 'ASSIGNED', 'HIGH', 'STANDBY', 'UNDER_MAINTENANCE', 'BACKUP', 'EXPIRING'],
  blue: ['OPEN', 'IN_PROGRESS', 'ALLOCATED', 'MAINTENANCE', 'PRIMARY', 'IP'],
  indigo: ['ADMIN', 'NVR'],
  gray: ['CLOSED', 'IT_STAFF', 'ANALOG', 'DVR'],
};

export function colorOf(value) {
  const v = String(value || '').toUpperCase();
  for (const [color, list] of Object.entries(MAP)) if (list.includes(v)) return color;
  return 'gray';
}

export default function StatusBadge({ value, color }) {
  if (!value) return <span className="text-slate-400">—</span>;
  const c = COLORS[color || colorOf(value)];
  const dot = { green: 'bg-emerald-500', red: 'bg-red-500', yellow: 'bg-amber-500', blue: 'bg-blue-500', indigo: 'bg-indigo-500', gray: 'bg-slate-400' }[color || colorOf(value)];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {String(value).replace(/_/g, ' ')}
    </span>
  );
}
