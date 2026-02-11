import React from 'react';

export const Input = ({ label, icon: Icon, error, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-bold text-slate-600 uppercase tracking-wider ml-1">{label}</label>}
    <div className="relative group">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-all duration-200">
          <Icon size={18} />
        </div>
      )}
      <input
        className={`w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3 outline-none transition-all duration-200 ease-out placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:shadow-lg focus:shadow-teal-500/10 hover:border-slate-300 hover:shadow-md ${Icon ? 'pl-10 pr-4' : 'px-4'} ${props.readOnly ? '!bg-slate-100 !text-slate-500 cursor-not-allowed' : ''} ${props.className || ''}`}
        {...props}
      />
    </div>
    {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium animate-fade-in-up">{error}</p>}
  </div>
);

export const Button = ({ children, loading, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'relative overflow-hidden font-bold text-sm tracking-wide disabled:opacity-70 flex items-center justify-center gap-2 rounded-full transition-all duration-200 ease-out active:scale-[0.97] btn-press';
  
  const variants = {
    primary: 'bg-gradient-to-r from-teal-600 to-teal-500 text-white px-7 py-3.5 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5',
    secondary: 'bg-white text-slate-700 border border-slate-200 px-6 py-3 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md',
    teal: 'bg-gradient-to-r from-teal-600 to-teal-500 text-white px-7 py-3.5 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white px-7 py-3.5 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 hover:-translate-y-0.5',
    ghost: 'bg-transparent text-slate-600 px-4 py-2 hover:bg-slate-100 hover:text-slate-900',
  };

  return (
    <button
      disabled={loading || props.disabled}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : children}
      <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></span>
    </button>
  );
};

export const Card = ({ children, className = '', hover = true, ...props }) => (
  <div 
    className={`bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-300 ease-out ${hover ? 'hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300' : ''} ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const PageTransition = ({ children, className = '' }) => (
  <div className={`animate-fade-in-up ${className}`}>
    {children}
  </div>
);

export const FadeIn = ({ children, delay = 0, className = '' }) => (
  <div 
    className={`opacity-0 animate-fade-in-up ${className}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

export const SlideIn = ({ children, direction = 'up', delay = 0, className = '' }) => {
  const directions = {
    up: 'animate-fade-in-up',
    down: 'animate-fade-in-down',
    left: 'animate-fade-in-left',
    right: 'animate-fade-in-right',
  };
  
  return (
    <div 
      className={`opacity-0 ${directions[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
};

export const ScaleIn = ({ children, delay = 0, className = '' }) => (
  <div 
    className={`opacity-0 animate-scale-in ${className}`}
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
  >
    {children}
  </div>
);

