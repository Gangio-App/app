import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaDesktop, FaMobile, FaTablet, FaGlobe, FaTrash } from 'react-icons/fa';

interface Session {
  id: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

const SessionsPanel: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate fetching sessions
    const mockSessions: Session[] = [
      {
        id: '1',
        device: 'desktop',
        browser: 'Chrome',
        os: 'Windows 10',
        ip: '192.168.1.1',
        location: 'New York, USA',
        lastActive: 'Current session',
        isCurrent: true
      },
      {
        id: '2',
        device: 'mobile',
        browser: 'Safari',
        os: 'iOS 15',
        ip: '192.168.1.2',
        location: 'Los Angeles, USA',
        lastActive: '2 days ago',
        isCurrent: false
      },
      {
        id: '3',
        device: 'tablet',
        browser: 'Firefox',
        os: 'iPadOS 15',
        ip: '192.168.1.3',
        location: 'Chicago, USA',
        lastActive: '1 week ago',
        isCurrent: false
      }
    ];
    
    setTimeout(() => {
      setSessions(mockSessions);
      setLoading(false);
    }, 500);
  }, []);
  
  const handleLogoutSession = (sessionId: string) => {
    // In a real app, this would call an API to end the session
    console.log(`Logging out session: ${sessionId}`);
    setSessions(sessions.filter(session => session.id !== sessionId));
  };
  
  const handleLogoutAllSessions = () => {
    // In a real app, this would call an API to end all sessions except current
    console.log('Logging out all other sessions');
    setSessions(sessions.filter(session => session.isCurrent));
  };
  
  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'desktop':
        return <FaDesktop className="text-xl" />;
      case 'mobile':
        return <FaMobile className="text-xl" />;
      case 'tablet':
        return <FaTablet className="text-xl" />;
      default:
        return <FaGlobe className="text-xl" />;
    }
  };
  
  if (loading) {
    return <div className="flex justify-center p-8">Loading sessions...</div>;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Sessions</h2>
      
      {/* Two-Factor Authentication */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">TWO-FACTOR AUTHENTICATION</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Protect your account with 2FA</h4>
              <p className="text-sm text-gray-400 mt-1">
                Add an extra layer of security to your account by requiring a verification code when you log in.
              </p>
            </div>
            <button 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors"
            >
              Enable 2FA
            </button>
          </div>
        </div>
      </div>
      
      {/* Current Sessions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="uppercase text-xs font-semibold text-gray-400">CURRENT SESSIONS</h3>
          {sessions.length > 1 && (
            <button 
              className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors"
              onClick={handleLogoutAllSessions}
            >
              Log out all other sessions
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {sessions.map(session => (
            <div key={session.id} className="bg-gray-800 rounded-md p-4">
              <div className="flex items-start">
                <div className="mr-4 text-emerald-400">
                  {getDeviceIcon(session.device)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center">
                    <h4 className="text-white font-medium">
                      {session.browser} on {session.os}
                    </h4>
                    {session.isCurrent && (
                      <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {session.ip} • {session.location}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Last active: {session.lastActive}
                  </p>
                </div>
                {!session.isCurrent && (
                  <button 
                    className="text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => handleLogoutSession(session.id)}
                    title="Log out this session"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Session History */}
      <div className="mb-8">
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">SESSION HISTORY</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <p className="text-sm text-gray-400">
            You can view and manage your session history from the dashboard.
          </p>
          <button 
            className="mt-3 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            View History
          </button>
        </div>
      </div>
      
      {/* Data Export */}
      <div>
        <h3 className="uppercase text-xs font-semibold text-gray-400 mb-2">DATA AND PRIVACY</h3>
        <div className="bg-gray-800 rounded-md p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-medium">Request account data</h4>
              <p className="text-sm text-gray-400 mt-1">
                Get a copy of your personal data, including account information, profile, servers, and messages.
              </p>
            </div>
            <button 
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Request Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionsPanel; 
 