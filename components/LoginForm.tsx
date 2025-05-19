import React, { useState } from 'react';

type LoginFormProps = {
  onJoin: (username: string, room: string) => void;
  isLoading?: boolean;
};

export const LoginForm: React.FC<LoginFormProps> = ({ onJoin, isLoading = false }) => {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && room.trim()) {
      onJoin(username.trim(), room.trim());
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-8 bg-background-primary rounded-lg shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-header-primary mb-2">LiveKit Discord</h1>
        <p className="text-text-muted">Connect with video, audio, and screen sharing</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-header-secondary mb-1">
            DISPLAY NAME
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-background-tertiary border border-background-accent rounded-md focus:outline-none focus:ring-2 focus:ring-brand text-text-normal"
            placeholder="Enter your username"
            required
          />
        </div>
        
        <div>
          <label htmlFor="room" className="block text-sm font-medium text-header-secondary mb-1">
            ROOM NAME
          </label>
          <input
            id="room"
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full px-3 py-2 bg-background-tertiary border border-background-accent rounded-md focus:outline-none focus:ring-2 focus:ring-brand text-text-normal"
            placeholder="Enter room name"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !username.trim() || !room.trim()}
          className="discord-button w-full py-3 text-base font-medium"
        >
          {isLoading ? 'Connecting...' : 'Join Room'}
        </button>
        
        <div className="text-center text-text-muted text-xs">
          By joining, you agree to our imaginary Terms of Service and Privacy Policy
        </div>
      </form>
    </div>
  );
}; 