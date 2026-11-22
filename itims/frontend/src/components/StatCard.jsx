// Dashboard number card with an icon
const TONES = {
  indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-200',
  blue: 'from-sky-500 to-blue-600 shadow-blue-200',
  green: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
  red: 'from-rose-500 to-red-600 shadow-red-200',
  amber: 'from-amber-400 to-orange-500 shadow-amber-200',
  violet: 'from-violet-500 to-purple-600 shadow-violet-200',
};

export default function StatCard({ title, value, icon: Icon, tone = 'indigo', hint }) {
  return (
    <div className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? '—'}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        {Icon && (
          <div className={`rounded-xl bg-gradient-to-br p-3 text-white shadow-lg ${TONES[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
