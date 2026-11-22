// Reusable table with loading, empty state, edit/delete actions and pagination
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

export default function DataTable({
  columns, rows, loading,
  page = 1, pages = 1, total = 0, onPageChange,
  onEdit, onDelete, canDelete = false, actions, onRowClick,
}) {
  const showActions = onEdit || (onDelete && canDelete) || actions;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((c) => <th key={c.key} className="whitespace-nowrap px-4 py-3 font-semibold">{c.label}</th>)}
              {showActions && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!loading && rows.map((row) => (
              <tr key={row.id} onClick={() => onRowClick?.(row)} className={`transition hover:bg-indigo-50/40 ${onRowClick ? 'cursor-pointer' : ''}`}>
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {c.render ? c.render(row) : (row[c.key] ?? <span className="text-slate-300">—</span>)}
                  </td>
                ))}
                {showActions && (
                  <td className="whitespace-nowrap px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      {actions && actions(row)}
                      {onEdit && <button title="Edit" className="icon-btn" onClick={() => onEdit(row)}><Pencil className="h-4 w-4" /></button>}
                      {onDelete && canDelete && <button title="Delete" className="icon-btn hover:!text-red-600" onClick={() => onDelete(row)}><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {loading && <Spinner />}
      {!loading && rows.length === 0 && <EmptyState />}

      {/* Pagination */}
      {!loading && total > 0 && onPageChange && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
          <span>Showing page <b className="text-slate-700">{page}</b> of <b className="text-slate-700">{pages}</b> · {total} records</span>
          <div className="flex gap-1">
            <button className="btn-light !px-2 !py-1.5" disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft className="h-4 w-4" /></button>
            <button className="btn-light !px-2 !py-1.5" disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
