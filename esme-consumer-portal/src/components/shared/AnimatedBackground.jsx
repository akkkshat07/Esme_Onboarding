import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AnimatedBackground({ children }) {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen relative ${isDark ? 'animated-bg-dark' : 'animated-bg-light'}`}>
      {/* Floating Orbs */}
      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className={`fixed inset-0 pointer-events-none z-0 ${isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
        style={{
          backgroundImage: `
            linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
