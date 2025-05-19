'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PageLayout from '@/components/PageLayout';
import { motion } from 'framer-motion';
import { useTranslations } from '@/hooks/useTranslations';
import { FiUsers, FiSearch, FiSliders, FiShield, FiXCircle, FiUserPlus } from 'react-icons/fi';
import { BiGame } from 'react-icons/bi';
import SquadRoom from '@/components/squad/SquadRoom';

// CS2 Ranks based on memory (simplified for dropdown)
const cs2Ranks = [
  { value: 'any', label: 'Any Rank' },
  { value: '0-7499', label: 'Silver (Below 7500 ELO)' },
  { value: '7500-11799', label: 'Gold Nova (7500 - 11799 ELO)' },
  { value: '11800-14999', label: 'Master Guardian (11800 - 14999 ELO)' },
  { value: '15000-18399', label: 'Legendary Eagle / DMG (15000 - 18399 ELO)' },
  { value: '18400-19999', label: 'Supreme Master First Class (18400 - 19999 ELO)' },
  { value: '20000-30000', label: 'Global Elite (20000+ ELO)' },
];

const regions = [
  { value: 'any', label: 'Any Region' },
  { value: 'na_east', label: 'North America (East)' },
  { value: 'na_west', label: 'North America (West)' },
  { value: 'eu_west', label: 'Europe (West)' },
  { value: 'eu_east', label: 'Europe (East)' },
  { value: 'asia', label: 'Asia' },
  { value: 'sa', label: 'South America' },
  { value: 'oce', label: 'Oceania' },
];

export default function SquadFinderPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { t, squadFinder } = useTranslations();
  const [filters, setFilters] = useState({
    cs2Rank: 'any',
    region: 'any',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeSquadId, setActiveSquadId] = useState<string | null>(null);
  const [isCreatingSquad, setIsCreatingSquad] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/login');
    }
  }, [sessionStatus, router]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateSquad = async () => {
    if (sessionStatus !== 'authenticated') return;
    
    setIsCreatingSquad(true);
    try {
      // For now, just create a random ID for the squad
      // In production, this would come from your backend
      const squadId = Math.random().toString(36).substring(2, 10);
      setActiveSquadId(squadId);
    } catch (error) {
      console.error('Error creating squad:', error);
    } finally {
      setIsCreatingSquad(false);
    }
  };

  const handleLeaveSquad = () => {
    setActiveSquadId(null);
  };

  // If not authenticated yet, show loading
  if (sessionStatus === 'loading') {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12 md:py-20 text-white flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12 md:py-20 text-white">
        {activeSquadId ? (
          // Show the squad room when a squad is active
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <FiUsers className="mr-3 text-emerald-400"/> {squadFinder.squadRoom()}
              </h2>
              <button
                onClick={handleLeaveSquad}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {squadFinder.leaveSquad()}
              </button>
            </div>
            <SquadRoom squadId={activeSquadId} onClose={handleLeaveSquad} />
          </div>
        ) : (
          // Show the squad finder UI when no squad is active
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10 md:mb-12"
            >
              <FiUsers className="mx-auto text-emerald-400 text-6xl mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                {t('megaMenu.squadFinderDesc')} <span className="text-emerald-400">CS2</span>
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Discover teammates for Counter-Strike 2. Filter by ELO, region, and join the fight!
              </p>
            </motion.div>

            {/* Filters Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-800/80 backdrop-blur-md p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700/60 mb-10 md:mb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                <div>
                  <label htmlFor="game" className="block text-sm font-medium text-gray-300 mb-1.5">Game</label>
                  <div className="flex items-center bg-gray-700/80 rounded-lg p-3 h-[48px]">
                    <BiGame className="text-emerald-400 mr-2 text-xl" />
                    <span className="text-white font-medium">Counter-Strike 2</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="cs2Rank" className="block text-sm font-medium text-gray-300 mb-1.5">{squadFinder.skillLevel()}</label>
                  <select 
                    id="cs2Rank" 
                    name="cs2Rank"
                    value={filters.cs2Rank}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700/80 border-gray-600/70 text-white rounded-lg p-3 h-[48px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {cs2Ranks.map(rank => (
                      <option key={rank.value} value={rank.value}>{rank.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-300 mb-1.5">{squadFinder.region()}</label>
                  <select 
                    id="region" 
                    name="region"
                    value={filters.region}
                    onChange={handleFilterChange}
                    className="w-full bg-gray-700/80 border-gray-600/70 text-white rounded-lg p-3 h-[48px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                  >
                    {regions.map(region => (
                      <option key={region.value} value={region.value}>{region.label}</option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button"
                  onClick={handleCreateSquad}
                  disabled={isCreatingSquad}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-150 h-[48px] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  {isCreatingSquad ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Squad...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" /> {squadFinder.createSquad()}
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center py-12 bg-gray-800/60 rounded-lg border border-dashed border-gray-700/50"
            >
              <FiShield className="mx-auto text-emerald-500 text-5xl mb-4" />
              <h3 className="text-xl font-semibold mb-2">{squadFinder.createSquad()}</h3>
              <p className="text-gray-300 max-w-2xl mx-auto mb-6">
                Create a new squad and wait for others to join, or invite your friends directly.
                Each squad can have up to 5 players for CS2.
              </p>
              
              <button
                onClick={handleCreateSquad}
                disabled={isCreatingSquad}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-md text-sm font-medium transition-colors inline-flex items-center"
              >
                {isCreatingSquad ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2" />
                    {squadFinder.createSquad()}
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </PageLayout>
  );
}