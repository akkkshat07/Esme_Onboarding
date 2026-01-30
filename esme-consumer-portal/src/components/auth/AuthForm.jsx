import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, Moon, Sun } from 'lucide-react';
import { Input, Button } from '../shared/UI';
import { useTheme } from '../../contexts/ThemeContext';
import VantaBackground from '../ui/VantaBackground';
import esmeLogo from '../../assets/Esme-Logo-01.png';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function AuthForm({ onAuthSuccess }) {
  const { isDark, toggleTheme } = useTheme();
  const [isSignup, setIsSignup] = useState(false);
  const [loginMethod, setLoginMethod] = useState('mobile');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    otp: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      let url = isSignup ? `${API_URL}/signup` : `${API_URL}/login`;
      let body = { ...formData };

      if (!isSignup) {
        if (loginMethod === 'email') {
          body = { email: formData.email, password: formData.password };
        } else {
          if (isOtpSent) {
            url = `${API_URL}/verify-otp`;
            body = { mobile: formData.mobile, otp: formData.otp };
          } else {
            body = { mobile: formData.mobile, password: formData.password };
          }
        }
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server Error: ${res.status}`);
      }

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      if (isSignup) {
        setIsSignup(false);
        setLoginMethod('mobile');
        setError('');
        alert('Account created! Please sign in.');
      } else {
        localStorage.setItem('esme_token', data.token);
        localStorage.setItem('esme_user', JSON.stringify(data.user));
        onAuthSuccess(data.token, data.user);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
         setError('Request timed out. Server might be sleeping. Please try again.');
      } else if (err.message === 'Invalid credentials' && !isSignup) {
         setError('Account not found or password incorrect. Please Sign Up if you are new.');
      } else {
         setError(err.message);
      }
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: formData.mobile }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error('Failed to send OTP');
      setIsOtpSent(true);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('OTP request timed out. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
      clearTimeout(timeoutId);
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError('');
    setIsOtpSent(false);
  };

  const handleMethodChange = (method) => {
    setLoginMethod(method);
    setError('');
    setIsOtpSent(false);
  };

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${isDark ? 'bg-slate-900' : ''}`}>
      <div className={`hidden lg:flex lg:w-1/2 ${isDark ? 'bg-slate-950' : 'bg-[#0f172a]'} flex-col justify-between p-12 ${isDark ? 'text-slate-100' : 'text-white'} relative overflow-hidden`}>
        {/* Vanta Birds Background */}
        <div className="absolute inset-0 z-0">
          <VantaBackground />
        </div>
        <div className="relative z-10">
          <img src={esmeLogo} alt="Esme Logo" className="h-16" />
        </div>
        <div className="max-w-lg mb-20 z-10 relative">
          <h2 className={`text-3xl font-light mb-6 leading-tight ${isDark ? 'text-slate-100' : 'text-white'}`}>Seamless onboarding for the modern workforce.</h2>
          <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Securely manage documentation, compliance, and employee data in one unified consumer portal.</p>
        </div>
        <div className={`text-xs uppercase tracking-widest z-10 relative ${isDark ? 'text-slate-600' : 'text-slate-500'}`}>© 2026 Esme Consumer</div>
      </div>

      <div className={`w-full lg:w-1/2 ${isDark ? 'bg-slate-800' : 'bg-slate-50'} flex items-center justify-center p-8 relative transition-colors duration-300`}>
        {}
        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${isDark ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600' : 'bg-gray-200 text-slate-700 hover:bg-gray-300'}`}
          title="Toggle dark mode"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className={`w-full max-w-md space-y-8 ${isDark ? 'text-slate-100' : ''}`}>
          <div className="text-center mb-8 lg:hidden">
            <img src={esmeLogo} alt="Esme Logo" className="h-12 mx-auto" />
          </div>

          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{isSignup ? 'Create Account' : 'Welcome'}</h2>
            <p className={`mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{isSignup ? 'Enter your details to get started.' : 'Access your portal securely.'}</p>
          </div>

          {!isSignup && (
            <div className={`flex p-1 rounded-xl mb-6 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
              <button 
                onClick={() => handleMethodChange('mobile')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'mobile' ? isDark ? 'bg-slate-600 shadow text-white' : 'bg-white shadow text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >Mobile</button>
              <button 
                onClick={() => handleMethodChange('email')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginMethod === 'email' ? isDark ? 'bg-slate-600 shadow text-white' : 'bg-white shadow text-slate-900' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >Email</button>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            {isSignup && (
              <>
                <Input label="Full Name" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" />
                <Input label="Email Address" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@company.com" />
                <div className="flex gap-2">
                  <div className="w-20">
                    <Input label="Code" value="+91" disabled />
                  </div>
                  <div className="flex-1">
                    <Input label="Mobile Number" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="9876543210" maxLength={10} />
                  </div>
                </div>
              </>
            )}
            
            {!isSignup && (
              loginMethod === 'email' ? (
                <Input label="Email Address" type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="name@company.com" />
              ) : (
                <div className="flex gap-2">
                  <div className="w-20">
                    <Input label="Code" value="+91" disabled />
                  </div>
                  <div className="flex-1">
                    <Input label="Mobile Number" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="9876543210" maxLength={10} />
                  </div>
                </div>
              )
            )}

            {!isOtpSent && (
              <Input label="Password" type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" />
            )}

            {isOtpSent && !isSignup && (
              <Input label="Enter OTP" name="otp" required value={formData.otp} onChange={handleChange} placeholder="••••••" maxLength={6} className="text-center tracking-widest font-bold" />
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {!isSignup && loginMethod === 'mobile' && !isOtpSent && (
              <div className="text-right">
                <button type="button" onClick={handleSendOtp} className="text-xs font-semibold text-teal-600">Login via OTP instead?</button>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full" variant="primary">
              {isSignup ? 'Create Account' : (isOtpSent ? 'Verify code & Sign In' : 'Sign In')}
            </Button>

            <div className="text-center pt-2">
              <button type="button" onClick={toggleMode} className="text-sm text-slate-600">
                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
