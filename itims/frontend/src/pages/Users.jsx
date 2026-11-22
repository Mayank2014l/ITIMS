// User Management (ADMIN only)
import { Users } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import CrudPage from '../components/CrudPage';
import StatusBadge from '../components/StatusBadge';
import { fmtDate } from '../utils/format';

const config = {
  endpoint: '/users',
  entity: 'User',
  columns: [
    { key: 'name', label: 'Name', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => <StatusBadge value={r.role} /> },
    { key: 'createdAt', label: 'Created', render: (r) => fmtDate(r.createdAt) },
  ],
  filters: [{ name: 'role', label: 'Roles', options: ['ADMIN', 'IT_STAFF'] }],
  fields: (opts, editing) => [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password', label: editing ? 'New Password (leave blank to keep)' : 'Password', type: 'password', required: !editing },
    { name: 'role', label: 'Role', type: 'select', options: ['ADMIN', 'IT_STAFF'], required: true },
  ],
  defaults: { role: 'IT_STAFF' },
  toForm: (r) => ({ ...r, password: '' }),
};

export default function UsersPage() {
  return (
    <div>
      <PageHeader title="User Management" subtitle="ADMIN has full access · IT_STAFF can add / edit / view (no delete)" icon={Users} />
      <CrudPage config={config} />
    </div>
  );
}
