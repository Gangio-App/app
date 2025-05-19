'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import { FiArrowLeft, FiGlobe, FiCode, FiDownload, FiGithub, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

// Supported languages with their codes, names, and completion percentages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', completion: '100%', completionValue: 100, flag: '/assets/flags/us.webp' },
  { code: 'tr', name: 'Türkçe', completion: '7%', completionValue: 7, flag: '/assets/flags/tr.webp' },
  { code: 'es', name: 'Español', completion: '0%', completionValue: 0, flag: '/assets/flags/es.webp' },
  { code: 'fr', name: 'Français', completion: '0%', completionValue: 0, flag: '/assets/flags/fr.webp' },
  { code: 'de', name: 'Deutsch', completion: '0%', completionValue: 0, flag: '/assets/flags/de.webp' },
  { code: 'ja', name: '日本語', completion: '0%', completionValue: 0, flag: '/assets/flags/jp.webp' }
];

export default function TranslationsDocsPage() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

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
              Translations Guide
            </span>
          </motion.h1>
          
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded mb-8"
            variants={fadeInUp}
          ></motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl"
            variants={fadeInUp}
          >
            Help make gvng.io accessible to gamers around the world by contributing translations in your language.
          </motion.p>
        </motion.div>

        {/* Translation Progress */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400">Current Translation Progress</h2>
          
          {/* Language Translation Level Overview */}
          <div className="mb-8">
            <div className="flex flex-wrap items-end justify-center gap-8 mb-6">
              {SUPPORTED_LANGUAGES.map((language) => (
                <div key={`bar-${language.code}`} className="flex flex-col items-center">
                  <div className="flex flex-col items-center justify-end h-40 mb-2">
                    <div 
                      className={`w-16 rounded-t-md ${language.code === selectedLanguage ? 'bg-emerald-500' : 'bg-emerald-500/60'}`}
                      style={{ height: `${Math.max(language.completionValue, 3)}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Image 
                      src={language.flag} 
                      alt={language.name} 
                      width={32} 
                      height={24} 
                      className="rounded-sm mb-1"
                    />
                    <span className="text-sm font-medium">{language.name}</span>
                    <span className="text-xs text-emerald-400 font-bold">{language.completion}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400">
              Help us reach 100% in all languages by contributing translations!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-3 text-white">Most Needed Languages</h3>
              <p className="text-gray-300 mb-4">
                These languages have the most users but low translation coverage:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Image 
                    src="/assets/flags/es.webp" 
                    alt="Spanish" 
                    width={24} 
                    height={16} 
                    className="rounded-sm mr-2"
                  />
                  <span>Spanish (Español)</span>
                </li>
                <li className="flex items-center">
                  <Image 
                    src="/assets/flags/fr.webp" 
                    alt="French" 
                    width={24} 
                    height={16} 
                    className="rounded-sm mr-2"
                  />
                  <span>French (Français)</span>
                </li>
                <li className="flex items-center">
                  <Image 
                    src="/assets/flags/de.webp" 
                    alt="German" 
                    width={24} 
                    height={16} 
                    className="rounded-sm mr-2"
                  />
                  <span>German (Deutsch)</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-3 text-white">Recently Updated</h3>
              <p className="text-gray-300 mb-4">
                Languages with recent translation contributions:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Image 
                    src="/assets/flags/tr.webp" 
                    alt="Turkish" 
                    width={24} 
                    height={16} 
                    className="rounded-sm mr-2"
                  />
                  <span>Turkish (Türkçe) - 7% complete</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Translation Process */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400">How to Contribute Translations</h2>
          
          <ol className="space-y-8">
            <li className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 mt-1">
                <span className="text-emerald-400 font-bold">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Fork our repository</h3>
                <p className="text-gray-300 mb-3">
                  Start by forking our GitHub repository to create your own copy of the project.
                </p>
                <div className="bg-gray-900/70 p-4 rounded-md border border-gray-800/70 mb-3">
                  <code className="text-emerald-400">git clone https://github.com/yourusername/gvng.io.git</code>
                </div>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 mt-1">
                <span className="text-emerald-400 font-bold">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Locate translation files</h3>
                <p className="text-gray-300 mb-3">
                  Translation files are located in the <code className="bg-gray-900/70 px-2 py-1 rounded text-emerald-400">messages/[language-code]/common.json</code> directory.
                </p>
                <div className="bg-gray-900/70 p-4 rounded-md border border-gray-800/70 mb-3">
                  <code className="text-emerald-400">messages/en/common.json  # English translations<br/>
                  messages/tr/common.json  # Turkish translations<br/>
                  messages/es/common.json  # Spanish translations (create if needed)</code>
                </div>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 mt-1">
                <span className="text-emerald-400 font-bold">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Translate the strings</h3>
                <p className="text-gray-300 mb-3">
                  Copy the English file as a template and translate each string to your target language. Keep the JSON structure intact.
                </p>
                <div className="bg-gray-900/70 p-4 rounded-md border border-gray-800/70 mb-3 overflow-auto">
                  <pre className="text-sm text-emerald-400">
{`{
  "app": {
    "name": "gvng.io",
    "tagline": "Connect with friends and communities."
  },
  "navigation": {
    "home": "Home",
    "friends": "Friends",
    // ... more strings
  }
}`}
                  </pre>
                </div>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4 mt-1">
                <span className="text-emerald-400 font-bold">4</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Submit a pull request</h3>
                <p className="text-gray-300 mb-3">
                  Once you've completed your translations, commit your changes and submit a pull request to our main repository.
                </p>
                <div className="bg-gray-900/70 p-4 rounded-md border border-gray-800/70 mb-3">
                  <code className="text-emerald-400">
                    git add messages/your-language/common.json<br/>
                    git commit -m "Add [Language] translations"<br/>
                    git push origin main
                  </code>
                </div>
              </div>
            </li>
          </ol>
        </div>

        {/* Translation Guidelines */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400">Translation Guidelines</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold mb-3">General Rules</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Maintain the same tone and style as the original text</li>
                <li>Preserve formatting and special characters where appropriate</li>
                <li>Keep technical terms consistent throughout the translation</li>
                <li>Adapt idioms and expressions to the target language rather than translating them literally</li>
                <li>Consider cultural differences and adapt content accordingly</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-3">Technical Requirements</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Keep placeholders like <code className="bg-gray-900/70 px-2 py-0.5 rounded text-emerald-400">{'{name}'}</code> intact as they will be replaced with dynamic content</li>
                <li>Maintain the same JSON structure and keys as the English version</li>
                <li>Only translate the values, not the keys</li>
                <li>Test your translations by switching to your language in the app</li>
                <li>Ensure proper encoding (UTF-8) to support special characters</li>
              </ul>
            </div>
            
            <div className="bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
              <h3 className="text-xl font-bold mb-3 text-emerald-400">Pro Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-300">
                <li>Use the app in English first to understand the context of the strings</li>
                <li>Check existing translations in similar languages for reference</li>
                <li>When in doubt about meaning, ask in the community forum</li>
                <li>Focus on high-priority sections first (UI elements, common messages)</li>
                <li>Consider regional variations of your language if applicable</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Translation Tools */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-6 text-emerald-400">Translation Tools</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiCode className="mr-2 text-emerald-400" /> Translation Editor
              </h3>
              <p className="text-gray-300 mb-4">
                Our web-based translation editor makes it easy to contribute without needing to use Git directly.
              </p>
              <Link 
                href="/translations/editor"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition-colors"
              >
                Open Translation Editor <FiExternalLink className="ml-2" />
              </Link>
            </div>
            
            <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiDownload className="mr-2 text-emerald-400" /> Translation Templates
              </h3>
              <p className="text-gray-300 mb-4">
                Download template files to get started with translations for your language.
              </p>
              <Link 
                href="/translations/templates"
                className="inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-white transition-colors"
              >
                Download Templates <FiDownload className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 text-center border border-gray-700/30 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-white">Ready to Help Translate?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join our translation community and help make gvng.io accessible to gamers around the world.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="https://github.com/yourusername/gvng.io" 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 flex items-center justify-center shadow-lg shadow-emerald-600/20"
            >
              <FiGithub className="mr-2" /> Contribute on GitHub
            </Link>
            <Link 
              href="/translations" 
              className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-300 flex items-center justify-center border border-gray-600"
            >
              <FiGlobe className="mr-2" /> Translation Dashboard
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
