import React, { useEffect, useRef } from 'react';
import { fadeInUp, staggerFadeInUp, hoverScale, scaleIn, modalEnter } from '../utils/gsapAnimations';

export default function GSAPExample() {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      fadeInUp(headerRef.current, 0.2);
    }

    if (cardsRef.current.length > 0) {
      staggerFadeInUp(cardsRef.current, 0.15);
    }

    if (buttonRef.current) {
      hoverScale(buttonRef.current);
    }
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 ref={headerRef} className="text-4xl font-bold text-gray-800">
        GSAP Animations Demo
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((item, index) => (
          <div
            key={item}
            ref={(el) => (cardsRef.current[index] = el)}
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <h3 className="text-xl font-semibold mb-2">Card {item}</h3>
            <p className="text-gray-600">
              This card animates with GSAP stagger effect
            </p>
          </div>
        ))}
      </div>

      <button
        ref={buttonRef}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium"
      >
        Hover Me (GSAP Scale)
      </button>
    </div>
  );
}
