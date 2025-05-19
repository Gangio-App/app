'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HexColorPicker } from 'react-colorful';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max"
        >
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"></div>
        </motion.div>
      )}
    </div>
  );
};

export default function CreateServerPage() {
  // Basic server info
  const [serverName, setServerName] = useState('');
  const [serverDescription, setServerDescription] = useState('');
  const [serverIcon, setServerIcon] = useState<string | null>(null);
  const [serverBanner, setServerBanner] = useState<string | null>(null);
  
  // Role management
  const [roles, setRoles] = useState<Array<{
    id: string;
    name: string;
    color: string;
    permissions: string[];
  }>>([
    {
      id: '1',
      name: 'Admin',
      color: '#ff5722',
      permissions: ['manage_channels', 'manage_roles', 'kick_members', 'ban_members']
    }
  ]);
  const [currentRole, setCurrentRole] = useState<{
    name: string;
    color: string;
    permissions: string[];
  }>({
    name: '',
    color: '#4ade80',
    permissions: []
  });
  
  // Channel management
  const [channels, setChannels] = useState<Array<{
    id: string;
    name: string;
    type: 'text' | 'voice' | 'video';
    position: number;
  }>>([{
    id: '1',
    name: 'general',
    type: 'text',
    position: 0
  }, {
    id: '2',
    name: 'welcome',
    type: 'text',
    position: 1
  }, {
    id: '3',
    name: 'Voice Chat',
    type: 'voice',
    position: 2
  }]);
  const [currentChannel, setCurrentChannel] = useState<{
    name: string;
    type: 'text' | 'voice' | 'video';
  }>({
    name: '',
    type: 'text'
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const router = useRouter();
  const totalSteps = 5; // Total number of onboarding steps (increased from 4 to 5)

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      // Redirect to login if no user is found
      router.push('/login');
    }
  }, [router]);
  
  // Available permissions for roles
  const availablePermissions = [
    { id: 'manage_channels', label: 'Manage Channels' },
    { id: 'manage_roles', label: 'Manage Roles' },
    { id: 'kick_members', label: 'Kick Members' },
    { id: 'ban_members', label: 'Ban Members' },
    { id: 'invite_members', label: 'Invite Members' },
    { id: 'change_nickname', label: 'Change Nickname' },
    { id: 'manage_nicknames', label: 'Manage Nicknames' },
    { id: 'manage_emojis', label: 'Manage Emojis' },
    { id: 'manage_webhooks', label: 'Manage Webhooks' },
    { id: 'read_messages', label: 'Read Messages' },
    { id: 'send_messages', label: 'Send Messages' },
    { id: 'manage_messages', label: 'Manage Messages' },
    { id: 'mention_everyone', label: 'Mention @everyone' },
  ];

  // Navigation between steps
  const nextStep = () => {
    if (currentStep === 1 && !serverName.trim()) {
      setError('Server name is required');
      return;
    }
    
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!serverName) {
      setError('Server name is required');
      setLoading(false);
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to create a server');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/servers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: serverName,
          description: serverDescription,
          icon: serverIcon,
          banner: serverBanner,
          ownerId: currentUser.id,
          roles: roles,
          channels: channels
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create server');
      }
      
      // Redirect to the new server
      router.push(`/servers/${data.id}`);
    } catch (err) {
      console.error('Error creating server:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (loadEvent) => {
        if (loadEvent.target && loadEvent.target.result) {
          setServerIcon(loadEvent.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (loadEvent) => {
        if (loadEvent.target && loadEvent.target.result) {
          setServerBanner(loadEvent.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  // Role management
  const addRole = () => {
    if (!currentRole.name.trim()) {
      setError('Role name is required');
      return;
    }
    
    const newRole = {
      id: Date.now().toString(),
      name: currentRole.name,
      color: currentRole.color,
      permissions: currentRole.permissions
    };
    
    setRoles([...roles, newRole]);
    
    // Reset current role form
    setCurrentRole({
      name: '',
      color: '#4ade80',
      permissions: []
    });
    
    setShowColorPicker(false);
    setError(null);
  };
  
  const removeRole = (id: string) => {
    setRoles(roles.filter(role => role.id !== id));
  };
  
  const togglePermission = (permissionId: string) => {
    if (currentRole.permissions.includes(permissionId)) {
      setCurrentRole({
        ...currentRole,
        permissions: currentRole.permissions.filter(id => id !== permissionId)
      });
    } else {
      setCurrentRole({
        ...currentRole,
        permissions: [...currentRole.permissions, permissionId]
      });
    }
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && 
          !(e.target instanceof HTMLTextAreaElement) && 
          !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        if (currentStep < totalSteps) {
          nextStep();
        } else if (currentStep === totalSteps && !loading) {
          const form = document.querySelector('form');
          form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      } else if (e.key === 'Backspace' && 
                !(e.target instanceof HTMLTextAreaElement) && 
                !(e.target instanceof HTMLInputElement)) {
        if (currentStep > 1) {
          prevStep();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentStep, totalSteps, loading]);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const slideIn = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 }
  };

  // If user is not logged in, show loading
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto">
          <motion.div 
            className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div 
        className="w-full max-w-3xl bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700/50"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Progress indicator */}
        <div className="mb-8 relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <React.Fragment key={index}>
                  <motion.div 
                    className={`relative z-20 flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      currentStep > index + 1 ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white' : 
                      currentStep === index + 1 ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white ring-4 ring-emerald-500/20' : 
                      'bg-gray-700 text-gray-400'
                    }`}
                    initial={{ scale: 0.8 }}
                    animate={{ 
                      scale: currentStep === index + 1 ? 1.1 : 1,
                      transition: { duration: 0.2 }
                    }}
                  >
                    {currentStep > index + 1 ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                    
                    {currentStep === index + 1 && (
                      <motion.div
                        className="absolute -inset-2 rounded-full bg-emerald-500/20 blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  {index < totalSteps - 1 && (
                    <div className="flex-1 h-1 relative bg-gray-700 rounded-full">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ 
                          width: currentStep > index + 1 ? '100%' : '0%',
                          transition: { duration: 0.4 }
                        }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-gray-400 px-1">
            <motion.span 
              animate={{ 
                color: currentStep === 1 ? '#4ade80' : '#9ca3af',
                fontWeight: currentStep === 1 ? 600 : 400
              }}
            >Basic Info</motion.span>
            <motion.span 
              animate={{ 
                color: currentStep === 2 ? '#4ade80' : '#9ca3af',
                fontWeight: currentStep === 2 ? 600 : 400
              }}
            >Appearance</motion.span>
            <motion.span 
              animate={{ 
                color: currentStep === 3 ? '#4ade80' : '#9ca3af',
                fontWeight: currentStep === 3 ? 600 : 400
              }}
            >Roles</motion.span>
            <motion.span 
              animate={{ 
                color: currentStep === 4 ? '#4ade80' : '#9ca3af',
                fontWeight: currentStep === 4 ? 600 : 400
              }}
            >Channels</motion.span>
            <motion.span 
              animate={{ 
                color: currentStep === 5 ? '#4ade80' : '#9ca3af',
                fontWeight: currentStep === 5 ? 600 : 400
              }}
            >Review</motion.span>
          </div>
          
          {/* Keyboard shortcuts indicator */}
          <motion.div
            className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-gray-500 flex flex-col items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 0.8, x: 0 }}
            transition={{ delay: 2 }}
          >
            <div className="flex flex-col gap-2 items-center">
              <Tooltip content="Press Enter to continue">
                <div className="border border-gray-600 rounded px-2 py-1 text-xs">
                  Enter
                </div>
              </Tooltip>
              {currentStep > 1 && (
                <Tooltip content="Press Backspace to go back">
                  <div className="border border-gray-600 rounded px-2 py-1 text-xs">
                    ←
                  </div>
                </Tooltip>
              )}
            </div>
          </motion.div>
        </div>
        
        {error && (
          <motion.div 
            className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <p>{error}</p>
          </motion.div>
        )}
        
        <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
          <AnimatePresence mode="sync">
            {/* Step 1: Basic Server Info */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Create Your Server</h1>
                  <p className="text-gray-400">Your server is where you and your friends hang out. Make it yours and start talking.</p>
                </motion.div>
                
                <div className="mb-8 flex flex-col items-center">
                  <motion.div 
                    className="group relative w-32 h-32 rounded-full bg-gray-700/50 flex items-center justify-center overflow-hidden cursor-pointer mb-4 border-2 border-dashed border-gray-600 hover:border-emerald-500 transition-colors duration-300"
                    onClick={() => document.getElementById('server-icon')?.click()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {serverIcon ? (
                      <motion.img 
                        src={serverIcon} 
                        alt="Server icon" 
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center text-gray-400 group-hover:text-emerald-400 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mb-2">
                          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-medium">Upload Icon</span>
                      </motion.div>
                    )}
                    <motion.div 
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-white text-sm font-medium">Change Icon</span>
                    </motion.div>
                  </motion.div>
                  <input
                    id="server-icon"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-400 text-center">
                    We recommend an image of at least 512x512 for your server.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="server-name" className="block text-sm font-medium text-gray-300 mb-2">
                    SERVER NAME <span className="text-emerald-500">*</span>
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <input
                      id="server-name"
                      type="text"
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all duration-200"
                      placeholder="Give your server a name"
                    />
                  </motion.div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="server-description" className="block text-sm font-medium text-gray-300 mb-2">
                    SERVER DESCRIPTION <span className="text-gray-500">(optional)</span>
                  </label>
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <textarea
                      id="server-description"
                      value={serverDescription}
                      onChange={(e) => setServerDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all duration-200 min-h-[100px] resize-none"
                      placeholder="Describe your server to help people know what it's about"
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            {/* Step 2: Server Appearance */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Customize Your Server</h1>
                  <p className="text-gray-400">Add a banner image to make your server stand out.</p>
                </motion.div>
                
                <div className="mb-8">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SERVER BANNER <span className="text-gray-500">(optional)</span>
                  </label>
                  <motion.div 
                    className="group relative w-full h-48 rounded-lg bg-gray-700/50 flex items-center justify-center overflow-hidden cursor-pointer mb-2 border-2 border-dashed border-gray-600 hover:border-emerald-500 transition-colors duration-300"
                    onClick={() => document.getElementById('server-banner')?.click()}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {serverBanner ? (
                      <motion.img 
                        src={serverBanner} 
                        alt="Server banner" 
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    ) : (
                      <motion.div
                        className="flex flex-col items-center justify-center text-gray-400 group-hover:text-emerald-400 transition-colors duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mb-2">
                          <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">Upload Banner Image</span>
                      </motion.div>
                    )}
                    <motion.div 
                      className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <span className="text-white text-sm font-medium">Change Banner</span>
                    </motion.div>
                  </motion.div>
                  <input
                    id="server-banner"
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className="hidden"
                  />
                  <p className="text-sm text-gray-400">
                    We recommend an image of at least 1600x400 for your banner. Max 10MB.
                  </p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-4 mb-8">
                  <div className="flex items-start">
                    <div className="mr-4 bg-emerald-500/20 p-2 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Server Preview</h3>
                      <p className="text-sm text-gray-400">
                        Customize how your server appears to others. The banner will be visible at the top of your server's channels.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Server Preview */}
                <motion.div 
                  className="bg-gray-800 rounded-lg overflow-hidden mb-8 border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="relative h-32 bg-gradient-to-r from-gray-700 to-gray-600">
                    {serverBanner && (
                      <img src={serverBanner} alt="Server banner" className="w-full h-full object-cover" />
                    )}
                    <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-800 overflow-hidden">
                          {serverIcon ? (
                            <img src={serverIcon} alt="Server icon" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-xl font-bold">
                              {serverName ? serverName.charAt(0).toUpperCase() : '?'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-12 px-6 pb-6">
                    <h2 className="text-xl font-bold text-white">
                      {serverName || 'Your Server Name'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                      {serverDescription || 'Your server description will appear here...'}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            {/* Step 3: Role Creation */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Create Server Roles</h1>
                  <p className="text-gray-400">Define roles with different permissions for your server members.</p>
                </motion.div>
                
                {/* Role list */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Current Roles</h3>
                    <Tooltip content="Roles control what permissions users have in your server">
                      <div className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 cursor-help transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </Tooltip>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {roles.map(role => (
                      <motion.div 
                        key={role.id}
                        className="flex items-center justify-between p-3 bg-gray-700/50 backdrop-blur-sm rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                      >
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3 shadow-lg" 
                            style={{ backgroundColor: role.color }}
                          >
                            <div className="w-full h-full rounded-full animate-pulse" style={{ backgroundColor: `${role.color}80`, mixBlendMode: 'overlay', animationDuration: '3s' }} />
                          </div>
                          <div>
                            <span className="font-medium text-white">{role.name}</span>
                            <div className="flex mt-1">
                              {role.permissions.slice(0, 3).map((perm, i) => (
                                <span key={i} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded mr-1">
                                  {perm.replace(/_/g, ' ')}
                                </span>
                              ))}
                              {role.permissions.length > 3 && (
                                <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                                  +{role.permissions.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {role.id !== '1' && ( // Don't allow removing the default admin role
                          <button
                            type="button"
                            onClick={() => removeRole(role.id)}
                            className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Add new role */}
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-800/50 backdrop-blur-sm mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 mix-blend-overlay"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Add New Role</h3>
                      <Tooltip content="Create roles to organize your members">
                        <div className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 cursor-help transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="role-name" className="block text-sm font-medium text-gray-300 mb-2">
                        ROLE NAME
                      </label>
                      <input
                        id="role-name"
                        type="text"
                        value={currentRole.name}
                        onChange={(e) => setCurrentRole({ ...currentRole, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all duration-200"
                        placeholder="e.g. Moderator, VIP Member"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        ROLE COLOR
                      </label>
                      <div className="flex items-center">
                        <motion.button
                          type="button"
                          onClick={() => setShowColorPicker(!showColorPicker)}
                          className="flex items-center justify-center w-10 h-10 rounded-lg mr-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 overflow-hidden"
                          style={{ backgroundColor: currentRole.color }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="w-full h-full" style={{ background: `linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.2) 100%)` }}></div>
                        </motion.button>
                        <span className="text-gray-300 uppercase">{currentRole.color}</span>
                      </div>
                      
                      {showColorPicker && (
                        <motion.div 
                          className="mt-3"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <HexColorPicker 
                            color={currentRole.color} 
                            onChange={(color) => setCurrentRole({ ...currentRole, color })} 
                          />
                          
                          <div className="flex flex-wrap gap-2 mt-3">
                            {['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722', '#795548', '#607d8b'].map((color) => (
                              <motion.button
                                key={color}
                                type="button"
                                className="w-6 h-6 rounded-md border border-gray-600 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => setCurrentRole({ ...currentRole, color })}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          PERMISSIONS
                        </label>
                        <Tooltip content="Permissions determine what actions the role can perform">
                          <div className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 cursor-help transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availablePermissions.map(permission => (
                          <div 
                            key={permission.id}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              id={`perm-${permission.id}`}
                              checked={currentRole.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
                            />
                            <label htmlFor={`perm-${permission.id}`} className="ml-2 text-sm text-gray-300">
                              {permission.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <motion.button
                      type="button"
                      onClick={addRole}
                      className="w-full py-2.5 relative overflow-hidden rounded-lg font-medium text-white transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] hover:translate-x-[100%] ease-in-out"></div>
                      <span className="relative z-10">Add Role</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 4: Channel Management */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Set Up Your Channels</h1>
                  <p className="text-gray-400">Customize your server's channels where members will chat and communicate.</p>
                </motion.div>
                
                {/* Channel list */}
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-800/50 backdrop-blur-sm mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 mix-blend-overlay"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Default Channels</h3>
                      <Tooltip content="These channels will be created automatically">
                        <div className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 cursor-help transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {channels.length === 0 ? (
                        <div className="text-center py-6 text-gray-400">
                          <p>No channels added yet. Add your first channel below.</p>
                        </div>
                      ) : (
                        channels.map((channel, index) => (
                          <motion.div 
                            key={channel.id}
                            className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                          >
                            <div className="flex items-center">
                              {/* Channel icon based on type */}
                              <div className="mr-3 text-gray-400">
                                {channel.type === 'text' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                  </svg>
                                ) : channel.type === 'voice' ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <span className="font-medium text-white">{channel.name}</span>
                                <div className="text-xs text-gray-400">
                                  {channel.type.charAt(0).toUpperCase() + channel.type.slice(1)} Channel
                                </div>
                              </div>
                            </div>
                            
                            {/* Only allow removing custom channels, not the default ones */}
                            {index > 2 && (
                              <button
                                type="button"
                                onClick={() => setChannels(channels.filter(c => c.id !== channel.id))}
                                className="p-2 rounded-full text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            )}
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Add new channel */}
                <div className="border border-gray-700 rounded-lg p-6 bg-gray-800/50 backdrop-blur-sm mb-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 mix-blend-overlay"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-white">Add New Channel</h3>
                      <Tooltip content="Create channels for different topics or activities">
                        <div className="p-1 rounded-full bg-gray-700/50 hover:bg-gray-700 cursor-help transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </Tooltip>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="channel-name" className="block text-sm font-medium text-gray-300 mb-2">
                        CHANNEL NAME
                      </label>
                      <input
                        id="channel-name"
                        type="text"
                        value={currentChannel.name}
                        onChange={(e) => setCurrentChannel({ ...currentChannel, name: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-white transition-all duration-200"
                        placeholder="e.g. announcements, memes, gaming"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CHANNEL TYPE
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentChannel({ ...currentChannel, type: 'text' })}
                          className={`flex items-center justify-center p-3 rounded-lg border ${currentChannel.type === 'text' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'} transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          Text
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentChannel({ ...currentChannel, type: 'voice' })}
                          className={`flex items-center justify-center p-3 rounded-lg border ${currentChannel.type === 'voice' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'} transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                          </svg>
                          Voice
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentChannel({ ...currentChannel, type: 'video' })}
                          className={`flex items-center justify-center p-3 rounded-lg border ${currentChannel.type === 'video' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:bg-gray-700'} transition-colors`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          Video
                        </button>
                      </div>
                    </div>
                    
                    <motion.button
                      type="button"
                      onClick={() => {
                        if (!currentChannel.name.trim()) {
                          setError('Channel name is required');
                          return;
                        }
                        
                        const newChannel = {
                          id: Date.now().toString(),
                          name: currentChannel.name.trim(),
                          type: currentChannel.type,
                          position: channels.length
                        };
                        
                        setChannels([...channels, newChannel]);
                        setCurrentChannel({ name: '', type: 'text' });
                        setError(null);
                      }}
                      className="w-full py-2.5 relative overflow-hidden rounded-lg font-medium text-white transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] hover:translate-x-[100%] ease-in-out"></div>
                      <span className="relative z-10">Add Channel</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Step 5: Review & Create */}
            {currentStep === 5 && (
              <motion.div
                key="step4"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={slideIn}
                transition={{ duration: 0.4 }}
              >
                <motion.div 
                  className="text-center mb-8"
                  variants={fadeInUp}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <h1 className="text-3xl font-bold text-white mb-2">Almost Done!</h1>
                  <p className="text-gray-400">Review your server details and create your new server.</p>
                </motion.div>
                
                <div className="bg-gray-700/30 rounded-lg overflow-hidden mb-8">
                  <div className="relative h-32">
                    {serverBanner ? (
                      <img src={serverBanner} alt="Server banner" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-gray-700 to-gray-600" />
                    )}
                    <div className="absolute bottom-0 left-0 transform translate-y-1/2 ml-6">
                      <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-gray-800 overflow-hidden">
                        {serverIcon ? (
                          <img src={serverIcon} alt="Server icon" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white text-xl font-bold">
                            {serverName ? serverName.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-12 px-6 pb-6">
                    <h2 className="text-xl font-bold text-white">
                      {serverName}
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                      {serverDescription || 'No description provided.'}
                    </p>
                    
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-gray-300 mb-2">ROLES</h3>
                      <div className="flex flex-wrap gap-2">
                        {roles.map(role => (
                          <span 
                            key={role.id} 
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${role.color}20`, // Add transparency
                              color: role.color,
                              border: `1px solid ${role.color}50`
                            }}
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <motion.div 
                  className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-start">
                    <div className="mr-4 text-emerald-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-emerald-400">
                        Your server will be created with {roles.length} role(s). You can always add more later.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
            
            <div className="flex justify-between items-center mt-8">
              {currentStep > 1 ? (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-700/50 to-gray-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 relative z-10" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="relative z-10">Back</span>
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors relative overflow-hidden group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/0 via-gray-700/50 to-gray-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10">Cancel</span>
                </motion.button>
              )}
              
              <motion.button
                type={currentStep === totalSteps ? "submit" : "button"}
                onClick={currentStep < totalSteps ? nextStep : undefined}
                disabled={loading}
                className={`relative px-6 py-2.5 font-medium text-white rounded-lg shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`absolute inset-0 ${
                  currentStep === totalSteps 
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500" 
                  : "bg-gradient-to-r from-blue-500 to-indigo-500"
                }`}></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 transform translate-x-[-100%] hover:translate-x-[100%] ease-in-out"></div>
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : currentStep === totalSteps ? (
                    <>
                      Create Server
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Continue
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </span>
              </motion.button>
            </div>
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
} 