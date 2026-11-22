// "Are you sure?" popup shown before deleting
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmDialog({ open, title = 'Delete record?', message, onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} title={title} onClose={onCancel} size="max-w-md">
      <div className="flex gap-4">
        <div className="h-fit rounded-full bg-red-100 p-3 text-red-600"><AlertTriangle className="h-6 w-6" /></div>
        <p className="text-sm text-slate-600">{message || 'This action cannot be undone.'}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-light" onClick={onCancel}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={loading}>{loading ? 'Deleting...' : 'Yes, delete'}</button>
      </div>
    </Modal>
  );
}
