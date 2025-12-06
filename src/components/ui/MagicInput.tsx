import React from 'react';
import { cn } from '@/utils/cn';

interface MagicInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  as?: 'input' | 'textarea';
  label?: string;
  rows?: number;
}

const MagicInput: React.FC<MagicInputProps> = ({ 
  as = 'input', 
  className, 
  label,
  rows,
  ...props 
}) => {
  const Component = as as any;
  
  return (
    <div className="relative group w-full flex flex-col items-center">
      {label && (
        <label 
          className="block text-[10px] md:text-xs uppercase tracking-[0.2em] text-white mb-2 opacity-80 font-display text-center drop-shadow-md"
          style={{ fontFamily: '"Cinzel", serif' }} // Readable Display Font
        >
          {label}
        </label>
      )}
      <Component
        className={cn(
          "w-full bg-transparent border-none text-white placeholder-white/50",
          "focus:outline-none focus:ring-0 active:outline-none",
          "text-xl md:text-2xl py-2 px-4 text-center tracking-wide leading-relaxed", // Reduced size for readability
          "resize-none",
          "drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]",
          className
        )}
        style={{ 
          fontFamily: '"Cormorant Garamond", serif', // Legible Serif for input text
          fontStyle: 'italic',
          outline: 'none',
          boxShadow: 'none'
        }}
        spellCheck={false}
        autoComplete="off"
        rows={rows}
        {...props}
      />
      
      {/* Floating line */}
      <div className="h-[1px] w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent group-focus-within:via-white group-focus-within:w-2/3 transition-all duration-1000 ease-out mt-2" />
    </div>
  );
};

export default MagicInput;
