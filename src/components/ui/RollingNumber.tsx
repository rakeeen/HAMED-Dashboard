import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface RollingNumberProps {
  value: number;
  fontSize?: string;
  className?: string;
}

export const RollingNumber: React.FC<RollingNumberProps> = ({ value, fontSize = "text-5xl", className = "" }) => {
  const digits = value.toString().split('');

  return (
    <div dir="ltr" className={`flex items-baseline justify-center overflow-hidden ${fontSize} font-black sketch-font ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        {digits.map((digit, index) => {
          // Key based on position from the right to ensure stable transitions when length changes
          const positionKey = digits.length - index;
          return (
            <div key={positionKey} className="relative h-[1.1em] overflow-hidden flex items-center">
              <motion.span
                key={digit}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-100%' }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 40,
                  mass: 0.8
                }}
                className="inline-block"
              >
                {digit}
              </motion.span>
            </div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
