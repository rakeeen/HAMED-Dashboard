import React, { useEffect, useState } from 'react';
import { animate } from 'motion/react';

interface RollingNumberProps {
  value: number;
  fontSize?: string;
  className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({ value, fontSize = "text-5xl", className = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(v) {
        setDisplayValue(Math.round(v));
      }
    });
    return () => controls.stop();
  }, [value]);

  return (
    <div dir="ltr" className={`flex items-baseline justify-center overflow-hidden ${fontSize} font-black sketch-font ${className}`}>
      {displayValue.toLocaleString()}
    </div>
  );
};
