const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    // Window controls
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    
    // Server management
    updateServers: (servers) => ipcRenderer.send('update-servers', servers),
    
    // Listeners
    onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
    onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
    onNavigateToServer: (callback) => ipcRenderer.on('navigate-to-server', (_, serverId) => callback(serverId)),
    
    // Updates
    installUpdate: () => ipcRenderer.send('install-update'),
    
    // Environment info
    isElectron: true,
    
    // Remove listeners
    removeAllListeners: (channel) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
);

// Additionally expose environment variables
contextBridge.exposeInMainWorld('env', {
  IS_ELECTRON: true,
  NODE_ENV: process.env.NODE_ENV || 'development'
}); 