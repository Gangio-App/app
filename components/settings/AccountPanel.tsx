import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProfilePanel from './ProfilePanel';

interface UserData {
  id: string;
  name: string;
  email?: string;
  discriminator: string;
  avatarUrl?: string;
  status: 'online' | 'idle' | 'dnd' | 'offline' | 'focus' | 'invisible';
}

interface AccountPanelProps {
  onNavigate?: (section: string) => void;
}

const AccountPanel: React.FC<AccountPanelProps> = ({ onNavigate }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  
  useEffect(() => {
    // Get user data from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
    setLoading(false);
    
    // Add ESC key handler
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showProfilePanel) {
          setShowProfilePanel(false);
        } else if (onNavigate) {
          onNavigate('overview');
        }
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [onNavigate, showProfilePanel]);
  
  const updateUserStatus = (status: 'online' | 'idle' | 'dnd' | 'offline' | 'focus' | 'invisible') => {
    if (!user) return;
    
    // Clone current user
    const updatedUser = {...user, status};
    
    // Update local storage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
    
    // Here you would also call an API to update status on the server
    fetch('/api/users/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        status
      }),
    }).catch(err => console.error('Failed to update status:', err));
  };
  
  const handleEditUsername = () => {
    // This would open a dialog to change username
    console.log('Edit username');
  };
  
  const handleEditEmail = () => {
    // This would open a dialog to change email
    console.log('Edit email');
  };
  
  const handleEditPassword = () => {
    // This would open a dialog to change password
    console.log('Edit password');
  };
  
  const handleRevealEmail = () => {
    // Toggle email visibility
    console.log('Reveal email');
  };
  
  const handleProfileEdit = () => {
    setShowProfilePanel(true);
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }
  
  if (!user) {
    return <div className="text-red-500">User not found. Please log in again.</div>;
  }
  
  // Helper to mask email for privacy
  const maskEmail = (email: string) => {
    if (!email) return '***********@*****.***';
    const [username, domain] = email.split('@');
    if (!domain) return email;
    return `${username.charAt(0)}${'*'.repeat(username.length - 1)}@${'*'.repeat(domain.length)}`;
  };
  
  return (
    <div>
      {/* Profile Panel Modal */}
      {showProfilePanel && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowProfilePanel(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-700 bg-gray-900 z-10">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button 
                className="text-gray-400 hover:text-white p-1"
                onClick={() => setShowProfilePanel(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <ProfilePanel onClose={() => setShowProfilePanel(false)} />
            </div>
          </motion.div>
        </motion.div>
      )}

      <h2 className="text-2xl font-bold text-white mb-6">My Account</h2>
      
      {/* User Avatar and Name */}
      <div className="bg-gray-800 rounded-md p-4 mb-6 flex items-center">
        <div className="flex-shrink-0">
          <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0)
            )}
          </div>
        </div>
        <div className="ml-6">
          <h3 className="text-xl font-bold text-white">{user?.name}</h3>
          <p className="text-gray-400">#{user?.discriminator}</p>
          {user?.id && (
            <div className="mt-1 flex items-center text-gray-500 text-sm">
              <span className="select-all">{user.id}</span>
              <button 
                className="ml-2 text-gray-400 hover:text-white"
                onClick={() => navigator.clipboard.writeText(user.id)}
                title="Copy ID"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="ml-auto">
          <button 
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            onClick={handleProfileEdit}
          >
            Edit Profile
          </button>
        </div>
      </div>
      
      {/* Status Selection */}
      <div className="bg-gray-800 rounded-md p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-400 uppercase mb-3">CURRENT STATUS</h4>
        <div className="flex flex-wrap gap-3">
          <button 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${user?.status === 'online' ? 'bg-green-600/30 text-green-400 border border-green-600/50' : 'bg-gray-700 hover:bg-gray-700/80 text-gray-300'}`}
            onClick={() => updateUserStatus('online')}
          >
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Online</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${user?.status === 'idle' ? 'bg-yellow-600/30 text-yellow-400 border border-yellow-600/50' : 'bg-gray-700 hover:bg-gray-700/80 text-gray-300'}`}
            onClick={() => updateUserStatus('idle')}
          >
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Idle</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${user?.status === 'dnd' ? 'bg-red-600/30 text-red-400 border border-red-600/50' : 'bg-gray-700 hover:bg-gray-700/80 text-gray-300'}`}
            onClick={() => updateUserStatus('dnd')}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Do Not Disturb</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${user?.status === 'focus' ? 'bg-purple-600/30 text-purple-400 border border-purple-600/50' : 'bg-gray-700 hover:bg-gray-700/80 text-gray-300'}`}
            onClick={() => updateUserStatus('focus')}
          >
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Focus</span>
          </button>
          <button 
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${user?.status === 'invisible' ? 'bg-gray-600/30 text-gray-400 border border-gray-600/50' : 'bg-gray-700 hover:bg-gray-700/80 text-gray-300'}`}
            onClick={() => updateUserStatus('invisible')}
          >
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Invisible</span>
          </button>
        </div>
      </div>
      
      {/* Account Information */}
      <div className="space-y-4">
        {/* Username */}
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-1">USERNAME</h4>
              <p className="text-white">{user.name}#{user.discriminator}</p>
            </div>
            <button 
              className="px-2 py-1 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
              onClick={handleEditUsername}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Email */}
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-1">EMAIL</h4>
              <div className="flex items-center">
                <p className="text-white">{user.email ? maskEmail(user.email) : '***********@*****.***'}</p>
                <button 
                  className="ml-2 text-emerald-500 hover:text-emerald-400 text-sm"
                  onClick={handleRevealEmail}
                >
                  Reveal
                </button>
              </div>
            </div>
            <button 
              className="px-2 py-1 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
              onClick={handleEditEmail}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Password */}
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-semibold text-gray-400 uppercase mb-1">PASSWORD</h4>
              <p className="text-white">********</p>
            </div>
            <button 
              className="px-2 py-1 border border-gray-700 hover:bg-gray-700 text-gray-400 hover:text-white rounded transition-colors"
              onClick={handleEditPassword}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Two-Factor Authentication */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">TWO-FACTOR AUTHENTICATION</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300 mb-4">Add an extra layer of security by enabling 2FA on your account.</p>
          
          <div className="space-y-3">
            {/* Generate Backup Codes */}
            <button className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-white transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <div className="text-left">
                  <h4 className="font-medium">Generate Backup Codes</h4>
                  <p className="text-sm text-gray-400">Get ready to use 2FA by setting up a backup method.</p>
                </div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Add Authenticator */}
            <button className="w-full flex items-center justify-between bg-gray-700 hover:bg-gray-600 p-3 rounded-md text-white transition-colors">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-left">
                  <h4 className="font-medium">Add Authenticator</h4>
                  <p className="text-sm text-gray-400">Set up time-based one-time password.</p>
                </div>
              </div>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {/* 2FA Status Message */}
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md flex items-center text-red-400">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>You haven't enabled two-factor authentication!</span>
          </div>
        </div>
      </div>
      
      {/* Account Management */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-white mb-4">ACCOUNT MANAGEMENT</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-gray-300 mb-4">Disable or delete your account at any time. This will log you out and fully delete your account, including your chat history and friends.</p>
          
          <div className="space-y-3">
            {/* Disable Account */}
            <button className="w-full text-left flex items-center justify-between p-3 bg-transparent hover:bg-gray-700/50 rounded-md transition-colors group">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <div>
                  <h4 className="font-medium text-gray-300 group-hover:text-white">Disable Account</h4>
                  <p className="text-sm text-gray-500">You won't be able to access your account unless you contact support - however, your data will not be deleted.</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            
            {/* Delete Account */}
            <button className="w-full text-left flex items-center justify-between p-3 bg-transparent hover:bg-red-900/20 rounded-md transition-colors group">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <div>
                  <h4 className="font-medium text-red-500">Delete Account</h4>
                  <p className="text-sm text-red-400/70">Your account and all of your data (including your messages and friends list) will be queued for deletion. A confirmation email will be sent - you can cancel this within 7 days by contacting support.</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPanel; 
 