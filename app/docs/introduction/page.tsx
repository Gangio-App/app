'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import { FiArrowLeft, FiArrowRight, FiUsers, FiMessageSquare, FiServer, FiHeadphones } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

export default function IntroductionPage() {
  const { locale } = useLanguage();
  const { t } = useTranslations();

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageLayout showBackground={true}>
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/docs" 
            className="inline-flex items-center text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Documentation
          </Link>
        </div>

        {/* Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Introduction to gvng.io
            </span>
          </motion.h1>
          
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded mb-8"
            variants={fadeInUp}
          ></motion.div>
        </motion.div>

        {/* Content */}
        <div className="prose prose-lg prose-invert max-w-none">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">What is gvng.io?</h2>
            <p className="mb-4">
              gvng.io is a next-generation platform designed specifically for gamers to connect, communicate, and conquer together. 
              It combines the best features of social networking, voice communication, and gaming community tools into one seamless experience.
            </p>
            <p>
              Whether you're looking to build a community around your favorite game, coordinate with your team during intense gaming sessions, 
              or simply connect with like-minded players, gvng.io provides all the tools you need in one place.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Key Features</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="flex">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <FiHeadphones className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Crystal Clear Voice Chat</h3>
                  <p className="text-gray-300">
                    Low-latency, high-quality voice communication keeps you connected with your team during intense gaming sessions.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <FiServer className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Custom Servers</h3>
                  <p className="text-gray-300">
                    Create private servers for your community, organize channels, and fully personalize your gaming experience.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <FiUsers className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Friend Management</h3>
                  <p className="text-gray-300">
                    Easily add friends, see who's online, and join their gaming sessions with a single click.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                  <FiMessageSquare className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Rich Messaging</h3>
                  <p className="text-gray-300">
                    Share text, images, videos, and more with your gaming community through our feature-rich messaging system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Getting Started</h2>
            <p className="mb-6">
              New to gvng.io? Here's how to get started in a few simple steps:
            </p>
            
            <ol className="space-y-4 list-decimal list-inside">
              <li className="text-gray-300">
                <span className="font-bold text-white">Create an account</span> - Sign up with your email or connect with your social accounts
              </li>
              <li className="text-gray-300">
                <span className="font-bold text-white">Set up your profile</span> - Add a profile picture, status, and gaming preferences
              </li>
              <li className="text-gray-300">
                <span className="font-bold text-white">Join or create a server</span> - Connect with existing communities or start your own
              </li>
              <li className="text-gray-300">
                <span className="font-bold text-white">Add friends</span> - Find your gaming buddies and add them to your friends list
              </li>
              <li className="text-gray-300">
                <span className="font-bold text-white">Start communicating</span> - Use voice chat, messaging, and screen sharing to connect
              </li>
            </ol>
            
            <div className="mt-6">
              <Link 
                href="/signup" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 shadow-lg shadow-emerald-600/20"
              >
                Create Your Account <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">Next Steps</h2>
            <p className="mb-6">
              Ready to dive deeper? Explore these documentation sections to learn more about specific features:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/docs/servers" 
                className="p-4 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 flex items-center"
              >
                <FiServer className="h-5 w-5 text-emerald-400 mr-3" />
                <span>Server Management</span>
              </Link>
              
              <Link 
                href="/docs/users" 
                className="p-4 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 flex items-center"
              >
                <FiUsers className="h-5 w-5 text-emerald-400 mr-3" />
                <span>User Guide</span>
              </Link>
              
              <Link 
                href="/docs/api" 
                className="p-4 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 flex items-center"
              >
                <FiServer className="h-5 w-5 text-emerald-400 mr-3" />
                <span>API Reference</span>
              </Link>
              
              <Link 
                href="/docs/translations" 
                className="p-4 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-700 hover:border-emerald-500/30 transition-all duration-300 flex items-center"
              >
                <FiUsers className="h-5 w-5 text-emerald-400 mr-3" />
                <span>Translations</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
