import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiClock, FiExternalLink, FiTag, FiCheckCircle, FiZap, FiPackage, FiLock } from 'react-icons/fi';
import { BiBug } from 'react-icons/bi';
import { HiOutlineSparkles, HiOutlineShieldCheck } from 'react-icons/hi';
import { useTranslations } from '@/hooks/useTranslations';

// Changelog data - same as in the changelog page
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
  }
];

const ChangelogPanel: React.FC = () => {
  const { t } = useTranslations();
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // Filter releases by tag if a filter is selected
  const filteredReleases = filterTag 
    ? releases.map(release => ({
        ...release,
        changes: release.changes.filter(change => change.tag === filterTag)
      })).filter(release => release.changes.length > 0)
    : releases;

  // All available tags
  const allTags = [
    { id: "feature", label: t('changelog.tags.features'), icon: HiOutlineSparkles },
    { id: "performance", label: t('changelog.tags.performance'), icon: FiZap },
    { id: "bugfix", label: t('changelog.tags.bugfixes'), icon: BiBug },
    { id: "security", label: t('changelog.tags.security'), icon: HiOutlineShieldCheck }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('changelog.title')}</h2>
        <Link 
          href="/changelog" 
          className="text-emerald-400 hover:text-emerald-300 flex items-center text-sm"
        >
          {t('changelog.viewFull')} <FiExternalLink className="ml-1" />
        </Link>
      </div>
      
      {/* Filter tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilterTag(null)}
          className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 text-xs ${!filterTag ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
        >
          <span>{t('changelog.filters.all')}</span>
        </button>
        
        {allTags.map(tag => (
          <button 
            key={tag.id}
            onClick={() => setFilterTag(tag.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-all duration-300 text-xs ${filterTag === tag.id ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
          >
            <tag.icon className="mr-1 h-3 w-3" />
            <span>{tag.label}</span>
          </button>
        ))}
      </div>

      {/* Releases - Limited to 3 most recent */}
      <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2">
        {filteredReleases.slice(0, 3).map((release, index) => (
          <div 
            key={release.version}
            className={`relative ${index !== Math.min(filteredReleases.length, 3) - 1 ? 'pb-8 border-b border-gray-800/50' : ''}`}
          >
            <div className="flex items-center mb-3">
              <div className="bg-emerald-500/20 text-emerald-400 rounded-full px-3 py-1 text-xs font-medium">
                {release.version}
              </div>
              <div className="text-gray-400 text-xs ml-3 flex items-center">
                <FiClock className="mr-1" /> {release.date}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{release.title}</h3>
            <p className="text-gray-300 text-sm mb-4">{release.description}</p>
            
            <ul className="space-y-2">
              {release.changes.map((change, i) => (
                <li key={i} className="flex items-start">
                  <div className="mt-0.5 mr-3">
                    {getChangeTypeIcon(change.type)}
                  </div>
                  <span className="text-gray-200 text-sm">{change.title}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      
      <div className="pt-4 border-t border-gray-800">
        <Link 
          href="/changelog" 
          className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md text-sm transition-colors"
        >
          {t('changelog.viewAllUpdates')}
        </Link>
      </div>
    </div>
  );
};

export default ChangelogPanel;
