import React, { useState, useEffect } from 'react';
import { usePensieveStore } from '../../state/pensieveState';
import { encryptDiary } from '../../utils/crypto';
import { serializePayload } from '../../utils/url';
import { MagicInputOverlay } from '../ui/MagicInputOverlay';
import { SigilButton } from '../ui/SigilButton';

export const CreateMemoryPanel = () => {
  const [diaryText, setDiaryText] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  
  const setMode = usePensieveStore((state) => state.setMode);
  const requestOpenUI = usePensieveStore((state) => state.requestOpenUI);
  const setRequestOpenUI = usePensieveStore((state) => state.setRequestOpenUI);

  // Listen for scene interaction to open UI
  useEffect(() => {
    if (requestOpenUI && !isOverlayVisible && !generatedUrl) {
      setIsOverlayVisible(true);
      setRequestOpenUI(false);
    }
  }, [requestOpenUI, isOverlayVisible, generatedUrl, setRequestOpenUI]);

  const handleCastMemory = async () => {
    if (!diaryText || !passphrase) return;

    setIsEncrypting(true);
    setMode('CASTING');

    try {
      // Simulate animation delay/casting time
      await new Promise(resolve => setTimeout(resolve, 2500));

      const payload = await encryptDiary(diaryText, passphrase);
      const encoded = serializePayload(payload);
      const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
      
      setGeneratedUrl(url);
      setMode('LOCKED');
      setIsOverlayVisible(false);
    } catch (error) {
      console.error("Encryption failed", error);
      setMode('IDLE');
    } finally {
      setIsEncrypting(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl);
      // Could add a subtle toast here instead of alert, but alert is fine for now as per original
      alert('URL copied to clipboard');
    }
  };

  if (generatedUrl) {
    return (
      <div className="result-floating fade-in">
        <p className="magic-label">The memory is bound.</p>
        <div className="result-url" onClick={copyToClipboard} title="Click to copy">
          {generatedUrl}
        </div>
        <p className="hint" style={{ marginTop: '1rem', color: '#a0d0ff' }}>
          Only the keeper of the passphrase can unlock it.
        </p>
        <button 
           onClick={() => window.location.reload()} 
           style={{ marginTop: '2rem', background: 'transparent', border: '1px solid #a0d0ff', color: '#a0d0ff' }}
        >
          Create Another
        </button>
      </div>
    );
  }

  return (
    <>
       {!isOverlayVisible && !generatedUrl && (
         <div style={{ 
            position: 'absolute', 
            bottom: '20%', 
            pointerEvents: 'none', 
            opacity: 0.7,
            fontFamily: 'var(--font-serif)',
            textShadow: '0 0 10px var(--color-accent-glow)'
         }}>
            Touch the basin to whisper a memory...
         </div>
       )}
    
      <MagicInputOverlay
        mode="create"
        visible={isOverlayVisible && !isEncrypting}
        diaryValue={diaryText}
        onDiaryChange={setDiaryText}
        passphraseValue={passphrase}
        onPassphraseChange={setPassphrase}
        headerText="Whisper your memory..."
      >
        <SigilButton 
          onClick={handleCastMemory}
          disabled={!diaryText || !passphrase || isEncrypting}
          label="Cast Memory"
        />
      </MagicInputOverlay>
    </>
  );
};
