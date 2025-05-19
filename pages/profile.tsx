"use client";

import React, { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { NextPage } from 'next';
import Head from 'next/head';
// Import layouts or components if needed
// import MainLayout from '@/components/layouts/MainLayout'; 

interface UserProfile {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  // Add other potential user fields
  steamId?: string | null; 
  steamProfileUrl?: string | null;
  steamAvatarUrl?: string | null;
}

interface SteamStats {
  // Define structure for Steam stats you want to display
  gamesCount?: number;
  playtime?: number; // Example: total playtime in hours
  favoriteGame?: string; // Example
}

const ProfilePage: NextPage = () => {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [steamStats, setSteamStats] = useState<SteamStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // TODO: Fetch detailed user profile data from your backend API
      // This might include Steam details if connected
      // Example placeholder:
      setUserProfile({
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        steamId: (session.user as any).steamId, // Adjust based on actual session structure
        // Fetch these from backend if stored:
        // steamProfileUrl: '...',
        // steamAvatarUrl: '...',
      });
      
      // TODO: If user has connected Steam, fetch Steam stats from backend API
      if ((session.user as any).steamId) {
        // fetch('/api/user/steam-stats').then(res => res.json()).then(setSteamStats);
        // Placeholder Steam stats:
        setSteamStats({
          gamesCount: 150, 
          playtime: 2500,
          favoriteGame: 'Counter-Strike 2'
        });
      }
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      // Optionally redirect to login or show a message
      // signIn(); // Example: Redirect to sign in
       setIsLoading(false);
    }
    // status === 'loading' handled by isLoading state

  }, [session, status]);

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Loading profile...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
        <h1 className="text-2xl mb-4">Access Denied</h1>
        <p className="mb-6">Please sign in to view your profile.</p>
        <button 
          onClick={() => signIn()} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Main profile content
  return (
    // Wrap with layout if you have one: <MainLayout>
    <>
      <Head>
        <title>{userProfile?.name || 'User'}'s Profile - Gangio</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-10 bg-gray-800/50 p-6 rounded-lg shadow-lg backdrop-blur-sm">
            <img 
              src={userProfile?.image || '/default-avatar.png'} 
              alt={userProfile?.name || 'User Avatar'}
              className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">{userProfile?.name || 'User'}</h1>
              <p className="text-gray-400">{userProfile?.email}</p>
              {/* Add join date or other basic info here */}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column (Stats/Info) */}
            <div className="md:col-span-1 space-y-6">
              {/* User Stats Card */}
              <div className="bg-gray-800/60 p-5 rounded-lg shadow-md backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">User Stats</h2>
                <ul className="space-y-2 text-gray-300">
                  <li>Servers Joined: <span className="font-medium text-white">12</span></li> {/* Placeholder */} 
                  <li>Messages Sent: <span className="font-medium text-white">1,234</span></li> {/* Placeholder */} 
                  <li>Time Active: <span className="font-medium text-white">50 hours</span></li> {/* Placeholder */} 
                  {/* Add more relevant stats */}
                </ul>
              </div>

              {/* Highlighted Server Card (Placeholder) */}
              <div className="bg-gray-800/60 p-5 rounded-lg shadow-md backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Featured Server</h2>
                <p className="text-gray-400">Feature coming soon!</p>
                {/* Display highlighted server info here */}
              </div>
            </div>

            {/* Right Column (Steam/Activity) */}
            <div className="md:col-span-2 space-y-6">
              {/* Steam Stats Card (Conditional) */}
              {steamStats ? (
                <div className="bg-gradient-to-r from-blue-900/70 to-gray-800/70 p-6 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in">
                  <h2 className="text-xl font-semibold mb-4 text-white flex items-center space-x-2">
                     {/* Placeholder Steam Icon */}
                    <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                    <span>Steam Stats</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-gray-200">
                    <p>Games Owned: <span className="font-semibold text-white">{steamStats.gamesCount ?? 'N/A'}</span></p>
                    <p>Total Playtime: <span className="font-semibold text-white">{steamStats.playtime ? `${steamStats.playtime} hrs` : 'N/A'}</span></p>
                    <p>Favorite Game: <span className="font-semibold text-white">{steamStats.favoriteGame ?? 'N/A'}</span></p>
                    {userProfile?.steamProfileUrl && (
                      <a 
                        href={userProfile.steamProfileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 col-span-2 mt-2 inline-block"
                      >
                        View Steam Profile &rarr;
                      </a>
                    )}
                  </div>
                </div>
              ) : userProfile?.steamId ? (
                 <div className="bg-gray-800/60 p-5 rounded-lg shadow-md backdrop-blur-sm">
                   <p className="text-gray-400">Loading Steam stats...</p> 
                 </div>
              ) : (
                <div className="bg-gray-800/60 p-6 rounded-lg shadow-md backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-3 text-white">Connect Steam</h2>
                  <p className="text-gray-400 mb-4">Connect your Steam account to display your game stats and activity.</p>
                  <button 
                    onClick={() => { /* Navigate to Settings > Connections */ 
                      // Ideally, use a router push or state management to open the modal
                      alert('Navigate to Settings > Connections to connect Steam.'); 
                    }}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded transition duration-200"
                  >
                    Connect Steam Account
                  </button>
                </div>
              )}

              {/* Activity Feed (Placeholder) */}
              <div className="bg-gray-800/60 p-5 rounded-lg shadow-md backdrop-blur-sm">
                 <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">Recent Activity</h2>
                 <p className="text-gray-400">Activity feed coming soon!</p>
                 {/* Display recent user activity here */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </>
    // </MainLayout>
  );
};

// Add getServerSideProps to skip static generation
export async function getServerSideProps() {
  return {
    props: {}, // Will be passed to the page component as props
  };
}

export default ProfilePage; 