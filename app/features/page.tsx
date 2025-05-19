'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiHeadphones, FiMessageSquare, FiUsers, FiShield, FiGlobe, FiMonitor } from 'react-icons/fi';
import { BiGame, BiJoystick, BiWorld } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useTranslations } from '@/hooks/useTranslations';

export default function FeaturesPage() {
  const { t } = useTranslations();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <PageLayout>
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <div className="inline-block p-2 px-4 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
              <div className="flex items-center space-x-2">
                <HiOutlineSparkles className="text-emerald-400" />
                <span className="text-emerald-300 font-medium">{t('features.designedForGamers')}</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">{t('features.title')}</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>
          </motion.div>

          {/* Communication Features */}
          <section id="communication" className="mb-24">
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {t('features.sections.communication.title')}
                </span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                {t('features.sections.communication.subtitle')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Voice Chat */}
              <motion.div 
                id="voice-chat"
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <FiHeadphones className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('features.sections.voiceChat.title')}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {t('features.sections.voiceChat.description')}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {(() => {
                        const features = t('features.sections.voiceChat.features', { returnObjects: true });
                        return (Array.isArray(features) ? features : []).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/voice-chat.jpg"
                        alt="Voice Chat"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Screen Sharing */}
              <motion.div 
                id="screen-sharing"
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <FiMonitor className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('features.sections.screenSharing.title')}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {t('features.sections.screenSharing.description')}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {(() => {
                        const features = t('features.sections.screenSharing.features', { returnObjects: true });
                        return (Array.isArray(features) ? features : []).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/screen-sharing.jpg"
                        alt="Screen Sharing"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Gaming Features */}
          <section id="gaming" className="mb-24">
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {t('features.sections.gaming.title')}
                </span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                {t('features.sections.gaming.subtitle')}
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Game Integration */}
              <motion.div 
                id="game-integration"
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <IoGameControllerOutline className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">{t('features.sections.gameIntegration.title')}</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      {t('features.sections.gameIntegration.description')}
                    </p>
                    <ul className="space-y-2 mb-6">
                      {(() => {
                        const features = t('features.sections.gameIntegration.features', { returnObjects: true });
                        return (Array.isArray(features) ? features : []).map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-emerald-400 mr-2">•</span>
                            <span className="text-gray-300">{feature}</span>
                          </li>
                        ));
                      })()}
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/game-integration.jpg"
                        alt="Game Integration"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Squad Finder */}
              <motion.div 
                id="squad-finder"
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <FiUsers className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Squad Finder</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Find the perfect gaming partners based on your preferences, skill level, and play style.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Advanced matchmaking algorithms</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Filter by game, region, and skill level</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Schedule gaming sessions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Player reputation system</span>
                      </li>
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/squad-finder.jpg"
                        alt="Squad Finder"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Community Features */}
          <section id="community" className="mb-24">
            <motion.div 
              className="text-center mb-12"
              variants={fadeInUp}
            >
              <h2 className="text-3xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  Community
                </span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Build and manage thriving gaming communities with powerful tools.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Server Management */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <FiGlobe className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Server Management</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Create and customize your own gaming servers with powerful moderation tools.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Customizable roles and permissions</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Channel organization and categories</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Welcome messages and automation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Server analytics and insights</span>
                      </li>
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/server-management.jpg"
                        alt="Server Management"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Security */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl"
                variants={fadeInUp}
              >
                <div className="flex items-start">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mr-6">
                    <FiShield className="h-7 w-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-3">Security & Privacy</h3>
                    <p className="text-gray-300 leading-relaxed mb-6">
                      Keep your community safe with advanced security features and privacy controls.
                    </p>
                    <ul className="space-y-2 mb-6">
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>End-to-end encryption for private messages</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Two-factor authentication</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>IP and spam protection</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-emerald-400 mr-2">•</span>
                        <span>Customizable privacy settings</span>
                      </li>
                    </ul>
                    <div className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src="/assets/features/security.jpg"
                        alt="Security"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Call to action */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-gray-300 mb-6">
              Download GANGIO now and experience the ultimate gaming communication platform.
            </p>
            <Link 
              href="/download" 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 inline-flex items-center justify-center"
            >
              Download Now
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
