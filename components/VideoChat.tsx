import React, { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useTracks
} from '@livekit/components-react';
import { Track } from 'livekit-client';

interface VideoChatProps {
  userId: string;
  channelId: string;
  channelType: 'voice' | 'video';
}

export const VideoChat: React.FC<VideoChatProps> = ({
  userId,
  channelId,
  channelType
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            channelId
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get token');
        }

        const data = await response.json();
        setToken(data.token);
        setRoomName(data.roomName);
        setServerUrl(data.serverUrl);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError(err instanceof Error ? err.message : 'Failed to get token');
      } finally {
        setLoading(false);
      }
    };

    if (userId && channelId) {
      fetchToken();
    }
  }, [userId, channelId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-background-primary">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-background-primary">
        <div className="text-red text-center max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12 mx-auto mb-4"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">Connection Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!token || !roomName || !serverUrl) {
    return null;
  }

  return (
    <div className="h-full w-full bg-background-primary">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        data-lk-theme="discord"
        audio={true}
        video={channelType === 'video'}
      >
        {channelType === 'video' ? (
          <VideoConference />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 p-4">
              <AudioParticipantsGrid />
            </div>
            <ControlBar />
          </div>
        )}
      </LiveKitRoom>
    </div>
  );
};

// Custom component for audio-only view
const AudioParticipantsGrid = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}; 