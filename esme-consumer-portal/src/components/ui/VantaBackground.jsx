import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import BIRDS from 'vanta/dist/vanta.birds.min';

const VantaBackground = ({ children, className = '' }) => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const effect = BIRDS({
        el: vantaRef.current,
        THREE: THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        backgroundColor: 0xffffff,
        backgroundAlpha: 1,
        color1: 0x3a494,
        color2: 0xd1ff,
        colorMode: "varianceGradient",
        quantity: 4,
        birdSize: 1.60,
        wingSpan: 30,
        speedLimit: 5,
        separation: 94,
        alignment: 20,
        cohesion: 48
      });
      setVantaEffect(effect);
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  // If used as a wrapper with children
  if (children) {
    return (
      <>
        <div 
          ref={vantaRef} 
          className={className}
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
          {children}
        </div>
      </>
    );
  }

  // If used as a standalone background element
  return (
    <div 
      ref={vantaRef} 
      className={className}
      style={{ 
        width: '100%',
        height: '100%'
      }}
    />
  );
};

export default VantaBackground;
