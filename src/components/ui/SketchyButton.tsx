import React, { ButtonHTMLAttributes } from 'react';

interface SketchyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  filled?: boolean;
}

export const SketchyButton: React.FC<SketchyButtonProps> = ({ filled, className, children, ...props }) => {
  return (
    <button className={`sketchy-btn ${filled ? 'filled' : ''} ${className || ''}`} {...props}>
      {children}
    </button>
  );
};
