import React, { useRef } from 'react';
import { useCustomCursor } from '../../hooks/useCustomCursor';
import { useSiteContext } from '../../context/SiteContext';

export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const { settings } = useSiteContext();
  useCustomCursor(cursorRef);

  if (!settings.showCursor) return null;

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-4 h-4 rounded-full pointer-events-none z-[9999] opacity-100 hidden md:block"
      style={{
        backgroundColor: '#E8DFD7',
        mixBlendMode: 'difference',
        transform: 'translate(-50%, -50%)',
        willChange: 'transform, width, height, border-radius',
      }}
    />
  );
};
