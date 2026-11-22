// Shown when a table has no rows
import { Inbox } from 'lucide-react';

export default function EmptyState({ text = 'No records found' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-slate-400">
      <div className="rounded-full bg-slate-100 p-4"><Inbox className="h-7 w-7" /></div>
      <p className="text-sm font-medium">{text}</p>
      <p className="text-xs">Try changing the search or filters.</p>
    </div>
  );
}
