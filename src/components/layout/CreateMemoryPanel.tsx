import React, { useState } from 'react';
import { usePensieveState } from '@/state/pensieveState';
import { useTranslation } from '@/utils/translations';
import { encryptMemory } from '@/utils/crypto';
import { generateShareLink } from '@/utils/url';
import MagicInput from '../ui/MagicInput';
import SigilButton from '../ui/SigilButton';
import { Copy, Check } from 'lucide-react';

const CreateMemoryPanel: React.FC = () => {
  const { setMode, language } = usePensieveState();
  const t = useTranslation(language);
  const [text, setText] = useState('');
  const [key, setKey] = useState('');
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCast = () => {
    if (!text || !key) return;
    
    setTimeout(() => {
      const ciphertext = encryptMemory(text, key);
      const link = generateShareLink(ciphertext);
      setShareLink(link);
    }, 800);
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const reset = () => {
    setShareLink(null);
    setText('');
    setKey('');
    // Clear the hash from URL if any
    window.history.pushState(null, '', window.location.pathname);
    setMode('idle');
  };

  if (shareLink) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
        <div className="pointer-events-auto w-full max-w-lg px-4 md:px-6 text-center space-y-6 md:space-y-12">
          <div className="space-y-2 md:space-y-4">
            <h2 
              className="text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: '"Pinyon Script", cursive' }}
            >
              {t.memoryPreserved}
            </h2>
            <p className="text-white/80 font-serif italic text-[10px] md:text-xs lg:text-sm tracking-widest drop-shadow-md">
              {t.threadSpun}
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="relative group w-full max-w-xs mx-auto">
                <input 
                    readOnly 
                    value={shareLink} 
                    className="bg-transparent w-full text-white text-xs font-mono focus:outline-none tracking-tight opacity-80 py-2 text-center transition-all border-none ring-0 outline-none drop-shadow-md overflow-hidden text-ellipsis whitespace-nowrap"
                />
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
            <button onClick={copyLink} className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full shrink-0">
                {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          <div className="pt-4 md:pt-8">
            <SigilButton onClick={reset} variant="secondary">{t.close}</SigilButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4">
      <div className="pointer-events-auto w-full max-w-lg px-4 md:px-6 space-y-6 md:space-y-12 mt-[-5vh] md:mt-[-10vh]">
        <div className="text-center space-y-2 md:space-y-4">
          <h2 
            className="text-4xl md:text-5xl lg:text-7xl text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] pb-2"
            style={{ fontFamily: '"Pinyon Script", cursive' }}
          >
            {t.castMemory}
          </h2>
          <p className="text-white/70 text-[10px] md:text-xs font-serif tracking-[0.2em] uppercase drop-shadow-md">
            {t.pourThoughts}
          </p>
        </div>

        <div className="space-y-6 md:space-y-12">
          <MagicInput 
            as="textarea" 
            placeholder={t.writeMemory}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <MagicInput 
            type="text" 
            label={t.secretKey}
            placeholder={t.wordToSeal}
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-center gap-6 md:gap-16 pt-2 md:pt-8 items-center">
          <button 
            onClick={() => setMode('idle')}
            className="text-[10px] tracking-[0.3em] text-white/60 hover:text-white transition-colors uppercase font-serif drop-shadow-md py-2"
          >
            {t.discard}
          </button>
          <SigilButton onClick={handleCast} disabled={!text || !key} className="w-full md:w-auto">{t.castMemory}</SigilButton>
        </div>
      </div>
    </div>
  );
};

export default CreateMemoryPanel;
