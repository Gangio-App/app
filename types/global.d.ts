// Global type definitions

interface ServerInfo {
  id: string;
  name: string;
  icon?: string;
}

interface ElectronAPI {
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  isElectron: boolean;
  onUpdateAvailable?: (callback: () => void) => void;
  onUpdateDownloaded?: (callback: () => void) => void;
  onNavigateToServer?: (callback: (serverId: string) => void) => void;
  removeAllListeners?: (event: string) => void;
  updateServers?: (servers: ServerInfo[]) => void;
  installUpdate?: () => void;
}

// Extend Window interface
interface Window {
  electron?: ElectronAPI;
  env?: {
    IS_ELECTRON?: boolean;
  };
} 