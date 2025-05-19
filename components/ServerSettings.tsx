import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerSettingsButtonProps {
  serverId: string;
  isOwner: boolean;
}

export const ServerSettingsButton: React.FC<ServerSettingsButtonProps> = ({ serverId, isOwner }) => {
  const router = useRouter();

  if (!isOwner) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/server-settings/${serverId}`);
  };

  return (
    <motion.button
      onClick={handleClick}
      className="p-1.5 rounded-md bg-gray-700/50 text-gray-300 hover:text-emerald-400 hover:bg-emerald-800/30 transition-all duration-200"
      title="Server Settings"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.923-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
      </svg>
    </motion.button>
  );
};

interface ServerSettingsProps {
  serverId: string;
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSave: (language: string) => Promise<void>;
}

export const ServerSettings: React.FC<ServerSettingsProps> = ({
  serverId,
  isOpen,
  onClose,
  currentLanguage,
  onSave
}) => {
  const [language, setLanguage] = useState(currentLanguage);
  const [activeTab, setActiveTab] = useState('general');
  const languages = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Chinese', 'Korean'];

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Enter' && isOpen && activeTab === 'general') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [language, isOpen, onClose, activeTab]);

  const handleSave = async () => {
    await onSave(language);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-4xl h-[80vh] overflow-hidden flex rounded-2xl shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Sidebar */}
            <div className="w-64 bg-gray-900/90 backdrop-blur-md border-r border-white/10 p-4 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Server Settings</h3>
                <p className="text-xs text-gray-400 mt-1">Configure your server</p>
              </div>
              
              <nav className="flex-1 space-y-1">
                <button 
                  onClick={() => setActiveTab('general')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'general' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>General</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('channels')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'channels' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                    <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z" />
                  </svg>
                  <span>Channels</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('roles')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'roles' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>Roles</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('invites')}
                  className={`w-full text-left px-4 py-2.5 rounded-lg flex items-center space-x-3 transition-all ${activeTab === 'invites' ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-gray-300'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  <span>Invites</span>
                </button>
              </nav>
              
              <div className="pt-4 mt-auto border-t border-white/10">
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <span>Close</span>
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-md p-6 overflow-y-auto custom-scrollbar">
              <AnimatePresence mode="wait">
                {activeTab === 'general' && (
                  <motion.div
                    key="general"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-4 text-white">General Settings</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-200">
                            Server Language
                          </label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full bg-gray-800/50 border border-white/10 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          >
                            {languages.map(lang => (
                              <option key={lang} value={lang}>{lang}</option>
                            ))}
                          </select>
                          <p className="mt-1 text-xs text-gray-400">This sets the default language for server notifications</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-6">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>Save Changes</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'channels' && (
                  <motion.div
                    key="channels"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-white">Channel Management</h3>
                        <button className="px-3 py-1.5 rounded-lg bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/40 transition-colors text-sm flex items-center space-x-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Add Channel</span>
                        </button>
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">Manage your server's channels and categories</p>
                      
                      <div className="space-y-3">
                        {/* This would be populated with actual channel data */}
                        <div className="p-3 bg-gray-800/50 rounded-lg border border-white/5 flex items-center justify-between group hover:bg-gray-700/40 transition-colors">
                          <div className="flex items-center space-x-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-white">general</span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                            <button className="p-1 rounded hover:bg-gray-600/50 text-gray-400 hover:text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                              </svg>
                            </button>
                            <button className="p-1 rounded hover:bg-red-600/30 text-gray-400 hover:text-red-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'roles' && (
                  <motion.div
                    key="roles"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-4 text-white">Role Management</h3>
                      <p className="text-gray-400 text-sm mb-4">Configure roles and permissions for your server members</p>
                      
                      {/* Role management UI would go here */}
                      <div className="text-center py-8 text-gray-400">
                        <p>Role management coming soon</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'invites' && (
                  <motion.div
                    key="invites"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
                      <h3 className="text-lg font-semibold mb-4 text-white">Invite Management</h3>
                      <p className="text-gray-400 text-sm mb-4">Create and manage invite links for your server</p>
                      
                      {/* Invite management UI would go here */}
                      <div className="text-center py-8 text-gray-400">
                        <p>Invite management coming soon</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};