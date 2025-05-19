'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NavigationBar from '@/components/NavigationBar';
import MegaMenu from '@/components/MegaMenu';
import Footer from '@/components/Footer';
import ThreeBackground from '@/components/ui/ThreeBackground';

interface PageLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
}

export default function PageLayout({ children, showBackground = true }: PageLayoutProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const pathname = usePathname();

  // Handle authentication
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving user from localStorage:', error);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="flex flex-col min-h-screen">
        {/* Header with Navigation */}
        <header className="px-6 py-4 flex justify-between items-center max-w-full mx-auto bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 fixed top-0 left-0 right-0 z-40">
          {/* Left side: Logo and version */}
          <div className="flex items-center space-x-2">
            <a 
              href="/" 
              className="relative group/logo flex items-center space-x-2"
            >
              <img
                src="/assets/logo-text.png"
                alt="GANGIO"
                className="h-8 w-auto transition-colors group-hover/logo:brightness-110"
              />
            </a>
            <div className="relative group/version hidden sm:block">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full group-hover/version:bg-emerald-400/20 transition-colors">
                <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
                Alpha Test
              </span>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover/version:opacity-100 transition-opacity whitespace-nowrap">
                Version 0.1.0-alpha
              </div>
            </div>
          </div>

          {/* Center: Navigation Links + Mega Menu */}
          <MegaMenu currentPath={pathname || ''}/>

          {/* Right side: Auth buttons or user dropdown */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-300 hidden md:inline-block">
                  {currentUser.name || 'User'}
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <a 
                  href="/login" 
                  className="px-4 py-2 text-sm text-white hover:text-emerald-400 transition-colors hidden md:block"
                >
                  Log In
                </a>
                <a 
                  href="/signup" 
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                >
                  Open App
                </a>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-20">
          {showBackground && (
            <>
              <ThreeBackground preset="landing" />
              <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] pointer-events-none"></div>
            </>
          )}
          <div className="relative">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
