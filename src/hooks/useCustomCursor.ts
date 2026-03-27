import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLocation } from 'react-router-dom';

export const useCustomCursor = (cursorRef: React.RefObject<HTMLDivElement>) => {
  const location = useLocation();
  const resetRef = useRef<() => void>(null);

  useEffect(() => {
    if (!cursorRef.current) return;

    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let currentTarget: HTMLElement | null = null;
    let interactionMode: 'fill' | 'expand' | 'none' = 'none';

    // Reduced duration for snappier feel (0.15s instead of 0.4s)
    const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.15, ease: "power2.out" });
    const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.15, ease: "power2.out" });
    
    const widthTo = gsap.quickTo(cursorRef.current, "width", { duration: 0.2, ease: "power3.out" });
    const heightTo = gsap.quickTo(cursorRef.current, "height", { duration: 0.2, ease: "power3.out" });
    const opacityTo = gsap.quickTo(cursorRef.current, "opacity", { duration: 0.2, ease: "power3.out" });
    const radiusTo = gsap.quickTo(cursorRef.current, "borderRadius", { duration: 0.2, ease: "power3.out" });

    const updatePosition = () => {
      if (isHovering && currentTarget && interactionMode === 'fill') {
        const rect = currentTarget.getBoundingClientRect();
        xTo(rect.left - 1); // Centering for the +2px width/height offset
        yTo(rect.top - 1);
      } else {
        xTo(mouseX);
        yTo(mouseY);
      }
    };

    const reset = () => {
      isHovering = false;
      currentTarget = null;
      interactionMode = 'none';
      widthTo(16);
      heightTo(16);
      opacityTo(1);
      radiusTo(100);
      
      gsap.to(cursorRef.current, { 
        xPercent: -50,
        yPercent: -50,
        backgroundColor: '#E8DFD7',
        duration: 0.2, 
        ease: 'power3.out' 
      });
      updatePosition();
    };
    resetRef.current = reset;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updatePosition();
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Categorize interaction
      const buttonEl = target.closest('button');
      const imageEl = target.closest('img');
      const projectLinkEl = target.closest('a[href]:not(nav a)');
      
      const interactiveEl = buttonEl || imageEl || projectLinkEl;

      if (interactiveEl instanceof HTMLElement) {
        // Exclude navigation tabs
        if (interactiveEl.closest('nav')) {
          reset();
          return;
        }

        isHovering = true;
        currentTarget = interactiveEl;
        const rect = interactiveEl.getBoundingClientRect();
        const style = window.getComputedStyle(interactiveEl);

        // Logic based on element type
        if (buttonEl) {
          // MODE: FILL
          interactionMode = 'fill';
          widthTo(rect.width + 2); // Added 2px to ensure perfect coverage of borders/edges
          heightTo(rect.height + 2);
          radiusTo(parseInt(style.borderRadius) || 0);
          
          gsap.to(cursorRef.current, { 
            xPercent: 0,
            yPercent: 0,
            backgroundColor: '#FFFFFF',
            duration: 0.2, 
            ease: 'power3.out' 
          });
        } else {
          // MODE: EXPAND (Images, Project Cards, Next/Prev links)
          interactionMode = 'expand';
          widthTo(40); // Reduced from 60 for a more subtle feel
          heightTo(40);
          radiusTo(100);
          
          gsap.to(cursorRef.current, { 
            xPercent: -50,
            yPercent: -50,
            backgroundColor: '#FFFFFF',
            duration: 0.2, 
            ease: 'power3.out' 
          });
        }
        
        updatePosition();
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, img, a[href]')) {
        reset();
      }
    };

    const onClick = () => {
      setTimeout(() => {
         reset();
      }, 50);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseout', onMouseOut);
    window.addEventListener('click', onClick);

    // Initial state setup
    gsap.set(cursorRef.current, { 
      xPercent: -50, 
      yPercent: -50,
      width: 16,
      height: 16,
      borderRadius: '100px',
      backgroundColor: '#E8DFD7',
      mixBlendMode: 'difference',
      position: 'fixed',
      top: 0,
      left: 0,
      pointerEvents: 'none',
      zIndex: 9999
    });

    const checkTarget = setInterval(() => {
      if (isHovering && currentTarget && !document.body.contains(currentTarget)) {
        reset();
      }
    }, 100);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      window.removeEventListener('click', onClick);
      clearInterval(checkTarget);
    };
  }, [cursorRef]);

  useEffect(() => {
    resetRef.current?.();
  }, [location.pathname]);

  return { reset: resetRef.current };
};
