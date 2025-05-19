'use client';

import React, { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { motion } from 'framer-motion';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video';
  friendId: string;
  friendName: string;
  currentUser: any;
}

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callType,
  friendId,
  friendName,
  currentUser,
}) => {
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate a unique room name for the call
  useEffect(() => {
    if (isOpen) {
      // Sort IDs to ensure the same room name regardless of who initiates
      const sortedIds = [currentUser.id, friendId].sort();
      const newRoomName = `dm-call-${sortedIds[0]}-${sortedIds[1]}`;
      setRoomName(newRoomName);
    }
  }, [isOpen, currentUser.id, friendId]);

  // Get token from server
  useEffect(() => {
    if (!isOpen || !roomName) return;

    const fetchToken = async () => {
      try {
        setIsConnecting(true);
        setError(null);

        const response = await fetch(
          `/api/livekit-token?roomName=${roomName}&participantName=${currentUser.id}:${currentUser.name}`
        );

        if (!response.ok) {
          throw new Error('Failed to get token');
        }

        const data = await response.json();
        setToken(data.token);
        setWsUrl(data.url);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError('Failed to establish call connection');
      } finally {
        setIsConnecting(false);
      }
    };

    fetchToken();
  }, [isOpen, roomName, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        className="bg-gray-800 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold">
            {callType === 'audio' ? 'Voice Call' : 'Video Call'} with {friendName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isConnecting ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-gray-300">Establishing connection...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 mb-2">Error: {error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md"
            >
              Close
            </button>
          </div>
        ) : token && wsUrl ? (
          <LiveKitRoom
            token={token}
            serverUrl={wsUrl}
            connect={true}
            connectOptions={{ autoSubscribe: true }}
            onDisconnected={onClose}
            className="flex-1 flex flex-col"
            data-lk-theme="default"
          >
            <div className="flex-1 p-3">
              <CallContent callType={callType} />
            </div>
            <ControlBar
              className="bg-gray-900 !p-3"
              variation="minimal"
              controls={{
                microphone: true,
                camera: callType === 'video',
                screenShare: false,
                leave: true
              }}
            />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <div className="flex flex-col items-center justify-center p-12">
            <p className="text-gray-300">Could not initialize call.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface CallContentProps {
  callType: 'audio' | 'video';
}

const CallContent: React.FC<CallContentProps> = ({ callType }) => {
  // Get published tracks
  const tracks = useTracks(
    callType === 'video' 
      ? [
          { source: Track.Source.Camera, withPlaceholder: true },
          { source: Track.Source.ScreenShare, withPlaceholder: false },
        ]
      : [
          { source: Track.Source.Microphone, withPlaceholder: false },
        ]
  );

  if (callType === 'audio') {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-24 h-24 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div className="animate-pulse flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}; 