import React, { useState } from 'react';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { Input, Button } from '../shared/UI';
import VantaBackground from '../ui/VantaBackground';
import esmeLogo from '../../assets/Esme-Logo-01.png';
const API_URL = import.meta.env.VITE_API_URL || '/api';
export default function AuthForm({ onAuthSuccess }) {
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
    <div className="min-h-screen flex font-sans relative">
      {}
      <div className="fixed inset-0 z-0">
        <VantaBackground />
      </div>
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-slate-800 relative z-10">
        <div>
          <img src={esmeLogo} alt="Esme Logo" className="h-16" />
        </div>
        <div className="max-w-lg mb-20">
          <h2 className="text-3xl font-light mb-6 leading-tight text-slate-800">Seamless onboarding for the modern workforce.</h2>
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-400">© 2026 Esme Consumer</div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {}
          <div className="text-center mb-8 lg:hidden">
            <img src={esmeLogo} alt="Esme Logo" className="h-12 mx-auto" />
          </div>
          {}
          <div className="bg-white/98 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-10 space-y-6">
              {}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">
                  {isSignup ? 'Create Account' : 'Welcome'}
                </h2>
                <p className="text-slate-500">
                  {isSignup ? 'Enter your details to get started.' : 'Access your portal securely.'}
                </p>
              </div>
              {}
              {!isSignup && (
                <div className="flex p-1.5 rounded-xl bg-slate-100/80 animate-fade-in">
                  <button 
                    onClick={() => handleMethodChange('mobile')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${loginMethod === 'mobile' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >Mobile</button>
                  <button 
                    onClick={() => handleMethodChange('email')}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${loginMethod === 'email' ? 'bg-white shadow-md text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                  >Email</button>
                </div>
              )}
              {}
              <form onSubmit={handleAuth} className="space-y-5">
                <div 
                  key={isSignup ? 'signup' : 'login'} 
                  className="space-y-5 animate-fade-in-up"
                >
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
                </div>
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-fade-in">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <Button type="submit" loading={loading} className="w-full" variant="primary">
                  {isSignup ? 'Create Account' : (isOtpSent ? 'Verify code & Sign In' : 'Sign In')}
                </Button>
                <div className="text-center pt-2">
                  <button 
                    type="button" 
                    onClick={toggleMode} 
                    className="text-sm text-slate-600 transition-all duration-300 hover:text-teal-600 hover:scale-105 transform font-medium"
                  >
                    {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
