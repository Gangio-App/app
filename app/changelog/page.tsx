'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiClock, FiCalendar, FiTag, FiCheckCircle, FiZap, FiPackage, FiLock } from 'react-icons/fi';
import { BiBug } from 'react-icons/bi';
import { HiOutlineSparkles, HiOutlineFire, HiOutlineShieldCheck } from 'react-icons/hi';

export default function ChangelogPage() {
  const [filterTag, setFilterTag] = useState<string | null>(null);

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

  // Changelog data
  const releases = [
    {
      version: "v0.1.1",
      date: "May 18, 2025",
      title: "Enhanced Chat Experience",
      description: "Added message reactions and link previews to direct messaging for a more interactive chat experience.",
      changes: [
        { type: "feature", title: "Added message reactions with emoji support", tag: "feature" },
        { type: "feature", title: "Implemented link preview for URLs in messages", tag: "feature" },
        { type: "improvement", title: "Enhanced UI styling for direct message chat bubbles", tag: "performance" },
        { type: "improvement", title: "Optimized link preview loading with visual indicators", tag: "performance" },
        { type: "improvement", title: "Added hover effects to interactive elements in chat", tag: "performance" },
        { type: "fix", title: "Fixed message reaction alignment in dark mode", tag: "bugfix" }
      ]
    },
    {
      version: "v0.1.0",
      date: "May 14, 2025",
      title: "Internationalization and UI Improvements",
      description: "Added multi-language support and enhanced UI elements across the platform.",
      changes: [
        { type: "feature", title: "Implemented comprehensive internationalization system", tag: "feature" },
        { type: "feature", title: "Added Turkish language support", tag: "feature" },
        { type: "feature", title: "Created Language Settings panel for language selection", tag: "feature" },
        { type: "feature", title: "Added decorative background elements to Friends page", tag: "feature" },
        { type: "improvement", title: "Enhanced user interface with subtle visual elements", tag: "performance" },
        { type: "improvement", title: "Optimized language switching without page reloads", tag: "performance" },
        { type: "fix", title: "Fixed URL structure issues with language switching", tag: "bugfix" },
        { type: "security", title: "Improved client-side data handling for user preferences", tag: "security" }
      ]
    },
    {
      version: "v0.0.9",
      date: "May 11, 2025",
      title: "Performance Optimization and UI Enhancements",
      description: "Major performance improvements and Discord-style UI enhancements.",
      changes: [
        { type: "feature", title: "Implemented megamenu.", tag: "feature" },
        { type: "improvement", title: "Optimized MongoDB connection settings for Docker environment", tag: "performance" },
        { type: "improvement", title: "Enhanced server API for better performance", tag: "performance" },
        { type: "improvement", title: "Reduced timeouts in database connections", tag: "performance" },
        { type: "improvement", title: "Streamlined navigation interface", tag: "performance" },
        { type: "fix", title: "Fixed timeout issues in Docker environment", tag: "bugfix" },
        { type: "security", title: "Improved environment variable handling in Docker", tag: "security" }
      ]
    },
    {
      version: "v0.0.8",
      date: "May 5, 2025",
      title: "Navigation and User Experience Improvements",
      description: "This release focuses on enhancing the navigation structure and overall user experience.",
      changes: [
        { type: "feature", title: "Added comprehensive megamenu for easier navigation", tag: "feature" },
        { type: "feature", title: "Created new pages: Features, Blog, FAQ, and legal pages", tag: "feature" },
        { type: "feature", title: "Added Changelog and Status pages under About menu", tag: "feature" },
        { type: "improvement", title: "Enhanced mascot integration throughout the site", tag: "performance" },
        { type: "improvement", title: "Improved image loading with WebP format support", tag: "performance" },
        { type: "fix", title: "Fixed authentication issues on public pages", tag: "bugfix" }
      ]
    },
    {
      version: "v0.0.7",
      date: "Apr 24, 2025",
      title: "Download Page Enhancements",
      description: "Major improvements to the download page and landing page features.",
      changes: [
        { type: "feature", title: "Added prominent 'Download NOW' button to landing page", tag: "feature" },
        { type: "feature", title: "Created platform-specific download options", tag: "feature" },
        { type: "feature", title: "Added version indicators and file size information", tag: "feature" },
        { type: "improvement", title: "Enhanced visual design with React icons", tag: "performance" },
        { type: "improvement", title: "Improved responsive layout for all device sizes", tag: "performance" },
        { type: "fix", title: "Fixed download link issues on mobile devices", tag: "bugfix" }
      ]
    },
    {
      version: "v0.0.6",
      date: "April 1, 2025",
      title: "Server Management Improvements",
      description: "This update focuses on enhancing server management capabilities.",
      changes: [
        { type: "feature", title: "Added server roles and permissions system", tag: "feature" },
        { type: "improvement", title: "Optimized server API response times", tag: "performance" },
        { type: "improvement", title: "Enhanced server member management", tag: "performance" },
        { type: "fix", title: "Fixed issues with server creation on slow connections", tag: "bugfix" },
        { type: "fix", title: "Resolved notification issues for server events", tag: "bugfix" }
      ]
    },
    {
      version: "v0.0.5",
      date: "Mar 24, 2025",
      title: "Initial Alpha Release",
      description: "Our first alpha release with core functionality.",
      changes: [
        { type: "feature", title: "Basic server creation and management", tag: "feature" },
        { type: "feature", title: "Text channels and messaging", tag: "feature" },
        { type: "feature", title: "User registration and authentication", tag: "feature" },
        { type: "feature", title: "Simple profile customization", tag: "performance" },
        { type: "feature", title: "Desktop application for Windows", tag: "feature" },
        { type: "security", title: "Basic encryption for messages", tag: "security" }
      ]
    }
  ];

  // Filter releases by tag if a filter is selected
  const filteredReleases = filterTag 
    ? releases.map(release => ({
        ...release,
        changes: release.changes.filter(change => change.tag === filterTag)
      })).filter(release => release.changes.length > 0)
    : releases;

  // All available tags
  const allTags = [
    { id: "feature", label: "Features", icon: HiOutlineSparkles },
    { id: "performance", label: "Performance", icon: FiZap },
    { id: "bugfix", label: "Bug Fixes", icon: BiBug },
    { id: "security", label: "Security", icon: HiOutlineShieldCheck },
    { id: "integration", label: "Integrations", icon: FiPackage }
  ];

  // Get icon for change type
  const getChangeTypeIcon = (type: string) => {
    switch (type) {
      case 'feature': return <HiOutlineSparkles className="text-purple-400" />;
      case 'improvement': return <FiZap className="text-blue-400" />;
      case 'fix': return <BiBug className="text-green-400" />;
      case 'security': return <FiLock className="text-red-400" />;
      default: return <FiTag className="text-gray-400" />;
    }
  };

  return (
    <PageLayout showBackground={true}>
      <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <div className="inline-block p-2 px-4 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
              <div className="flex items-center space-x-2">
                <FiClock className="text-emerald-400" />
                <span className="text-emerald-300 font-medium">Latest Updates (v0.0.9)</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Changelog</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Track all the latest improvements, features, and bug fixes to the GANGIO platform.
            </p>
            
            {/* Filter tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-12">
              <button 
                onClick={() => setFilterTag(null)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 text-sm ${!filterTag ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
              >
                <span>All Updates</span>
              </button>
              
              {allTags.map(tag => (
                <button 
                  key={tag.id}
                  onClick={() => setFilterTag(tag.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 text-sm ${filterTag === tag.id ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <tag.icon className="mr-1" />
                  <span>{tag.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Releases */}
          <motion.div variants={staggerContainer}>
            {filteredReleases.map((release, index) => (
              <motion.div 
                key={release.version}
                className={`mb-16 relative ${index !== releases.length - 1 ? 'pb-16 border-b border-gray-800/50' : ''}`}
                variants={fadeInUp}
              >
                {/* Version timeline dot and line */}
                {index !== releases.length - 1 && (
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-800/70 ml-4 md:ml-6"></div>
                )}
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Version info */}
                  <div className="md:w-1/4 flex flex-col">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center z-10 mr-4">
                        <HiOutlineFire className="text-emerald-400 text-lg md:text-xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{release.version}</h3>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <FiCalendar className="mr-1" />
                          <span>{release.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 hidden md:block">
                      <img src="/assets/gangiobear-wymsical-forest-transparent.webp" alt="GANGIO Bear" className="h-24 w-24 opacity-70" />
                    </div>
                  </div>
                  
                  {/* Release content */}
                  <div className="md:w-3/4">
                    <h2 className="text-2xl font-bold mb-3">{release.title}</h2>
                    <p className="text-gray-300 mb-6">{release.description}</p>
                    
                    <div className="space-y-4">
                      {release.changes.map((change, i) => (
                        <div key={i} className="flex items-start">
                          <div className="mt-1 mr-3">
                            {getChangeTypeIcon(change.type)}
                          </div>
                          <div>
                            <p className="text-gray-200">{change.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </motion.div>

          {/* Call to action */}
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Stay Up to Date</h2>
            <p className="text-gray-300 mb-6">
              Download the latest version to enjoy all the new features and improvements.
            </p>
            <Link 
              href="/download" 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 inline-flex items-center justify-center"
            >
              Get Latest Version
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
