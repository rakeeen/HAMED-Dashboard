import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
}

export const SketchyTextarea: React.FC<TextareaProps> = ({ label, helperText, className = '', ...props }) => {
  return (
    <div className="space-y-2 mb-8 flex-1">
      {label && (
        <label className="text-[11px] uppercase tracking-widest text-ink font-bold opacity-100 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <textarea
          className={`w-full bg-transparent border-2 border-ink/10 p-5 text-ink font-sans transition-all placeholder:text-ink/20 focus:placeholder:text-transparent min-h-[160px] outline-none focus:border-sepia text-base leading-relaxed ${className}`}
          {...props}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-ink/30 ml-1 mt-1 font-mono font-bold tracking-tight">{helperText}</p>
      )}
    </div>
  );
};
