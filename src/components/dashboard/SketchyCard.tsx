import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
}

export const SketchyCard: React.FC<CardProps> = ({ title, subtitle, children, className = '', headerAction }) => {
  return (
    <div className={`bg-paper-dark sketchy-border p-8 relative transition-all duration-300 hover:shadow-xl ${className}`}>
      {/* Hand-drawn Underline for title */}
      {(title || subtitle) && (
        <div className="mb-8 flex justify-between items-start">
          <div>
            {title && (
              <h2 className="sketch-font text-3xl font-bold tracking-tight mb-1">{title}</h2>
            )}
            {subtitle && (
              <p className="text-[10px] uppercase tracking-widest text-secondary opacity-80 font-bold">{subtitle}</p>
            )}
          </div>
          {headerAction && (
             <div className="flex-shrink-0 ml-4">
                {headerAction}
             </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Decorative Shadow */}
      <div className="absolute inset-0 bg-ink/5 -z-20 translate-x-3 translate-y-3 pointer-events-none" />
    </div>
  );
};
