'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';
import { FiBook, FiCode, FiGlobe, FiServer, FiUsers, FiArrowRight, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

// Documentation categories
const DOCUMENTATION_CATEGORIES = [
  {
    id: 'introduction',
    title: 'Introduction',
    description: 'Overview of gvng.io platform and its features',
    icon: <FiBook className="h-6 w-6 text-emerald-400" />,
    link: '/docs/introduction'
  },
  {
    id: 'translations',
    title: 'Translations',
    description: 'How to contribute translations and localize the platform',
    icon: <FiGlobe className="h-6 w-6 text-emerald-400" />,
    link: '/docs/translations'
  },
  {
    id: 'api',
    title: 'API Reference',
    description: 'Documentation for integrating with gvng.io APIs',
    icon: <FiCode className="h-6 w-6 text-emerald-400" />,
    link: '/docs/api'
  },
  {
    id: 'servers',
    title: 'Server Management',
    description: 'Creating and managing servers for your communities',
    icon: <FiServer className="h-6 w-6 text-emerald-400" />,
    link: '/docs/servers'
  },
  {
    id: 'users',
    title: 'User Guide',
    description: 'User management, profiles, and permissions',
    icon: <FiUsers className="h-6 w-6 text-emerald-400" />,
    link: '/docs/users'
  }
];

export default function DocsPage() {
  const router = useRouter();
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(DOCUMENTATION_CATEGORIES);

  // Filter categories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(DOCUMENTATION_CATEGORIES);
      return;
    }

    const filtered = DOCUMENTATION_CATEGORIES.filter(
      category => 
        category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredCategories(filtered);
  }, [searchQuery]);

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
    <PageLayout showBackground={true}>
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Documentation
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            Everything you need to know about gvng.io platform, APIs, and features.
          </motion.p>

          {/* Search Bar */}
          <motion.div 
            className="max-w-xl mx-auto mb-12"
            variants={fadeInUp}
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-4 bg-gray-800/80 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white placeholder-gray-400"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Documentation Categories */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCategories.map((category) => (
            <motion.div
              key={category.id}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300"
              onClick={() => router.push(category.link)}
            >
              <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                {category.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">{category.title}</h3>
              <p className="text-gray-300 leading-relaxed mb-4">{category.description}</p>
              <Link 
                href={category.link}
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Learn more <FiArrowRight className="ml-2" />
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiCode className="mr-2 text-emerald-400" /> Developer Hub
              </h3>
              <p className="text-gray-300 mb-4">
                Access developer tools, SDKs, and code samples to integrate with gvng.io.
              </p>
              <Link 
                href="/docs/api/developer-hub"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Visit Developer Hub <FiExternalLink className="ml-2" />
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiUsers className="mr-2 text-emerald-400" /> Community Forum
              </h3>
              <p className="text-gray-300 mb-4">
                Join discussions, ask questions, and share your knowledge with other users.
              </p>
              <Link 
                href="https://forum.gvng.io"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Join the Forum <FiExternalLink className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
