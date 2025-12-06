import React, { useState } from 'react';
import { usePensieveState } from '@/state/pensieveState';
import { useTranslation } from '@/utils/translations';
import { decryptMemory } from '@/utils/crypto';
import { getMemoryFromUrl } from '@/utils/url';
import MagicInput from '../ui/MagicInput';
import SigilButton from '../ui/SigilButton';

const UnlockMemoryPanel: React.FC = () => {
  const { setMode, setDecryptedMemory, setIsUnlocked, language } = usePensieveState();
  const t = useTranslation(language);
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handleUnlock = () => {
    const ciphertext = getMemoryFromUrl();
    if (!ciphertext) {
      setError(true);
      return;
    }

    const decrypted = decryptMemory(ciphertext, key);
    
    if (decrypted) {
      setIsUnlocked(true);
      setTimeout(() => {
        setDecryptedMemory(decrypted);
        setMode('viewing');
      }, 2000);
    } else {
      setShaking(true);
      setError(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transform transition-transform ${shaking ? 'translate-x-[-5px]' : ''} p-4`}>
      
      <div className="pointer-events-auto w-full max-w-md px-4 md:px-6 text-center space-y-6 md:space-y-12">
        <div className="space-y-2 md:space-y-6">
          <h2 
            className="text-4xl md:text-5xl lg:text-7xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] pb-2"
            style={{ fontFamily: '"Pinyon Script", cursive' }}
          >
            {t.sealedMemory}
          </h2>
          <p className="text-white/70 font-serif text-[10px] md:text-xs tracking-[0.2em] uppercase drop-shadow-md">
            {t.memoryLiesWithin}
          </p>
        </div>

        <div className="space-y-6 md:space-y-12">
           <MagicInput 
            type="text" 
            label={t.secretKey}
            placeholder={t.speakWord}
            value={key}
            onChange={(e) => { setKey(e.target.value); setError(false); }}
            className={`${error ? "text-red-200 drop-shadow-[0_0_10px_rgba(150,50,50,0.5)]" : ""}`}
          />

          <div className="pt-2 md:pt-8">
            <SigilButton onClick={handleUnlock} disabled={!key} className="w-full md:w-auto">{t.reveal}</SigilButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnlockMemoryPanel;
