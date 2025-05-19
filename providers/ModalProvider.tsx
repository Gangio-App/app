'use client';

import { useEffect, useState } from 'react';
import ServerSettingsModal from '@/components/modals/ServerSettingsModal';
import { useServerSettingsModal } from '@/hooks/useServerSettingsModal';
import SettingsModal from '@/components/settings/SettingsModal';
import { useSettingsModal } from '@/hooks/useSettingsModal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { isOpen: serverSettingsIsOpen, serverId, onClose: closeServerSettings } = useServerSettingsModal();
  const { isOpen: settingsIsOpen, defaultTab, onClose: closeSettings } = useSettingsModal();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      {serverId && (
        <ServerSettingsModal 
          serverId={serverId} 
          isOpen={serverSettingsIsOpen} 
          onClose={closeServerSettings} 
        />
      )}
      <SettingsModal 
        isOpen={settingsIsOpen}
        onClose={closeSettings}
        defaultTab={defaultTab}
      />
      {/* Add other modals here as needed */}
    </>
  );
};
