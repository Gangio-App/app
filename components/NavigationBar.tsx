'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import UserDropdown from '@/components/UserDropdown';
import { useTranslations } from '@/hooks/useTranslations';

interface User {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface NavigationBarProps {
  currentUser: User | null;
  onLogout?: () => void; // Optional: only needed if currentUser exists
}

export default function NavigationBar({ currentUser, onLogout }: NavigationBarProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const [isFeaturesMenuOpen, setIsFeaturesMenuOpen] = useState(false);
  const featuresMenuRef = useRef<HTMLDivElement>(null);

  // Close features menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (featuresMenuRef.current && !featuresMenuRef.current.contains(event.target as Node)) {
        setIsFeaturesMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [featuresMenuRef]);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.nav
      className="px-6 py-4 flex justify-between items-center max-w-full mx-auto bg-gray-900/50 backdrop-blur-md border-b border-gray-800/50 fixed top-0 left-0 right-0 z-40"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Left side: Logo and version */}
      <motion.div
        className="flex items-center space-x-2"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Link 
          href="/" 
          className="relative group/logo flex items-center space-x-2"
        >
            <img
              src="/assets/logo-text.png"
              alt="GANGIO"
              className="h-8 w-auto transition-colors group-hover/logo:brightness-110"
            />
            {/* <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover/logo:opacity-100 transition-opacity whitespace-nowrap">
              GANGIO - Where Gamers Unite
            </div> */}
        </Link>
        <div className="relative group/version hidden sm:block">
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-emerald-400 bg-emerald-400/10 rounded-full group-hover/version:bg-emerald-400/20 transition-colors">
            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-1.5 animate-pulse"></span>
            {t('app.alphaTest')}
          </span>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-xs text-gray-300 px-2 py-1 rounded opacity-0 group-hover/version:opacity-100 transition-opacity whitespace-nowrap">
            {t('app.version')}
          </div>
        </div>
      </motion.div>

      {/* Center: Navigation Links + Mega Menu */}
      <div className="hidden md:flex space-x-6 items-center">
        {/* Features Mega Menu */}
        <div className="relative" ref={featuresMenuRef}>
          <button
            onClick={() => setIsFeaturesMenuOpen(!isFeaturesMenuOpen)}
            className="text-white hover:text-emerald-400 transition-colors py-2 flex items-center space-x-1"
          >
            <span>{t('navigation.features')}</span>
            <motion.svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 transition-transform duration-200" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              animate={{ rotate: isFeaturesMenuOpen ? 180 : 0 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {isFeaturesMenuOpen && (
              <motion.div
                variants={dropdownVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-0 mt-2 w-[550px] bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl p-6 z-50 border border-gray-700/50"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-emerald-400 font-semibold mb-2">Communication</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="#" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                          <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                          </span>
                          <div>
                            <div className="font-medium">Voice Channels</div>
                            <div className="text-xs text-gray-400">Crystal-clear voice chat for gaming</div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                          <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </span>
                          <div>
                            <div className="font-medium">Screen Sharing</div>
                            <div className="text-xs text-gray-400">Share your gameplay in real-time</div>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-emerald-400 font-semibold mb-2">Gaming</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="#" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                          <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                            </svg>
                          </span>
                          <div>
                            <div className="font-medium">Game Integration</div>
                            <div className="text-xs text-gray-400">Connect with your favorite games</div>
                          </div>
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                          <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </span>
                          <div>
                            <div className="font-medium">Squad Finder</div>
                            <div className="text-xs text-gray-400">Find the perfect gaming team</div>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="col-span-2 mt-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center">
                      <img src="/assets/gangiobear-wymsical-forest-transparent.png" alt="GANGIO Bear" className="h-16 w-16" />
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Discover GANGIO Pro</h4>
                        <p className="text-sm text-gray-400">Enhanced features for serious gamers</p>
                        <Link href="#" className="text-emerald-400 text-sm inline-flex items-center mt-1 hover:text-emerald-300">
                          Learn more
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Discover Link */}
        <Link
          href="/discover-servers"
          className="text-white hover:text-emerald-400 transition-colors py-2"
        >
          {t('navigation.discover')}
        </Link>

        {/* Added Links */}
        <Link href="/about" className="text-white hover:text-emerald-400 transition-colors py-2">
          {t('navigation.about')}
        </Link>
        <Link href="/careers" className="text-white hover:text-emerald-400 transition-colors py-2">
          {t('navigation.careers')}
        </Link>
        <Link href="/download" className="text-white hover:text-emerald-400 transition-colors py-2">
          {t('navigation.download')}
        </Link>
      </div>

      {/* Right side: Auth buttons or User Dropdown */}
      <div className="flex items-center space-x-4">
        {currentUser ? (
          // If user is logged in, show user dropdown
          <UserDropdown user={currentUser} onLogout={onLogout || (() => {})} />
        ) : (
          // If user is not logged in, show login/open app buttons
          <>
            <motion.button
              onClick={() => router.push('/login')}
              className="hidden md:block px-4 py-2 rounded-md text-white bg-gray-700 hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('navigation.login')}
            </motion.button>

            <motion.button
              onClick={() => router.push('/signup')}
              className="px-4 py-2 rounded-md text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('navigation.openApp')}
            </motion.button>
          </>
        )}

        {/* Mobile menu button (functionality not implemented) */}
        <div className="md:hidden">
          <button className="text-white p-2 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
} 