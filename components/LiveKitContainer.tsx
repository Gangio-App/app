import React from 'react';
import { 
  LiveKitRoom, 
  VideoConference,
  ControlBar,
  TrackToggle,
  DisconnectButton,
  StartAudio,
  ControlBarProps,
  MediaDeviceMenu,
  RoomAudioRenderer,
  LayoutContextProvider,
  useRoomContext,
  useConnectionState
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import '@livekit/components-styles';
import '@livekit/components-styles/prefabs';

interface CustomControlBarProps extends ControlBarProps {
  onLeave?: () => void;
}

// Custom control bar with Elive's theme
const CustomControlBar: React.FC<CustomControlBarProps> = ({ onLeave, ...props }) => {
  const room = useRoomContext();
  const connectionState = useConnectionState(room);

  const handleLeave = () => {
    if (connectionState === ConnectionState.Connected && onLeave) {
      onLeave();
    } else {
      console.warn('Attempted to leave when not connected or onLeave is undefined.');
    }
  };

  return (
    <ControlBar
      {...props}
      className="fixed bottom-0 w-full px-2 sm:px-4 py-2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-gray-800/80 backdrop-blur-sm border-t border-gray-700/50 text-white z-50"
      variation="minimal"
      style={{
        backgroundColor: '#1F1F24',
        color: 'white',
        borderTop: '1px solid #2E2E35',
        minHeight: '64px', // Ensure minimum height on all devices
      }}
    >
      <StartAudio 
        label="Audio" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0" 
      />
      
      <TrackToggle 
        source={Track.Source.Microphone} 
        className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0"
      />
      
      <TrackToggle 
        source={Track.Source.Camera} 
        className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0"
      />
      
      <TrackToggle 
        source={Track.Source.ScreenShare} 
        className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0 hidden sm:block"
      />
      
      <MediaDeviceMenu
        className="bg-gray-700/70 hover:bg-gray-600/70 text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0 hidden sm:block"
      />
      
      <DisconnectButton 
        onClick={handleLeave}
        disabled={connectionState !== ConnectionState.Connected}
        className={`text-white text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-md transition-colors flex-shrink-0 ${
          connectionState !== ConnectionState.Connected 
            ? 'bg-red-800 cursor-not-allowed' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      />
    </ControlBar>
  );
};

interface LiveKitContainerProps {
  token: string;
  serverUrl: string;
  roomName: string;
  onLeave?: () => void;
}

const LiveKitContainer: React.FC<LiveKitContainerProps> = ({
  token,
  serverUrl,
  roomName,
  onLeave,
}) => {
  if (!token || !serverUrl) {
    return <div>Missing required parameters</div>;
  }

  return (
    <div className="h-full flex flex-col bg-neutral-900 relative">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        connectOptions={{ autoSubscribe: true }}
        video={true}
        audio={true}
        onDisconnected={onLeave}
        data-lk-theme="default"
      >
        <>
          <LayoutContextProvider>
            {/* Add padding-bottom to ensure content isn't hidden behind the control bar */}
            <div className="pb-16 sm:pb-16 md:pb-16 h-full">
              <VideoConference />
            </div>
            <RoomAudioRenderer />
          </LayoutContextProvider>
        </>
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitContainer; 