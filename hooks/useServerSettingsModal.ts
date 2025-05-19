'use client';

import { create } from 'zustand';

interface ServerSettingsModalStore {
  isOpen: boolean;
  serverId: string | null;
  onOpen: (serverId: string) => void;
  onClose: () => void;
}

export const useServerSettingsModal = create<ServerSettingsModalStore>((set) => ({
  isOpen: false,
  serverId: null,
  onOpen: (serverId: string) => set({ isOpen: true, serverId }),
  onClose: () => set({ isOpen: false }),
}));
