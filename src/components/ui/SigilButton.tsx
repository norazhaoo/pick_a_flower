import React from 'react';

interface SigilButtonProps {
  onClick: () => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const SigilButton: React.FC<SigilButtonProps> = ({ onClick, label, disabled, className }) => {
  return (
    <button 
      onClick={onClick} 
      disabled={disabled} 
      className={`sigil-button ${className || ''}`}
      aria-label={label}
    >
      <svg viewBox="0 0 100 100" className="sigil-svg">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1" fill="transparent" className="sigil-ring-outer" />
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="transparent" className="sigil-ring-inner" />
        {/* Runes / Glyphs */}
        <path d="M50 15 L50 35 M50 65 L50 85 M15 50 L35 50 M65 50 L85 50" stroke="currentColor" strokeWidth="2" className="sigil-cross" />
        <circle cx="50" cy="50" r="10" fill="currentColor" className="sigil-core" filter="url(#glow)" />
      </svg>
      {label && <span className="sigil-label">{label}</span>}
    </button>
  );
};

