import React, { useState } from 'react';
import AuthForm from './components/auth/AuthForm';
import CandidateDashboard from './components/candidate/CandidateDashboard';
import AdminDashboard from './components/admin/AdminDashboard';

export default function App() {
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
    <div className="min-h-screen font-sans bg-gray-50 text-slate-900">
      {user.role === 'admin' || user.role === 'super_admin' ? (
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        <CandidateDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
