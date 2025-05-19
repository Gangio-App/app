'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ServerListContainer } from '@/components/ServersList';
import { motion } from 'framer-motion';

// Component that uses search params
function JoinServerContent() {
  const [inviteCode, setInviteCode] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is logged in and handle invite code from URL
  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    // Check for code in URL parameters
    const codeParam = searchParams?.get('code');
    
    // If there's a code in the URL, redirect to the new invite page format
    if (codeParam) {
      router.push(`/invite/${codeParam}`);
      return;
    }
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error parsing user data:', err);
        router.push('/login');
      }
    } else {
      // Redirect to login if no user is found
      router.push('/login');
    }
  }, [router, searchParams]);

  const handleServerClick = (serverId: string) => {
    router.push(`/servers/${serverId}`);
  };

  const handleCreateServer = () => {
    router.push('/create-server');
  };

  const handleJoinServer = async (code: string, userId: string) => {
    if (loading) return; // Prevent multiple submissions
    
    setLoading(true);
    setError(null);

    if (!code) {
      setError('Invite code is required');
      setLoading(false);
      return;
    }

    if (!userId) {
      setError('You must be logged in to join a server');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/servers/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode: code,
          userId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for the specific server configuration error
        if (data.error && data.error.includes('No default role found')) {
          throw new Error(
            'Server configuration error: This server is missing its default role. ' +
            'Please ask the server owner to visit their Server Settings > General > Advanced Settings ' +
            'to repair the server configuration.'
          );
        }
        
        throw new Error(data.error || 'Failed to join server');
      }

      // Show success state
      setIsSuccess(true);
      
      // Redirect to the joined server after a short delay
      setTimeout(() => {
        router.push(`/servers/${data.serverId}`);
      }, 1500);
    } catch (err) {
      console.error('Error joining server:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      // Instead of joining directly, redirect to the invite page
      router.push(`/invite/${inviteCode}`);
    }
  };

  // If user is not logged in, show loading
  if (!currentUser) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="m-auto">
          <motion.div 
            className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-white font-bold mb-4"
          >
            Server joined successfully!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300"
          >
            Redirecting you to the server...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Server list sidebar */}
      <ServerListContainer
        activeServerId="join"
        onServerClick={handleServerClick}
        onCreateServer={handleCreateServer}
      />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700/50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="text-center mb-8"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-3xl font-bold text-white mb-2">Join a Server</h1>
            <p className="text-gray-400">Enter an invite code to join an existing server</p>
          </motion.div>
          
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="mb-6"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              <label htmlFor="inviteCode" className="block text-gray-300 mb-2 font-medium">
                Invite Code
              </label>
              <input
                type="text"
                id="inviteCode"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 rounded-md text-white placeholder-gray-400 transition-all duration-200 focus:outline-none"
                placeholder="Enter invite code (e.g., abc123)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
              />
            </motion.div>
            
            {error && (
              <motion.div 
                className="mb-6 p-3 bg-red-500/20 border border-red-500/50 text-red-100 rounded-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}
            
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium py-3 px-4 rounded-md hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-60 disabled:pointer-events-none flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <motion.div 
                    className="h-5 w-5 rounded-full border-2 border-t-transparent border-white"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                ) : (
                  'Join Server'
                )}
              </button>
            </motion.div>
          </form>
          
          <motion.div 
            className="mt-8 text-center text-gray-400 border-t border-gray-700 pt-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <p>Don't have an invite? <Link href="/create-server" className="text-emerald-400 hover:text-emerald-300 transition-colors">Create your own server</Link></p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

// Loading fallback
function JoinServerLoadingFallback() {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="m-auto">
        <motion.div 
          className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function JoinServerPage() {
  return (
    <Suspense fallback={<JoinServerLoadingFallback />}>
      <JoinServerContent />
    </Suspense>
  );
} 