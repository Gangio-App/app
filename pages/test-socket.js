import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function TestSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState('Disconnected');
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [socketId, setSocketId] = useState('');
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Generate a test user ID if not already set
    if (!userId) {
      setUserId(Math.random().toString(36).substring(2, 15));
    }
  }, []);

  const connect = () => {
    if (!userId) return;

    setStatus('Connecting...');
    addLog('Connecting to socket server...');

    // Create socket connection
    const socket = io({
      path: '/socket.io',
      query: { userId },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        userId
      }
    });

    // Set up event listeners
    socket.on('connect', () => {
      setIsConnected(true);
      setSocketId(socket.id);
      setStatus('Connected');
      addLog(`Socket connected with ID: ${socket.id}`);
      
      // Authenticate after connection
      socket.emit('authenticate', { userId });
    });

    socket.on('authenticated', (data) => {
      addLog(`Authentication response: ${JSON.stringify(data)}`);
    });

    socket.on('error', (data) => {
      addLog(`Error: ${JSON.stringify(data)}`);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      setStatus(`Disconnected: ${reason}`);
      addLog(`Socket disconnected: ${reason}`);
    });

    socket.on('connect_error', (err) => {
      setStatus(`Error: ${err.message}`);
      addLog(`Connection error: ${err.message}`);
    });

    return () => {
      socket.disconnect();
    };
  };

  const addLog = (message) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Socket.IO Test Client</h1>
      
      <div className="mb-6 p-4 border rounded shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Connection Status: 
          <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {status}
          </span>
        </h2>
        
        {socketId && <p className="text-sm mb-2">Socket ID: {socketId}</p>}
        
        <div className="flex gap-2 items-center mb-4">
          <label className="text-sm">User ID:</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="border rounded px-2 py-1 flex-1 text-sm"
            disabled={isConnected}
          />
          
          {!isConnected ? (
            <button 
              onClick={connect}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition"
            >
              Connect
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Console Logs</h2>
        <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm h-80 overflow-y-auto">
          {logs.length > 0 ? (
            logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log}
              </div>
            ))
          ) : (
            <div className="text-gray-500 italic">No logs yet. Connect to see activity.</div>
          )}
        </div>
      </div>
    </div>
  );
} 