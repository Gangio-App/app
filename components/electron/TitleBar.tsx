import React, { useEffect, useState } from 'react';
import { IoClose, IoRemove, IoExpand, IoContract } from 'react-icons/io5';

interface TitleBarProps {
  title?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ title = 'Elivechit' }) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // Check if running in Electron
    const isElectronApp = !!(window.electron?.isElectron || window.env?.IS_ELECTRON);
    setIsElectron(isElectronApp);

    if (!isElectronApp) return;

    // Event listener for window state changes could be added here
    // For a more advanced implementation
  }, []);

  // Don't render in browser mode
  if (!isElectron) return null;

  const handleMinimize = () => {
    if (window.electron?.minimizeWindow) {
      window.electron.minimizeWindow();
    }
  };

  const handleMaximize = () => {
    if (window.electron?.maximizeWindow) {
      window.electron.maximizeWindow();
      setIsMaximized(!isMaximized);
    }
  };

  const handleClose = () => {
    if (window.electron?.closeWindow) {
      window.electron.closeWindow();
    }
  };

  return (
    <div className="titlebar h-8 bg-gray-900 flex items-center justify-between px-2 select-none fixed top-0 left-0 right-0 z-50 electron-drag">
      <div className="flex items-center space-x-2 electron-no-drag">
        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="text-white text-xs font-bold">EC</span>
        </div>
        <span className="text-white text-sm font-medium">{title}</span>
      </div>
      
      <div className="flex electron-no-drag">
        <button 
          onClick={handleMinimize} 
          className="flex items-center justify-center h-8 w-10 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
        >
          <IoRemove size={18} />
        </button>
        <button 
          onClick={handleMaximize} 
          className="flex items-center justify-center h-8 w-10 hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
        >
          {isMaximized ? <IoContract size={16} /> : <IoExpand size={16} />}
        </button>
        <button 
          onClick={handleClose} 
          className="flex items-center justify-center h-8 w-10 hover:bg-red-600 text-gray-400 hover:text-white transition-colors"
        >
          <IoClose size={18} />
        </button>
      </div>
    </div>
  );
}; 