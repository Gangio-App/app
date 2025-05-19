'use client';

import React, { useEffect, useState } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiUsers, FiMessageSquare } from 'react-icons/fi';
// You might integrate with a WebRTC library or a service like LiveKit (but in a new way)
// For now, this is a placeholder UI

interface SquadTalkProps {
  squadId: string; // To identify the specific squad room
  // Potentially tokens or user info for connection
}

const SquadTalk: React.FC<SquadTalkProps> = ({ squadId }) => {
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isConnected, setIsConnected] = useState(false); // Placeholder for connection status

  useEffect(() => {
    // Placeholder: Logic to connect to a signaling server for this squadId
    // This is where you'd integrate with your chosen WebRTC/voice solution
    console.log(`Attempting to connect to SquadTalk for squad: ${squadId}`);
    setIsConnected(true); // Simulate connection

    return () => {
      // Placeholder: Logic to disconnect
      console.log(`Disconnecting from SquadTalk for squad: ${squadId}`);
      setIsConnected(false);
    };
  }, [squadId]);

  const toggleMic = () => setIsMicMuted(!isMicMuted);
  const toggleCamera = () => setIsCameraOff(!isCameraOff);
  const handleDisconnect = () => {
    // Placeholder: Logic to gracefully disconnect from the call
    console.log('User initiated disconnect from SquadTalk');
    setIsConnected(false);
    // Potentially navigate away or close the SquadTalk UI
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-800 text-white rounded-lg shadow-md">
        <p>Connecting to SquadTalk...</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/80 backdrop-blur-md text-white p-4 rounded-lg shadow-xl border border-gray-700/50 w-full max-w-md z-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-emerald-400 flex items-center">
          <FiUsers className="mr-2" /> SquadTalk
        </h3>
        {/* Placeholder for participant count or squad name */}
      </div>

      {/* Video area placeholder */}
      <div className="aspect-video bg-gray-700/50 rounded mb-3 flex items-center justify-center">
        {isCameraOff ? (
          <FiVideoOff className="text-gray-400 text-4xl" />
        ) : (
          <p className="text-gray-400">Video Feed Area</p>
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-around items-center">
        <button 
          onClick={toggleMic}
          className={`p-3 rounded-full transition-colors ${isMicMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isMicMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
        <button 
          onClick={toggleCamera}
          className={`p-3 rounded-full transition-colors ${isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}
          aria-label={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {isCameraOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>
        <button 
          onClick={handleDisconnect}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
          aria-label="Leave SquadTalk"
        >
          <FiPhoneOff size={20} />
        </button>
        {/* Potentially add a chat button */}
        {/* <button className="p-3 rounded-full bg-gray-700 hover:bg-gray-600"><FiMessageSquare size={20} /></button> */}
      </div>
    </div>
  );
};

export default SquadTalk;