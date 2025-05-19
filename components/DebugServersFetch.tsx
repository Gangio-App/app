'use client';

import React from 'react';

interface DebugServersFetchProps {
  servers: any[];
  visible: boolean;
}

export const DebugServersFetch: React.FC<DebugServersFetchProps> = ({ 
  servers, 
  visible 
}) => {
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg z-50 max-w-md max-h-96 overflow-auto">
      <h3 className="text-lg font-bold mb-2">Debug: Server Fetch</h3>
      <div className="mb-2">
        <span className="font-semibold">Server Count:</span> {servers.length}
      </div>
      {servers.length > 0 ? (
        <div>
          <h4 className="font-semibold mb-1">Server Data:</h4>
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(servers, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="text-red-400">No servers found</div>
      )}
    </div>
  );
}; 