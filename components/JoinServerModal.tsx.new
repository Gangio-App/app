import React, { useState } from 'react';

interface JoinServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (serverId: string) => void;
}

export const JoinServerModal: React.FC<JoinServerModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      setError('Please enter an invite code');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get the current user ID from localStorage
      const userJson = localStorage.getItem('currentUser');
      if (!userJson) {
        setError('You must be logged in to join a server');
        setIsLoading(false);
        return;
      }
      
      let userId = null;
      try {
        const user = JSON.parse(userJson);
        // Try multiple ID fields to ensure we get a valid ID
        userId = user._id || user.id || user.uid;
        
        // Log the retrieved user ID for debugging
        console.log('[JoinServerModal] Retrieved userId:', userId);

      } catch (parseError) {
        console.error('[JoinServerModal] Error parsing user data from localStorage:', parseError);
        setError('Error reading user data. Please try logging out and back in.');
        setIsLoading(false);
        return;
      }

      // Check if userId was successfully retrieved
      if (!userId) {
        setError('Could not retrieve a valid user ID. Please ensure you are logged in.');
        console.error('[JoinServerModal] Invalid or missing userId:', userId);
        setIsLoading(false);
        return;
      }
      
      // Add a specific check right before the fetch
      console.log(`[JoinServerModal] Sending userId to API: ${userId}, Type: ${typeof userId}`);
      
      // Use the correct API endpoint
      const apiEndpoint = '/api/servers/join';
      console.log(`[JoinServerModal] Sending request to ${apiEndpoint} with inviteCode: ${inviteCode}, userId: ${userId}`);
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inviteCode, userId })
      });
      
      console.log(`[JoinServerModal] Response status: ${response.status}`);
      
      // Log response headers for debugging
      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });
      console.log('[JoinServerModal] Response headers:', headers);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join server');
      }
      
      // Call the success handler with the server ID
      if (onSuccess && data.serverId) {
        onSuccess(data.serverId);
      }
      
      // Close the modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Join a Server</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-300 mb-1">
              Enter an invite code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="eg. ZkpfkK"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded-md text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md focus:outline-none"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md focus:outline-none flex items-center justify-center w-24"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                'Join Server'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
