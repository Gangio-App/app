'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ServerRepairToolProps {
  serverId: string;
  userId: string;
  onSuccess?: () => void;
}

export const ServerRepairTool: React.FC<ServerRepairToolProps> = ({ 
  serverId, 
  userId, 
  onSuccess 
}) => {
  const [checking, setChecking] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    needsRepair: boolean;
    defaultRoleExists: boolean;
    repaired: boolean;
    message: string;
  } | null>(null);

  const checkServerConfiguration = async () => {
    try {
      setChecking(true);
      setError(null);
      
      const response = await fetch(`/api/servers/repair?serverId=${serverId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check server configuration');
      }
      
      const data = await response.json();
      
      setResult({
        needsRepair: !data.defaultRoleExists,
        defaultRoleExists: data.defaultRoleExists,
        repaired: false,
        message: data.defaultRoleExists 
          ? 'Your server configuration is correct.' 
          : 'Server is missing the default role. Repair is recommended.'
      });
    } catch (err) {
      console.error('Error checking server:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setChecking(false);
    }
  };

  const repairServer = async () => {
    try {
      setRepairing(true);
      setError(null);
      
      const response = await fetch('/api/servers/repair', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serverId,
          userId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to repair server');
      }
      
      const data = await response.json();
      
      setResult({
        needsRepair: false,
        defaultRoleExists: true,
        repaired: true,
        message: data.repairResult.defaultRoleCreated 
          ? `Server repaired! Created default role and updated ${data.repairResult.memberRolesUpdated} members.` 
          : 'Server is already properly configured.'
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error repairing server:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setRepairing(false);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 shadow-lg space-y-4">
      <h3 className="text-lg font-medium text-white">Server Configuration Tools</h3>
      
      <p className="text-gray-400 text-sm">
        If members are having trouble joining your server or you see errors related to missing default roles,
        use these tools to diagnose and fix common server configuration issues.
      </p>
      
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-red-300 text-sm">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {result && (
        <div className={`p-3 rounded-md text-sm ${
          result.needsRepair 
            ? 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-300' 
            : 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300'
        }`}>
          <div className="flex items-start">
            {result.needsRepair ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <p>{result.message}</p>
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-2">
        <motion.button
          onClick={checkServerConfiguration}
          disabled={checking || repairing}
          className="px-4 py-2 bg-gray-700/70 hover:bg-gray-600/70 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {checking ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Checking...
            </>
          ) : 'Check Configuration'}
        </motion.button>
        
        <motion.button
          onClick={repairServer}
          disabled={repairing || checking || !result?.needsRepair && !error}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {repairing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Repairing...
            </>
          ) : 'Repair Server'}
        </motion.button>
      </div>
    </div>
  );
}; 
 