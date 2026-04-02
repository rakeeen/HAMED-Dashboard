import React, { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'metallic';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children?: ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}: ButtonProps) => {
  const baseStyles = "px-8 py-3 font-semibold text-sm tracking-wide transition-all duration-300 rounded-full disabled:opacity-50";
  
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-white text-on-primary hover:bg-neutral-200",
    secondary: "bg-transparent border border-outline-variant/30 text-white hover:bg-white/5",
    metallic: "metallic-gradient text-on-primary hover:opacity-90"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
