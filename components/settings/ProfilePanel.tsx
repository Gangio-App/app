import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import AvatarUpload from '../AvatarUpload';

interface UserData {
  id: string;
  name: string;
  discriminator: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  position?: string;
  company?: string;
  pronouns?: string;
  badges?: string[]; // Added for user badges
}

interface ProfilePanelProps {
  onClose?: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onClose }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(true);
  const [bio, setBio] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [activeTab, setActiveTab] = useState('user-profile');
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setBio(userData.bio || '');
        setDisplayName(userData.name || '');
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setLoading(false);
    
    // Add ESC key handler
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onClose]);
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputAvatarRef = useRef<HTMLInputElement>(null);
  const fileInputBannerRef = useRef<HTMLInputElement>(null);
  
  const handleUploadAvatar = () => {
    fileInputAvatarRef.current?.click();
  };
  
  const handleUploadBanner = () => {
    fileInputBannerRef.current?.click();
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      alert('Avatar image must be less than 4MB');
      return;
    }
    
    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (6MB limit)
    if (file.size > 6 * 1024 * 1024) {
      alert('Banner image must be less than 6MB');
      return;
    }
    
    setBannerFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setBannerPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };
  
  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };
  
  // Get session data
  const { data: session } = useSession();
  
  const uploadFile = async (file: File, type: 'avatar' | 'banner') => {
    if (!user || !session?.user) return '';
    
    try {
      // Create form data for the file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      // Upload the file to MongoDB via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to upload ${type}`);
      }
      
      const data = await response.json();
      console.log(`${type} uploaded successfully:`, data.url);
      return data.url;
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      throw new Error(`Failed to upload ${type}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      
      // Upload files if needed
      let avatarUrl = user.avatarUrl || '';
      let bannerUrl = user.bannerUrl || '';
      
      // Avatar is now handled by the AvatarUpload component
      
      if (bannerFile) {
        bannerUrl = await uploadFile(bannerFile, 'banner');
      } else if (bannerPreview === null && user.bannerUrl) {
        // User removed banner
        bannerUrl = '';
      }
      
      // Get updated values from form
      const positionInput = document.querySelector<HTMLInputElement>('#position');
      const companyInput = document.querySelector<HTMLInputElement>('#company');
      const pronounsInput = document.querySelector<HTMLInputElement>('#pronouns');
      
      const userBio = bio; 
      // displayName is now directly from state
      const position = positionInput?.value || user.position || '';
      const company = companyInput?.value || user.company || '';
      const pronouns = pronounsInput?.value || user.pronouns || '';
      
      // Update user profile
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName,
          bio: userBio,
          position,
          company,
          pronouns,
          avatarUrl,
          bannerUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update profile: ${response.statusText}`);
      }
      
      // Update local storage
      const updatedUser: UserData = {
        id: user.id,
        name: displayName,
        discriminator: user.discriminator,
        bio: userBio,
        position,
        company,
        pronouns,
        avatarUrl,
        bannerUrl,
      };
      
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSaveSuccess(true);
      
      // Close after a delay
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (!user) {
    return <div className="text-red-500">User not found. Please log in again.</div>;
  }
  
  return (
    <div>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputAvatarRef}
        className="hidden"
        accept="image/*"
        onChange={handleAvatarChange}
      />
      <input
        type="file"
        ref={fileInputBannerRef}
        className="hidden"
        accept="image/*"
        onChange={handleBannerChange}
      />
      <h2 className="text-2xl font-bold text-white mb-4">Profile</h2>
      
      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-700 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'user-profile' 
              ? 'text-white border-b-2 border-emerald-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('user-profile')}
        >
          User Profile
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'appearance' 
              ? 'text-white border-b-2 border-emerald-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('appearance')}
        >
          Appearance
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'connections' 
              ? 'text-white border-b-2 border-emerald-500' 
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('connections')}
        >
          Connections
        </button>
      </div>
      
      {activeTab === 'user-profile' && (
        <>
          {/* Preview Section */}
          <div className="mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">PREVIEW</h3>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              {/* Profile Header */}
              <div className="relative">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-gray-700 to-gray-600 relative">
                  {user.bannerUrl && (
                    <img 
                      src={user.bannerUrl} 
                      alt="Profile banner" 
                      className="w-full h-full object-cover"
                    />
                  )}
                  
                  {/* Profile Button */}
                  <button 
                    className="absolute bottom-4 right-4 bg-gray-900/70 hover:bg-gray-900/90 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Profile
                  </button>
                </div>
                
                {/* Avatar */}
                <div className="absolute bottom-0 left-4 transform translate-y-1/2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-gray-800">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-gray-800"></div>
                  </div>
                </div>
              </div>
              
              {/* Profile Content */}
              <div className="px-4 pt-16 pb-4">
                <div className="flex items-center">
                  <h3 className="text-xl font-bold text-white">{user.name}</h3>
                  <span className="ml-1 text-gray-400">#{user.discriminator}</span>
                </div>
                
                {/* Bio */}
                {bio && (
                  <div className="mt-3 text-gray-300 text-sm">
                    {bio}
                  </div>
                )}
                
                {/* Additional Info */}
                <div className="mt-3 flex flex-wrap gap-4">
                  {user.position && (
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">{user.position}</span>
                      {user.company && ' @ '}
                      {user.company && <span className="font-medium text-gray-300">{user.company}</span>}
                    </div>
                  )}
                  
                  {user.pronouns && (
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-gray-300">{user.pronouns}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Display Name */}
          <div className="mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">DISPLAY NAME <span className="text-xs text-emerald-500 normal-case font-normal ml-1">NEW</span></h3>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div className="w-full">
                  <p className="text-sm text-gray-400 mb-2">Change your display name to whatever you like.</p>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md text-white"
                    placeholder="Display Name"
                    id="displayName" // Keep id for potential future use, but not relied upon
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Profile Picture */}
          <div className="mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">PROFILE PICTURE</h3>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="flex items-start justify-between">
                <AvatarUpload
                  currentAvatarUrl={user?.avatarUrl}
                  onAvatarChange={(url) => {
                    setUser(prev => prev ? { ...prev, avatarUrl: url } : null);
                    // Also update in localStorage
                    const storedUser = localStorage.getItem('currentUser');
                    if (storedUser) {
                      try {
                        const userData = JSON.parse(storedUser);
                        userData.avatarUrl = url;
                        localStorage.setItem('currentUser', JSON.stringify(userData));
                      } catch (error) {
                        console.error('Failed to update user data in localStorage:', error);
                      }
                    }
                  }}
                  size={96}
                />
              </div>
            </div>
          </div>
          
          {/* Custom Background */}
          <div className="mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">CUSTOM BACKGROUND</h3>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="w-64 h-24 bg-gradient-to-r from-gray-700 to-gray-600 rounded-md overflow-hidden">
                    {user.bannerUrl && (
                      <img 
                        src={user.bannerUrl} 
                        alt="Banner" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">(max 6.00 MB)</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button 
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
                    onClick={handleUploadBanner}
                  >
                    Change Banner
                  </button>
                  {user.bannerUrl && (
                    <button 
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                      onClick={handleRemoveBanner}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Success/Error Messages */}
          {(saveSuccess || saveError) && (
            <div className="mb-4">
              {saveSuccess && (
                <div className="p-3 bg-emerald-900/50 border border-emerald-500/30 rounded-md text-emerald-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Profile updated successfully!
                </div>
              )}
              {saveError && (
                <div className="p-3 bg-red-900/50 border border-red-500/30 rounded-md text-red-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {saveError}
                </div>
              )}
            </div>
          )}
          
          {/* Information */}
          <div className="mb-8">
            <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">INFORMATION</h3>
            <div className="bg-gray-800 rounded-md p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Bio</label>
                  <textarea
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md text-white h-24 resize-none"
                    placeholder="Tell us about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      Descriptions support Markdown formatting. <a href="#" className="text-emerald-500 hover:underline">learn more here</a>.
                    </span>
                    <span className="text-xs text-gray-500">{bio.length}/190</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-gray-400 text-sm mb-1">Position</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md text-white"
                      placeholder="e.g. Software Developer"
                      defaultValue={user.position || ''}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-gray-400 text-sm mb-1">Company</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md text-white"
                      placeholder="e.g. Revolt Inc."
                      defaultValue={user.company || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Pronouns</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-md text-white"
                    placeholder="e.g. they/them"
                    defaultValue={user.pronouns || ''}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      
      {activeTab === 'appearance' && (
        <div className="bg-gray-800 rounded-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Appearance Settings</h3>
          <p className="text-gray-300 mb-6">Customize how LiveChat looks for you</p>
          
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-white mb-3">Theme</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-md p-4 border-2 border-emerald-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">Dark</span>
                    <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="h-16 bg-gray-800 rounded-md"></div>
                </div>
                <div className="bg-gray-700 rounded-md p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">Light</span>
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded-md"></div>
                </div>
                <div className="bg-gray-700 rounded-md p-4 border border-gray-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white font-medium">System</span>
                    <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                  </div>
                  <div className="h-16 bg-gradient-to-r from-gray-800 to-gray-200 rounded-md"></div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-md font-medium text-white mb-3">Message Display</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                  <span className="text-white">Show message preview thumbnails</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={true}
                    />
                    <div className="block w-10 h-6 rounded-full bg-emerald-500"></div>
                    <div className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                  <span className="text-white">Show emoji reactions</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={true}
                    />
                    <div className="block w-10 h-6 rounded-full bg-emerald-500"></div>
                    <div className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                  <span className="text-white">Animate emoji</span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={true}
                    />
                    <div className="block w-10 h-6 rounded-full bg-emerald-500"></div>
                    <div className="absolute left-5 top-1 bg-white w-4 h-4 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'connections' && (
        <div className="bg-gray-800 rounded-md p-6">
          <h3 className="text-lg font-bold text-white mb-4">Connections</h3>
          <p className="text-gray-300 mb-6">Connect your accounts from other services</p>
          
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-700 rounded-md">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">Facebook</h4>
                <p className="text-gray-400 text-sm">Not connected</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">
                Connect
              </button>
            </div>
            
            <div className="flex items-center p-4 bg-gray-700 rounded-md">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">GitHub</h4>
                <p className="text-gray-400 text-sm">Not connected</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">
                Connect
              </button>
            </div>
            
            <div className="flex items-center p-4 bg-gray-700 rounded-md">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
              </div>
              <div className="ml-4">
                <h4 className="text-white font-medium">Google</h4>
                <p className="text-gray-400 text-sm">Not connected</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
          onClick={handleSaveProfile}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfilePanel; 
 