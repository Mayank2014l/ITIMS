// Stores the logged-in user + token and shares it with the whole app
import { createContext, useContext, useState } from 'react';
import api from '../api/axios';
import { isDemoMode } from '../config';

const AuthContext = createContext(null);
const DEMO_USER = { id: 1, name: 'Alex Morgan', email: 'admin@itims.demo', role: 'ADMIN' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('itims_user') || 'null'));

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: loggedUser } = res.data.data;
    localStorage.setItem('itims_token', token);
    localStorage.setItem('itims_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  }

  function logout() {
    localStorage.removeItem('itims_token');
    localStorage.removeItem('itims_user');
    setUser(null);
  }

  const isAdmin = user?.role === 'ADMIN';

  return <AuthContext.Provider value={{ user, login, logout, isAdmin }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
