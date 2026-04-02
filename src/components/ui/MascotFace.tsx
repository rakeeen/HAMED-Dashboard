import React from 'react';

interface MascotFaceProps {
  size?: number;
  color?: string;
}

export const MascotFace = ({ size = 48, color = 'var(--ink)' }: MascotFaceProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ color }}>
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2.5" fill="none" />
    {/* Left Eye - Stroke only */}
    <circle cx="16" cy="20" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    {/* Right Eye - Winking stroke */}
    <path d="M28 20 Q32 16 36 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    {/* Mouth - Stroke only */}
    <path d="M14 32 Q24 38 34 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
  </svg>
);
