'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';

export default function ServerInvitePage({ params }: { params: { code: string } }) {
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverDetails, setServerDetails] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();
  const { code } = params;
  
  // Validate the invite code and fetch server details
  useEffect(() => {
    async function validateInvite() {
      try {
        setLoading(true);
        
        // Check if a user is already logged in
        const userStr = localStorage.getItem('currentUser');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            setCurrentUser(user);
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
        
        // Fetch server details from the invite code
        const response = await fetch(`/api/invites/${code}`);
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Invalid invite code');
        }
        
        const data = await response.json();
        setServerDetails(data.server);
      } catch (err) {
        console.error('Error validating invite:', err);
        setError(err instanceof Error ? err.message : 'Failed to validate invite code');
      } finally {
        setLoading(false);
      }
    }
    
    validateInvite();
  }, [code]);
  
  // Handle server join
  const handleJoinServer = async () => {
    if (!currentUser || !serverDetails) return;
    
    try {
      setJoining(true);
      setError(null);
      
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: code,
          userId: currentUser.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join server');
      }
      
      // Redirect to the server page
      router.push(`/servers/${data.serverId}`);
    } catch (err) {
      console.error('Error joining server:', err);
      setError(err instanceof Error ? err.message : 'Failed to join server');
    } finally {
      setJoining(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-white">Validating invite code...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto max-w-md text-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Invalid Invite</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={() => router.push('/')} variant="primary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  if (!serverDetails) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto max-w-md text-center p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Server Not Found</h2>
          <p className="text-gray-300 mb-4">This invite link appears to be invalid or has expired.</p>
          <Button onClick={() => router.push('/')} variant="primary">
            Go Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="m-auto max-w-md w-full p-6 bg-gray-800/70 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto bg-gray-700 rounded-full flex items-center justify-center mb-4 overflow-hidden">
            {serverDetails.icon ? (
              <img 
                src={serverDetails.icon} 
                alt={serverDetails.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-white">
                {serverDetails.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            You've been invited to join
          </h1>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            {serverDetails.name}
          </h2>
          
          {serverDetails.memberCount && (
            <p className="mt-2 text-gray-400">
              {serverDetails.memberCount} {serverDetails.memberCount === 1 ? 'member' : 'members'}
            </p>
          )}
        </div>
        
        {!currentUser ? (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              You need an account to join this server
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href={`/login?redirect=/invite/${code}`} className="w-full">
                <Button variant="primary" fullWidth>
                  Log In
                </Button>
              </Link>
              
              <Link href={`/signup?redirect=/invite/${code}`} className="w-full">
                <Button variant="outline" fullWidth>
                  Signup
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-300 mb-4">
              Logged in as <span className="font-medium text-white">{currentUser.name}</span>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleJoinServer}
                isLoading={joining}
                disabled={joining}
                variant="primary"
                fullWidth
              >
                Accept Invite
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                disabled={joining}
                variant="outline"
                fullWidth
              >
                Cancel
              </Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-md text-red-400 text-sm mt-4">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 