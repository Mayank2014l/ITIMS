// Stores the logged-in user + token and shares it with the whole app
import { createContext, useContext, useState } from 'react';
import api from '../api/axios';
import { isDemoMode } from '../config';

const AuthContext = createContext(null);
const DEMO_USER = { id: 1, name: 'Alex Morgan', email: 'admin@itims.demo', role: 'ADMIN' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => isDemoMode ? DEMO_USER : JSON.parse(localStorage.getItem('itims_user') || 'null'));

  async function login(email, password) {
    if (isDemoMode) {
      setUser(DEMO_USER);
      return;
    }
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data.data;
    localStorage.setItem('itims_token', token);
    localStorage.setItem('itims_user', JSON.stringify(user));
    setUser(user);
  }

  function logout() {
    if (isDemoMode) {
      setUser(null);
      return;
    }
    localStorage.removeItem('itims_token');
    localStorage.removeItem('itims_user');
    setUser(null);
  }

  const isAdmin = user?.role === 'ADMIN';

  return <AuthContext.Provider value={{ user, login, logout, isAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
