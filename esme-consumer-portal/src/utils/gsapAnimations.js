import gsap from 'gsap';

export const fadeInUp = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.6, delay, ease: 'power3.out' }
  );
};

export const fadeIn = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { opacity: 0 },
    { opacity: 1, duration: 0.5, delay, ease: 'power2.inOut' }
  );
};

export const scaleIn = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, delay, ease: 'back.out(1.7)' }
  );
};

export const slideInLeft = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { x: -50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, delay, ease: 'power3.out' }
  );
};

export const slideInRight = (element, delay = 0) => {
  gsap.fromTo(
    element,
    { x: 50, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, delay, ease: 'power3.out' }
  );
};

export const staggerFadeInUp = (elements, staggerDelay = 0.1) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: staggerDelay,
      ease: 'power3.out'
    }
  );
};

export const hoverScale = (element) => {
  element.addEventListener('mouseenter', () => {
    gsap.to(element, { scale: 1.05, duration: 0.3, ease: 'power2.out' });
  });
  element.addEventListener('mouseleave', () => {
    gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' });
  });
};

export const buttonClick = (element) => {
  gsap.to(element, {
    scale: 0.95,
    duration: 0.1,
    ease: 'power2.out',
    onComplete: () => {
      gsap.to(element, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.3)' });
    }
  });
};

export const modalEnter = (element) => {
  gsap.fromTo(
    element,
    { scale: 0.9, opacity: 0, y: 20 },
    { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
  );
};

export const modalExit = (element, onComplete) => {
  gsap.to(element, {
    scale: 0.9,
    opacity: 0,
    y: 20,
    duration: 0.3,
    ease: 'power2.in',
    onComplete
  });
};

export const cardFlip = (element) => {
  gsap.to(element, {
    rotationY: 360,
    duration: 0.6,
    ease: 'power2.inOut'
  });
};

export const shake = (element) => {
  gsap.to(element, {
    x: -10,
    duration: 0.1,
    repeat: 5,
    yoyo: true,
    ease: 'power1.inOut'
  });
};

export const pulse = (element) => {
  gsap.to(element, {
    scale: 1.1,
    duration: 0.5,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut'
  });
};
