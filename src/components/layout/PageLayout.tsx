import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePensieveState } from '@/state/pensieveState';
import { useTranslation } from '@/utils/translations';
import CreateMemoryPanel from './CreateMemoryPanel';
import UnlockMemoryPanel from './UnlockMemoryPanel';
import SigilButton from '../ui/SigilButton';

const PageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { mode, language } = usePensieveState();
  const t = useTranslation(language);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-magic-50 font-serif selection:bg-magic-500 selection:text-white">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          {mode === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 40, scale: 0.95, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, scale: 1.05, filter: "blur(10px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-2xl p-8"
            >
              <CreateMemoryPanel />
            </motion.div>
          )}

          {mode === 'unlocking' && (
            <motion.div
              key="unlocking"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto w-full max-w-md p-8"
            >
              <UnlockMemoryPanel />
            </motion.div>
          )}

          {mode === 'viewing' && (
             <motion.div
             key="viewing"
             initial={{ opacity: 0, y: 30, scale: 0.9 }}
             animate={{ opacity: 1, y: 0, scale: 1 }}
             exit={{ opacity: 0, y: -30, scale: 1.1 }}
             transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }} // "Ease Out Expo" like feel
             className="pointer-events-auto w-full max-w-4xl p-12 text-center"
           >
             {/* No hard container for viewing, just floating text */}
             <div className="relative z-10">
                <DecryptedMemoryView />
             </div>
             {/* Subtle glow behind text */}
             <div className="absolute inset-0 bg-white/5 blur-[100px] -z-10 rounded-full" />
           </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Instructional / Ambient Text */}
      <AnimatePresence>
        {mode === 'idle' && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute bottom-12 w-full text-center pointer-events-none text-magic-200/50 text-sm tracking-[0.2em] uppercase"
           >
             {t.touchToOffer}
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Sub-component for viewing
const DecryptedMemoryView = () => {
  const { decryptedMemory, reset, language } = usePensieveState();
  const t = useTranslation(language);
  
  const handleReset = () => {
    // Clear the hash from URL
    window.history.pushState(null, '', window.location.pathname);
    reset();
  };

  return (
    <div className="space-y-8 md:space-y-12 max-w-full overflow-hidden px-4">
      <div className="relative inline-block max-w-3xl w-full">
        {/* Decorative quote mark */}
        <span className="absolute -top-4 -left-2 md:-top-6 md:-left-8 text-4xl md:text-6xl text-white/20 font-script leading-none">"</span>
        
        <p className="text-xl md:text-2xl lg:text-4xl leading-relaxed text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-serif tracking-wide italic px-6 md:px-4 break-words whitespace-pre-wrap">
          {decryptedMemory}
        </p>
        
        {/* Decorative quote mark */}
        <span className="absolute -bottom-8 -right-2 md:-bottom-10 md:-right-8 text-4xl md:text-6xl text-white/20 font-script leading-none">"</span>
      </div>

      <div className="pt-4 md:pt-8">
        <SigilButton onClick={handleReset} variant="secondary" className="text-xs md:text-sm">
            {t.returnToBasin}
        </SigilButton>
      </div>
    </div>
  );
}

export default PageLayout;

