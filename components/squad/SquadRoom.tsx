'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FiUsers } from 'react-icons/fi';
import LiveKitContainer from '../LiveKitContainer';
import { useTranslations } from '@/hooks/useTranslations';

interface SquadRoomProps {
  squadId: string;
  onClose?: () => void;
}

const SquadRoom: React.FC<SquadRoomProps> = ({ squadId, onClose }) => {
  const { data: session } = useSession();
  const { squadFinder } = useTranslations();
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  useEffect(() => {
    const fetchToken = async () => {
      if (!session?.user?.name) return;
      
      try {
        setIsLoading(true);
        // Use the existing LiveKit token API
        const response = await fetch(`/api/livekit-token?roomName=squad-${squadId}&participantName=${encodeURIComponent(session.user.name)}`);
        
        if (!response.ok) {
          throw new Error('Failed to get voice chat token');
        }
        
        const data = await response.json();
        setToken(data.token);
        setWsUrl(data.url);
      } catch (err) {
        console.error('Error joining squad room:', err);
        setError('Failed to join voice chat. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchToken();
  }, [squadId, session?.user?.name]);
  
  if (isLoading) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-md text-white p-6 rounded-lg shadow-xl border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <FiUsers className="text-emerald-400" />
          <h3 className="text-lg font-semibold">{squadFinder.waitingForOthers()}</h3>
        </div>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-gray-800/90 backdrop-blur-md text-white p-6 rounded-lg shadow-xl border border-gray-700/50">
        <div className="flex items-center space-x-2 mb-4">
          <FiUsers className="text-red-400" />
          <h3 className="text-lg font-semibold">Error {squadFinder.joinSquad()}</h3>
        </div>
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={onClose}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-md transition-colors"
        >
          Close
        </button>
      </div>
    );
  }
  
  // For now, we're using a dummy token, but in production you would get this from your backend
  // We'll use the existing LiveKitContainer component for voice/video chat
  return (
    <div className="h-full">
      <div className="bg-gray-800/90 backdrop-blur-md text-white p-4 rounded-lg shadow-xl border border-gray-700/50 mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <FiUsers className="text-emerald-400" />
            <h3 className="text-lg font-semibold">{squadFinder.squadRoom()}</h3>
          </div>
          <div className="text-sm text-gray-400">
            <span>Squad ID: {squadId}</span>
          </div>
        </div>
      </div>
      
      <div className="h-[500px] rounded-lg overflow-hidden border border-gray-700/50">
        {token && wsUrl ? (
          <LiveKitContainer
            token={token}
            serverUrl={wsUrl}
            roomName={`squad-${squadId}`}
            onLeave={onClose}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-800/50">
            <p className="text-gray-400">{squadFinder.waitingForOthers()}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SquadRoom;