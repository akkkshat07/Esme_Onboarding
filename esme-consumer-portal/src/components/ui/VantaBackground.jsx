import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const VantaBackground = ({ children }) => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    let effect = null;
    
    const initVanta = async () => {
      if (vantaRef.current && !vantaEffect) {
        try {

          window.THREE = THREE;
          
          const VANTA = await import('vanta/dist/vanta.birds.min.js');
          
          effect = VANTA.default({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            backgroundColor: 0x7192f,
            backgroundAlpha: 1,
            color1: 0x17483f,
            color2: 0xd1ff,
            colorMode: "varianceGradient",
            quantity: 5,
            birdSize: 1,
            wingSpan: 30,
            speedLimit: 5,
            separation: 20,
            alignment: 20,
            cohesion: 20
          });
          
          setVantaEffect(effect);
        } catch (err) {
          console.error('Failed to initialize Vanta:', err);
        }
      }
    };

    initVanta();

    return () => {
      if (effect) effect.destroy();
    };
  }, []);

  return (
    <>
      {}
      <div 
        ref={vantaRef} 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1
        }}
      />
      {}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
        {children}
      </div>
    </>
  );
};

export default VantaBackground;
