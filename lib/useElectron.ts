import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';

interface ServerInfo {
  id: string;
  name: string;
  icon?: string;
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState(false);
  const router = useRouter();

  // Determine if running in Electron
  useEffect(() => {
    const isElectronApp = !!(
      typeof window !== 'undefined' && 
      (window.electron?.isElectron || window.env?.IS_ELECTRON)
    );
    setIsElectron(isElectronApp);
  }, []);

  // Set up update listeners
  useEffect(() => {
    if (!isElectron || typeof window === 'undefined') return;

    // Update available listener
    const handleUpdateAvailable = () => {
      setUpdateAvailable(true);
    };

    // Update downloaded listener
    const handleUpdateDownloaded = () => {
      setUpdateDownloaded(true);
    };

    // Navigate to server
    const handleNavigateToServer = (serverId: string) => {
      router.push(`/server/${serverId}`);
    };

    // Set up listeners
    if (window.electron?.onUpdateAvailable) {
      window.electron.onUpdateAvailable(handleUpdateAvailable);
    }

    if (window.electron?.onUpdateDownloaded) {
      window.electron.onUpdateDownloaded(handleUpdateDownloaded);
    }

    if (window.electron?.onNavigateToServer) {
      window.electron.onNavigateToServer(handleNavigateToServer);
    }

    // Clean up listeners
    return () => {
      if (window.electron?.removeAllListeners) {
        window.electron.removeAllListeners('update-available');
        window.electron.removeAllListeners('update-downloaded');
        window.electron.removeAllListeners('navigate-to-server');
      }
    };
  }, [isElectron, router]);

  // Update server list in the tray
  const updateServers = useCallback((servers: ServerInfo[]) => {
    if (isElectron && window.electron?.updateServers) {
      window.electron.updateServers(servers);
    }
  }, [isElectron]);

  // Install update
  const installUpdate = useCallback(() => {
    if (isElectron && window.electron?.installUpdate) {
      window.electron.installUpdate();
    }
  }, [isElectron]);

  return {
    isElectron,
    updateAvailable,
    updateDownloaded,
    updateServers,
    installUpdate
  };
} 