// Login page: email + password -> JWT token
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Mail, Lock, Network, ShieldCheck, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';
import { isDemoMode } from '../config';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@itims.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  }

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left: brand panel */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />
        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-2.5"><Cpu className="h-7 w-7" /></div>
          <span className="text-xl font-bold">ITIMS</span>
        </div>
        <div className="relative">
          <h1 className="text-4xl font-bold leading-tight">IT Infrastructure<br />Management System</h1>
          <p className="mt-4 max-w-md text-indigo-100">One place to manage computers, IP addresses, network, ISP links, firewalls, Wi-Fi, servers, CCTV and IT complaints.</p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
            {[[Network, 'Network'], [ShieldCheck, 'Security'], [Ticket, 'Helpdesk']].map(([I, t]) => (
              <div key={t} className="rounded-xl bg-white/10 p-4 backdrop-blur"><I className="h-6 w-6" /><p className="mt-2 text-sm font-medium">{t}</p></div>
            ))}
          </div>
        </div>
        <p className="relative text-sm text-indigo-200">© {new Date().getFullYear()} IT Department</p>
      </div>

      {/* Right: login form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-2 text-indigo-600"><Cpu className="h-7 w-7" /><span className="text-xl font-bold">ITIMS</span></div>
          <h2 className="text-3xl font-bold text-slate-900">{isDemoMode ? 'Demo mode' : 'Sign in'}</h2>
          <p className="mt-1 text-slate-500">{isDemoMode ? 'This presentation uses sample data only. No database or real account is used.' : 'Enter your credentials to access the dashboard.'}</p>

          {isDemoMode ? (
            <button type="button" onClick={submit} className="btn-primary mt-8 w-full !py-3">Enter demo</button>
          ) : <form onSubmit={submit} className="mt-8 space-y-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" required className="input !py-2.5 !pl-10" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="password" required className="input !py-2.5 !pl-10" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>
            <button className="btn-primary w-full !py-3" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>}

          {!isDemoMode && <div className="mt-8 rounded-xl border border-dashed border-slate-300 p-4 text-sm">
            <p className="mb-2 font-semibold text-slate-600">Demo accounts (click to fill)</p>
            <button type="button" onClick={() => fill('admin@itims.com', 'Admin@123')} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 cursor-pointer"><b>Admin:</b> admin@itims.com / Admin@123</button>
            <button type="button" onClick={() => fill('staff@itims.com', 'Staff@123')} className="block w-full rounded-lg px-2 py-1.5 text-left hover:bg-slate-100 cursor-pointer"><b>IT Staff:</b> staff@itims.com / Staff@123</button>
          </div>}
        </div>
      </div>
    </div>
  );
}
