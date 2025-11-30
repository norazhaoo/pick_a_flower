import { create } from 'zustand';

export type PensieveMode =
  | 'IDLE'
  | 'CASTING'
  | 'LOCKED'
  | 'UNLOCKING'
  | 'REVEALED';

export interface PensieveStore {
  mode: PensieveMode;
  setMode: (mode: PensieveMode) => void;
  
  // Interaction state
  lastRipple: number;
  triggerRipple: () => void;

  // UI signaling
  isBasinHovered: boolean;
  setBasinHovered: (hovered: boolean) => void;
  
  // Used to trigger UI opening from 3D click
  requestOpenUI: boolean;
  setRequestOpenUI: (open: boolean) => void;
}

export const usePensieveStore = create<PensieveStore>((set) => ({
  mode: 'IDLE',
  setMode: (mode) => set({ mode }),
  
  lastRipple: 0,
  triggerRipple: () => set({ lastRipple: Date.now() }),

  isBasinHovered: false,
  setBasinHovered: (isBasinHovered) => set({ isBasinHovered }),

  requestOpenUI: false,
  setRequestOpenUI: (requestOpenUI) => set({ requestOpenUI }),
}));
