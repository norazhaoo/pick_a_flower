import React from 'react';
import { cn } from '@/utils/cn';

interface SigilButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const SigilButton: React.FC<SigilButtonProps> = ({ 
  children, 
  className, 
  variant = 'primary',
  ...props 
}) => {
  return (
    <button
      className={cn(
        "relative px-8 py-3 font-display tracking-[0.2em] uppercase text-sm transition-all duration-500 group overflow-hidden",
        variant === 'primary' 
          ? "text-white/80 hover:text-white" 
          : "text-white/60 hover:text-white",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
      
      {/* Border lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
      
      {/* Particles or glimmer effect could go here */}
    </button>
  );
};

export default SigilButton;

