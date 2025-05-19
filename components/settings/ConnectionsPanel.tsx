import React from 'react';

const ConnectionsPanel: React.FC = () => {
  const handleSteamConnect = () => {
    // TODO: Implement Steam connection logic
    // This will likely involve redirecting the user to the backend Steam auth route
    window.location.href = '/api/auth/steam';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white">Connections</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4 text-gray-200">Connect Your Accounts</h3>
        <p className="text-gray-400 mb-6">
          Connect your external accounts to enhance your Gangio experience.
        </p>
        
        <div className="space-y-4">
          {/* Steam Connection */}
          <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {/* Placeholder for Steam Icon */}
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">S</span> 
              </div>
              <span className="text-white font-medium">Steam</span>
            </div>
            <button 
              onClick={handleSteamConnect}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-1.5 rounded-md transition duration-200 ease-in-out"
            >
              Connect
            </button>
          </div>

          {/* Add other potential connections here */}
          {/* e.g., Discord, Twitch, etc. */}

        </div>
      </div>
    </div>
  );
};

export default ConnectionsPanel; 