// Simple tab switcher: <Tabs tabs={[{key,label,icon}]} active={k} onChange={setK} />
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition cursor-pointer ${active === t.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          {t.icon && <t.icon className="h-4 w-4" />} {t.label}
        </button>
      ))}
    </div>
  );
}
