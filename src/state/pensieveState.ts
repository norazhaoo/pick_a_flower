import { create } from 'zustand';

export type PensieveMode = 'idle' | 'input' | 'viewing' | 'unlocking';
export type Language = 'en' | 'zh' | 'ko' | 'ja' | 'fr' | 'spell';

interface PensieveState {
  mode: PensieveMode;
  language: Language;
  isHovered: boolean;
  memoryText: string;
  memoryKey: string;
  decryptedMemory: string | null;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
  
  setMode: (mode: PensieveMode) => void;
  setLanguage: (lang: Language) => void;
  setIsHovered: (hovered: boolean) => void;
  setMemoryText: (text: string) => void;
  setMemoryKey: (key: string) => void;
  setDecryptedMemory: (text: string | null) => void;
  setIsUnlocked: (unlocked: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const usePensieveState = create<PensieveState>((set) => ({
  mode: 'idle',
  language: 'en',
  isHovered: false,
  memoryText: '',
  memoryKey: '',
  decryptedMemory: null,
  isUnlocked: false,
  isLoading: false,
  error: null,

  setMode: (mode) => set({ mode }),
  setLanguage: (language) => set({ language }),
  setIsHovered: (isHovered) => set({ isHovered }),
  setMemoryText: (memoryText) => set({ memoryText }),
  setMemoryKey: (memoryKey) => set({ memoryKey }),
  setDecryptedMemory: (decryptedMemory) => set({ decryptedMemory }),
  setIsUnlocked: (isUnlocked) => set({ isUnlocked }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({
    mode: 'idle',
    memoryText: '',
    memoryKey: '',
    decryptedMemory: null,
    isUnlocked: false,
    isLoading: false,
    error: null
  })
}));

