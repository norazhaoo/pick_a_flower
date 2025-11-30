import React, { useEffect, useRef } from 'react';
import { usePensieveStore } from '../../state/pensieveState';

interface MagicalInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  className?: string;
  multiline?: boolean;
  autoFocus?: boolean;
}

const MagicalInput: React.FC<MagicalInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className, 
  multiline,
  autoFocus,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const triggerRipple = usePensieveStore((state) => state.triggerRipple);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  // Handle external updates
  useEffect(() => {
    if (ref.current) {
       // If the element is empty but value is not (initial load), set it.
       if (ref.current.innerText === '' && value !== '') {
         ref.current.innerText = value;
       }
       // If value is empty but element is not (reset), clear it.
       if (value === '' && ref.current.innerText !== '') {
         ref.current.innerText = '';
       }
    }
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.innerText;
    onChange(text);
    triggerRipple();
  };

  // Prevent newlines in single-line mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div
      ref={ref}
      contentEditable
      className={`magical-input ${multiline ? 'multiline' : 'singleline'} ${className || ''} ${!value ? 'empty' : ''}`}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      data-placeholder={placeholder}
    />
  );
};

interface MagicInputOverlayProps {
  diaryValue?: string;
  passphraseValue?: string;
  onDiaryChange?: (val: string) => void;
  onPassphraseChange?: (val: string) => void;
  mode: 'create' | 'unlock';
  visible: boolean;
  headerText?: string;
  children?: React.ReactNode; // For the SigilButton
}

export const MagicInputOverlay: React.FC<MagicInputOverlayProps> = ({
  diaryValue = '',
  passphraseValue = '',
  onDiaryChange,
  onPassphraseChange,
  mode,
  visible,
  headerText,
  children
}) => {
  if (!visible) return null;

  return (
    <div className="magic-overlay-container">
      {headerText && <h2 className="magic-header">{headerText}</h2>}
      
      {mode === 'create' && onDiaryChange && (
        <div className="magic-field-group fade-in">
          <MagicalInput
            value={diaryValue}
            onChange={onDiaryChange}
            placeholder="Whisper your memory..."
            multiline
            autoFocus
            className="diary-input"
          />
        </div>
      )}

      {/* Show passphrase field only if needed. 
          For Create mode: after user typed something in diary? Or always? 
          Prompt: "After the user has typed some diary text, show a second magical prompt below it"
      */}
      {((mode === 'create' && diaryValue.length > 0) || mode === 'unlock') && onPassphraseChange && (
        <div className="magic-field-group fade-in-delayed">
          <label className="magic-label">
            {mode === 'create' ? "Name your secret key..." : "Secret key"}
          </label>
          <MagicalInput
            value={passphraseValue}
            onChange={onPassphraseChange}
            placeholder=""
            multiline={false}
            className="passphrase-input"
            autoFocus={mode === 'unlock'}
          />
        </div>
      )}

      <div className="magic-actions">
        {children}
      </div>
    </div>
  );
};

