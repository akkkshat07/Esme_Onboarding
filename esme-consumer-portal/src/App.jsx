import React, { useState } from 'react';
import { useTheme } from './contexts/ThemeContext';
import AuthForm from './components/auth/AuthForm';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
  const { isDark } = useTheme();
  const [token, setToken] = useState(localStorage.getItem('esme_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('esme_user') || 'null'));

  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('esme_token');
    localStorage.removeItem('esme_user');
    setToken(null);
    setUser(null);
  };

  if (!token || !user) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-teal-100 selection:text-teal-900 transition-colors duration-300 ${
      isDark 
        ? 'bg-slate-950 text-slate-100' 
        : 'bg-[#f8fafc] text-slate-900'
    }`}>
      {user.role === 'admin' || user.role === 'super_admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <CandidateDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
