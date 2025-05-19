'use client';

import { create } from 'zustand';

type SettingsTab = 
  | 'my-account' 
  | 'profile' 
  | 'privacy-safety' 
  | 'appearance' 
  | 'notifications'
  | 'voice-video'
  | 'keybinds'
  | 'language'
  | 'experimental'
  | 'feedback'
  | 'changelog'
  | 'sessions';

interface SettingsModalStore {
  isOpen: boolean;
  defaultTab: SettingsTab;
  onOpen: (defaultTab?: SettingsTab) => void;
  onClose: () => void;
}

export const useSettingsModal = create<SettingsModalStore>((set) => ({
  isOpen: false,
  defaultTab: 'my-account',
  onOpen: (defaultTab = 'my-account') => set({ isOpen: true, defaultTab }),
  onClose: () => set({ isOpen: false }),
}));
