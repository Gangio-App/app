'use client';

import React, { useState, useEffect } from 'react';
import { UniversalSidebarNew } from '@/components/UniversalSidebarNew';
import { motion } from 'framer-motion';

export default function SidebarDemoPage() {
  const [activeServerId, setActiveServerId] = useState<string | undefined>();
  const [mounted, setMounted] = useState(false);

  // Ensure window is available
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleServerClick = (serverId: string) => {
    setActiveServerId(serverId);
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Ambient background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-600/10 blur-[100px]" />
        <div className="absolute top-[40%] right-[20%] w-[25%] h-[25%] rounded-full bg-violet-600/10 blur-[80px]" />
      </div>

      {/* Animated grid pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />

      {/* Sidebar */}
      <UniversalSidebarNew 
        activeServerId={activeServerId}
        onServerClick={handleServerClick}
      />

      {/* Main content area */}
      <div className="flex-1 p-8 overflow-y-auto overflow-x-hidden">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
              <span className="text-emerald-400">Modern</span> Sidebar Demo
            </h1>
            <p className="text-gray-400 text-lg">
              An interactive demo of our new glassmorphism sidebar with drag-and-drop server organization.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-xl p-6 overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-white mb-3">Features</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Modern glassmorphism design with subtle backdrop blur effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Animated tooltips that appear when hovering over items</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Smooth animations for all interactions and state changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Drag-and-drop functionality for reordering servers</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Visual indicators for server ownership and active state</span>
                </li>
              </ul>
            </motion.div>

            <motion.div 
              className="bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-xl p-6 overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-white mb-3">How to Use</h2>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <span>Click on any server icon to select it (changes the active state)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <span>Hover over any icon to see its tooltip with additional information</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <span>Drag and drop servers to reorder them in your list</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                  <span>The "Owner" badge appears on servers you own</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-emerald-500/20 text-emerald-400 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                  <span>Active servers show a green indicator and have a subtle glow effect</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div 
            className="mt-8 bg-gray-800/30 backdrop-blur-md border border-gray-700/30 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-white mb-3">
              Currently {activeServerId ? 'Selected' : 'No'} Server
            </h2>
            {activeServerId ? (
              <p className="text-emerald-400">
                Server ID: <span className="font-mono bg-gray-800 px-2 py-1 rounded text-sm">{activeServerId}</span>
              </p>
            ) : (
              <p className="text-gray-400">Click on a server in the sidebar to select it</p>
            )}
          </motion.div>

          <motion.div 
            className="text-center mt-10 text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Modern Sidebar • Designed with Glassmorphism 2025 style
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 