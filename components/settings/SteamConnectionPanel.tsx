import React, { useState, useEffect } from 'react';
import { FiInfo, FiExternalLink, FiCheck, FiX } from 'react-icons/fi';
import { SiSteam } from 'react-icons/si';
import { useSession } from 'next-auth/react';

interface SteamConnectionPanelProps {
  currentSteamId?: string;
  onSave: (steamId: string) => Promise<boolean>;
}

const SteamConnectionPanel: React.FC<SteamConnectionPanelProps> = ({
  currentSteamId,
  onSave
}) => {
  const { data: session } = useSession();
  const [steamId, setSteamId] = useState(currentSteamId || '');
  const [isEditing, setIsEditing] = useState(!currentSteamId);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Get user ID from session
  const userId = session?.user ? (session.user as any).id : null;

  const validateSteamId = (id: string): boolean => {
    // Steam ID should be a 17-digit number
    const steamIdRegex = /^[0-9]{17}$/;
    return steamIdRegex.test(id);
  };

  const handleSave = async () => {
    const trimmedSteamId = steamId.trim();
    
    if (!trimmedSteamId) {
      setSaveError('Steam ID cannot be empty');
      return;
    }
    
    if (!validateSteamId(trimmedSteamId)) {
      setSaveError('Invalid Steam ID format. Steam ID should be a 17-digit number.');
      return;
    }
    
    if (!userId) {
      setSaveError('You must be logged in to save your Steam ID.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      console.log('Saving Steam ID:', trimmedSteamId, 'for user:', userId);
      
      // Try the client-side approach first
      try {
        const response = await fetch('/api/steam/client-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId: userId,
            steamId: trimmedSteamId 
          }),
        });
        
        const data = await response.json();
        console.log('Client-side API response:', data);
        
        if (response.ok) {
          setIsEditing(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
          return;
        }
        
        // If client-side approach fails, show the error
        const errorMessage = data.error || 'Unknown error';
        console.log('Client-side API failed:', errorMessage);
        setSaveError(errorMessage);
        return;
      } catch (clientApiError) {
        console.error('Error with client-side API:', clientApiError);
      }
      
      // Fall back to the original method as a last resort
      try {
        const success = await onSave(trimmedSteamId);
        console.log('Original save result:', success ? 'success' : 'failed');
        
        if (success) {
          setIsEditing(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          setSaveError('Failed to save Steam ID. Please try again.');
        }
      } catch (originalMethodError) {
        console.error('Error with original method:', originalMethodError);
        setSaveError('Failed to save Steam ID. Please try again.');
      }
    } catch (error) {
      console.error('Error saving Steam ID:', error);
      setSaveError('An error occurred while saving your Steam ID.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center mb-6">
        <SiSteam className="text-3xl text-blue-500 mr-3" />
        <h2 className="text-xl font-semibold text-white">Steam Connection</h2>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 mb-6 border border-gray-700/50">
        <h3 className="text-lg font-medium mb-4 text-white">Connect Your Steam Account</h3>
        <p className="text-gray-300 mb-6">
          Connect your Steam account to display your game stats and activity on your profile and dashboard.
        </p>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="steamId" className="text-gray-300 font-medium">
              Steam ID
            </label>
            <button 
              onClick={() => setShowHelpModal(true)}
              className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center"
            >
              <FiInfo className="mr-1" /> How to find your Steam ID?
            </button>
          </div>
          
          <div className="flex items-center">
            {isEditing ? (
              <input
                id="steamId"
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                placeholder="Enter your Steam ID (e.g. 76561198012345678)"
                className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white w-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            ) : (
              <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white w-full">
                {steamId}
              </div>
            )}
          </div>
          
          {saveError && (
            <p className="text-red-400 mt-2 text-sm">{saveError}</p>
          )}
          
          {saveSuccess && (
            <p className="text-emerald-400 mt-2 text-sm flex items-center">
              <FiCheck className="mr-1" /> Steam ID saved successfully!
            </p>
          )}
        </div>

        <div className="flex justify-end">
          {isEditing ? (
            <>
              {currentSteamId && (
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setSteamId(currentSteamId);
                  }}
                  className="mr-3 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Steam Profile Preview */}
      {currentSteamId && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
          <h3 className="text-lg font-medium mb-4 text-white">Steam Profile Preview</h3>
          <div className="flex items-center justify-between">
            <div className="text-gray-300">
              <p>View your Steam profile and stats on your dashboard</p>
            </div>
            <a 
              href={`https://steamcommunity.com/profiles/${currentSteamId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              View on Steam <FiExternalLink className="ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 relative">
            <button 
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <FiX className="text-xl" />
            </button>
            
            <h3 className="text-xl font-semibold mb-4 text-white">How to Find Your Steam ID</h3>
            
            <div className="text-gray-300 space-y-4">
              <p>
                Your Steam ID is a unique identifier for your Steam account. Here's how to find it:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2">
                <li>Visit <a href="https://steamdb.info/calculator/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">SteamDB Calculator</a></li>
                <li>Enter your Steam profile name or URL in the search box</li>
                <li>On your profile page, you'll see your Steam ID (steamID64) displayed</li>
                <li>Copy the 17-digit number (e.g., 76561198012345678)</li>
              </ol>
              
              <div className="bg-gray-900 p-3 rounded-lg mt-4">
                <p className="text-sm text-gray-400">
                  Note: Your Steam profile must be public to use this feature. You can change your privacy settings in your Steam profile.
                </p>
              </div>
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SteamConnectionPanel;
