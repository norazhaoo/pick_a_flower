import { useState, useEffect } from 'react';
import { usePensieveStore } from '../../state/pensieveState';
import { decryptDiary } from '../../utils/crypto';
import { deserializePayload } from '../../utils/url';
import { MagicInputOverlay } from '../ui/MagicInputOverlay';
import { SigilButton } from '../ui/SigilButton';

export const UnlockMemoryPanel = () => {
  const [passphrase, setPassphrase] = useState('');
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  
  const setMode = usePensieveStore((state) => state.setMode);
  const requestOpenUI = usePensieveStore((state) => state.requestOpenUI);
  const setRequestOpenUI = usePensieveStore((state) => state.setRequestOpenUI);

  // Set initial locked state
  useEffect(() => {
    setMode('LOCKED');
  }, [setMode]);

  // Listen for scene interaction
  useEffect(() => {
    if (requestOpenUI && !isOverlayVisible && !decryptedText) {
      setIsOverlayVisible(true);
      setRequestOpenUI(false);
    }
  }, [requestOpenUI, isOverlayVisible, decryptedText, setRequestOpenUI]);

  const handleReveal = async () => {
    if (!passphrase) return;

    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    if (!data) return;

    setIsUnlocking(true);
    setError(null);
    setMode('UNLOCKING');

    try {
        const payload = deserializePayload(data);
        if (!payload) throw new Error("Invalid memory data");

        // Simulate small delay for effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const plaintext = await decryptDiary(payload, passphrase);
        setDecryptedText(plaintext);
        setMode('REVEALED');
        setIsOverlayVisible(false);
    } catch (err) {
        console.error(err);
        setError("The spoken key does not resonate.");
        setMode('LOCKED');
        // Shake effect could be triggered here via CSS class on the overlay or input
    } finally {
        setIsUnlocking(false);
    }
  };

  if (decryptedText) {
    return (
      <div className="revealed-memory-text fade-in">
        <div className="magic-label" style={{marginBottom: '2rem'}}>Memory Unveiled</div>
        {decryptedText}
        <button 
           onClick={() => window.location.reload()} 
           style={{ marginTop: '3rem', display: 'block', marginInline: 'auto', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.7)' }}
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <>
      {!isOverlayVisible && !decryptedText && (
         <div 
            onClick={() => { setRequestOpenUI(true); }}
            style={{ 
              position: 'absolute', 
              bottom: '20%', 
              cursor: 'pointer',
              fontFamily: 'var(--font-serif)',
              textShadow: '0 0 10px var(--color-accent-glow)',
              pointerEvents: 'auto'
         }}>
            A locked memory rests here. Speak its secret key.
         </div>
      )}

      <MagicInputOverlay
        mode="unlock"
        visible={isOverlayVisible && !decryptedText}
        passphraseValue={passphrase}
        onPassphraseChange={setPassphrase}
        headerText="Speak the Secret Key"
      >
        {error && <div className="error">{error}</div>}
        <SigilButton 
          onClick={handleReveal}
          disabled={!passphrase || isUnlocking}
          label="Reveal Memory"
        />
      </MagicInputOverlay>
    </>
  );
};
