import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const SketchyInput: React.FC<InputProps> = ({ label, helperText, className = '', ...props }) => {
  return (
    <div className="space-y-2 mb-6 flex-1">
      {label && (
        <label className="text-[11px] uppercase tracking-widest text-ink font-bold opacity-100 ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`w-full bg-transparent border-b-2 border-ink/20 outline-none px-0 py-4 text-ink font-sans transition-all placeholder:text-ink/20 focus:placeholder:text-transparent focus:border-sepia text-base ${className}`}
          {...props}
        />
      </div>
      {helperText && (
        <p className="text-[10px] text-ink/30 ml-1 mt-1 font-mono font-bold tracking-tight">{helperText}</p>
      )}
    </div>
  );
};
