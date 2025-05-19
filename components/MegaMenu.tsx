'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUsers, FiMessageSquare, FiHeadphones, FiShield, FiInfo, FiFileText, FiHelpCircle, FiDownload } from 'react-icons/fi';
import { BiGame, BiJoystick, BiWorld, BiRocket } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiOutlineSparkles, HiOutlineStatusOnline, HiOutlineDocumentText } from 'react-icons/hi';
import { useTranslations } from '@/hooks/useTranslations';

interface MegaMenuProps {
  currentPath: string;
}

export default function MegaMenu({ currentPath }: MegaMenuProps) {
  const { t } = useTranslations();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } }
  };

  const isActive = (path: string) => {
    return currentPath === path;
  };

  return (
    <div className="hidden md:flex space-x-6 items-center" ref={menuRef}>
      {/* Features Mega Menu */}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(activeMenu === 'features' ? null : 'features')}
          className={`transition-colors py-2 flex items-center space-x-1 ${isActive('/features') || activeMenu === 'features' ? 'text-emerald-400' : 'text-white hover:text-emerald-400'}`}
        >
          <span>{t('navigation.features')}</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={{ rotate: activeMenu === 'features' ? 180 : 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {activeMenu === 'features' && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 mt-2 w-[550px] bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl p-6 z-50 border border-gray-700/50"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-2">{t('megaMenu.communication')}</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/features#voice-chat" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiHeadphones className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">{t('megaMenu.voiceChannels')}</div>
                          <div className="text-xs text-gray-400">{t('megaMenu.voiceChannelsDesc')}</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/features#screen-sharing" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiMessageSquare className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">{t('megaMenu.textChannels')}</div>
                          <div className="text-xs text-gray-400">{t('megaMenu.textChannelsDesc')}</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-2">{t('megaMenu.gaming')}</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/features#game-integration" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <IoGameControllerOutline className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">{t('megaMenu.gameIntegration')}</div>
                          <div className="text-xs text-gray-400">{t('megaMenu.gameIntegrationDesc')}</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/features#squad-finder" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiUsers className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">{t('megaMenu.squadFinder')}</div>
                          <div className="text-xs text-gray-400">{t('megaMenu.squadFinderDesc')}</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div className="col-span-2 mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center">
                    <img src="/assets/gangiobear-wymsical-forest-transparent.png" alt="GANGIO Bear" className="h-16 w-16" />
                    <div className="ml-4">
                      <h4 className="text-white font-medium">{t('megaMenu.discoverPro')}</h4>
                      <p className="text-sm text-gray-400">{t('megaMenu.proDesc')}</p>
                      <Link href="/premium" className="text-emerald-400 text-sm inline-flex items-center mt-1 hover:text-emerald-300">
                        {t('megaMenu.learnMore')}
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

      {/* Download Link */}
      <div className="relative">
        <Link
          href="/download"
          className={`transition-colors py-2 flex items-center ${isActive('/download') ? 'text-emerald-400' : 'text-white hover:text-emerald-400'}`}
        >
          <span>Download</span>
        </Link>
      </div>

      {/* About Mega Menu */}
      <div className="relative">
        <button
          onClick={() => setActiveMenu(activeMenu === 'about' ? null : 'about')}
          className={`transition-colors py-2 flex items-center space-x-1 ${isActive('/about') || activeMenu === 'about' ? 'text-emerald-400' : 'text-white hover:text-emerald-400'}`}
        >
          <span>About</span>
          <motion.svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 transition-transform duration-200" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            animate={{ rotate: activeMenu === 'about' ? 180 : 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {activeMenu === 'about' && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 mt-2 w-[400px] bg-gray-800/95 backdrop-blur-lg rounded-xl shadow-xl p-6 z-50 border border-gray-700/50"
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-2">Company</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/about" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiInfo className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">About Us</div>
                          <div className="text-xs text-gray-400">Our mission and story</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/careers" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <BiRocket className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">Careers</div>
                          <div className="text-xs text-gray-400">Join our growing team</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/blog" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiFileText className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">Blog</div>
                          <div className="text-xs text-gray-400">News and updates</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-emerald-400 font-semibold mb-2">Resources</h3>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/changelog" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <HiOutlineDocumentText className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">Changelog</div>
                          <div className="text-xs text-gray-400">Latest updates and features</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/status" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <HiOutlineStatusOnline className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">Status</div>
                          <div className="text-xs text-gray-400">System status and metrics</div>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="flex items-center text-gray-300 hover:text-emerald-400 transition-colors">
                        <span className="bg-emerald-500/20 p-2 rounded-md mr-3">
                          <FiHelpCircle className="h-5 w-5 text-emerald-500" />
                        </span>
                        <div>
                          <div className="font-medium">FAQ</div>
                          <div className="text-xs text-gray-400">Frequently asked questions</div>
                        </div>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Discover Link */}
      <Link
        href="/discover-servers"
        className={`transition-colors py-2 ${isActive('/discover-servers') ? 'text-emerald-400' : 'text-white hover:text-emerald-400'}`}
      >
        {t('navigation.discover')}
      </Link>
    </div>
  );
}
