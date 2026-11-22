// All page routes. Pages inside <ProtectedRoute> need login.
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Computers from './pages/Computers';
import IpManagement from './pages/IpManagement';
import NetworkPage from './pages/Network';
import IspPage from './pages/Isp';
import FirewallPage from './pages/Firewall';
import WifiPage from './pages/Wifi';
import ServerRoom from './pages/ServerRoom';
import CctvPage from './pages/Cctv';
import Complaints from './pages/Complaints';
import Reports from './pages/Reports';
import UsersPage from './pages/Users';

// Redirects to /login if not logged in; optionally only for ADMIN
function ProtectedRoute({ children, adminOnly }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/computers" element={<Computers />} />
        <Route path="/ips" element={<IpManagement />} />
        <Route path="/network" element={<NetworkPage />} />
        <Route path="/isp" element={<IspPage />} />
        <Route path="/firewall" element={<FirewallPage />} />
        <Route path="/wifi" element={<WifiPage />} />
        <Route path="/servers" element={<ServerRoom />} />
        <Route path="/cctv" element={<CctvPage />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
