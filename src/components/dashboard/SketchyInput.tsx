import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const SketchyInput: React.FC<InputProps> = ({ label, helperText, className = '', ...props }) => {
  return (
    <div className="space-y-2 mb-6 flex-1">
      {label && (
        <label className="text-[10px] uppercase tracking-[0.2em] text-ink font-black opacity-40 group-focus-within:opacity-100 transition-opacity ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`w-full bg-transparent border-b-2 border-ink/10 outline-none px-0 py-4 text-ink font-sans transition-all placeholder:text-ink/20 focus:placeholder:text-transparent focus:border-sepia text-base opacity-40 focus:opacity-100 ${className}`}
          {...props}
        />
      </div>
      {helperText && (
        <p className="text-[9px] text-ink/30 ml-1 mt-1 font-mono font-bold tracking-tight uppercase">{helperText}</p>
      )}
    </div>
  );
};
