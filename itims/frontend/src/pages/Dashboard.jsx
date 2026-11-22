// Dashboard: stat cards + charts + recent complaints (data from /api/dashboard/stats)
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Monitor, HardDrive, Globe, Ticket, Cctv, Binary, LayoutDashboard, Wifi, ArrowRight } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useToast } from '../context/ToastContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import { fmtDate } from '../utils/format';

// Chart colours by status name
const STATUS_COLORS = { ACTIVE: '#10b981', INACTIVE: '#ef4444', UNDER_REPAIR: '#f59e0b', OPEN: '#3b82f6', ASSIGNED: '#f59e0b', IN_PROGRESS: '#6366f1', RESOLVED: '#10b981', CLOSED: '#94a3b8' };

function ChartCard({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 font-semibold text-slate-800">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export default function Dashboard() {
  const toast = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/stats').then((r) => setData(r.data.data)).catch((e) => toast.error(errMsg(e)));
  }, []); // eslint-disable-line

  if (!data) return <Spinner text="Loading dashboard..." />;
  const { cards, charts, recentComplaints } = data;
  const cctvData = [{ name: 'Working', value: cards.cctvWorking }, { name: 'Not Working', value: cards.cctvNotWorking }];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Live overview of the IT infrastructure" icon={LayoutDashboard} />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Computers" value={cards.totalComputers} icon={Monitor} tone="indigo" />
        <StatCard title="Total Devices" value={cards.totalDevices} icon={HardDrive} tone="blue" hint="Hardware, network, servers, APs, CCTV" />
        <StatCard title="Active ISP Links" value={`${cards.activeIsp} / ${cards.totalIsp}`} icon={Globe} tone={cards.activeIsp === cards.totalIsp ? 'green' : 'amber'} />
        <StatCard title="Pending Complaints" value={cards.pendingComplaints} icon={Ticket} tone="red" hint="Open + Assigned + In progress" />
        <StatCard title="CCTV Working" value={cards.cctvWorking} icon={Cctv} tone="green" />
        <StatCard title="CCTV Not Working" value={cards.cctvNotWorking} icon={Cctv} tone="red" />
        <StatCard title="Free IP Addresses" value={cards.freeIps} icon={Binary} tone="violet" />
        <StatCard title="Access Points Online" value={`${cards.apOnline} / ${cards.totalAps}`} icon={Wifi} tone="blue" />
      </div>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title="Computer Status">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={charts.computerStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {charts.computerStatus.map((e) => <Cell key={e.name} fill={STATUS_COLORS[e.name] || '#6366f1'} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, String(n).replace('_', ' ')]} />
              <Legend formatter={(v) => String(v).replace('_', ' ')} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaints by Category">
          <ResponsiveContainer>
            <BarChart data={charts.complaintCategory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: '#eef2ff' }} />
              <Bar dataKey="value" name="Complaints" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaints by Status">
          <ResponsiveContainer>
            <BarChart data={charts.complaintStatus} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} tickFormatter={(v) => v.replace('_', ' ')} width={90} />
              <Tooltip cursor={{ fill: '#eef2ff' }} />
              <Bar dataKey="value" name="Complaints" radius={[0, 6, 6, 0]}>
                {charts.complaintStatus.map((e) => <Cell key={e.name} fill={STATUS_COLORS[e.name]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="CCTV Health">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={cctvData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                <Cell fill="#10b981" /><Cell fill="#ef4444" />
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* ISP link status */}
        <div className="card p-5">
          <h3 className="mb-4 font-semibold text-slate-800">ISP Link Status</h3>
          <div className="space-y-3">
            {charts.isps.map((i) => (
              <div key={i.providerName} className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${i.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}><Globe className="h-5 w-5" /></div>
                  <div>
                    <p className="font-medium text-slate-800">{i.providerName}</p>
                    <p className="text-xs text-slate-500">{i.bandwidth}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1"><StatusBadge value={i.linkType} /><StatusBadge value={i.status} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent complaints */}
        <div className="card p-5 lg:col-span-2 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Recent Complaints</h3>
            <Link to="/complaints" className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-400">
                <tr><th className="pb-2">Ticket</th><th className="pb-2">Priority</th><th className="pb-2">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentComplaints.map((c) => (
                  <tr key={c.id}>
                    <td className="w-full max-w-0 py-2.5 pr-2">
                      <p className="truncate font-medium text-slate-800">{c.title}</p>
                      <p className="text-xs text-slate-400">{c.ticketNo} · {fmtDate(c.createdAt)}</p>
                    </td>
                    <td className="whitespace-nowrap py-2.5 pr-2"><StatusBadge value={c.priority} /></td>
                    <td className="whitespace-nowrap py-2.5"><StatusBadge value={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
