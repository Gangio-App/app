'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import { FiArrowRight, FiGlobe, FiCode, FiGithub, FiFileText, FiCheck } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

// Define language code type for type safety
type LanguageCode = 'en' | 'tr' | 'es' | 'fr' | 'de' | 'ja' | 'ru';

// Supported languages with their codes, names, and completion percentages
const SUPPORTED_LANGUAGES = [
  { code: 'en' as LanguageCode, name: 'English', completion: '100%', completionValue: 100, flag: '/assets/flags/us.webp' },
  { code: 'tr' as LanguageCode, name: 'Türkçe', completion: '45%', completionValue: 45, flag: '/assets/flags/tr.webp' },
  { code: 'ru' as LanguageCode, name: 'Русский', completion: '40%', completionValue: 40, flag: '/assets/flags/ru.webp' },
  { code: 'es' as LanguageCode, name: 'Español', completion: '35%', completionValue: 35, flag: '/assets/flags/es.webp' },
  { code: 'de' as LanguageCode, name: 'Deutsch', completion: '32%', completionValue: 32, flag: '/assets/flags/de.webp' },
  { code: 'fr' as LanguageCode, name: 'Français', completion: '30%', completionValue: 30, flag: '/assets/flags/fr.webp' },
  { code: 'ja' as LanguageCode, name: '日本語', completion: '25%', completionValue: 25, flag: '/assets/flags/jp.webp' }
];



export default function TranslationsPage() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslations();
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>((locale as LanguageCode) || 'en');
  const [isHovering, setIsHovering] = useState('');
  
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
  
  const floatingAnimation = {
    y: [-10, 10],
    transition: {
      y: {
        duration: 2,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut'
      }
    }
  };

  return (
    <PageLayout showBackground={true}>
      <div className="relative">
        {/* Advanced background effects - matching landing page */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-soft-light"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow-delayed"></div>
        <div className="absolute top-3/4 left-1/3 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse-slow-more-delayed"></div>
        
        {/* Mesh grid effect */}
        <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-repeat opacity-[0.03]"></div>
        
        {/* Subtle animated particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5,
                animation: `float ${5 + Math.random() * 10}s linear infinite`
              }}
            ></div>
          ))}
        </div>
        
        {/* Hero Section - Glassmorphic Design matching landing page */}
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 z-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6 flex justify-center w-full"
          >
            <div className="relative inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-md border border-white/10 shadow-lg">
              <FiGlobe className="text-emerald-400 mr-2" />
              <span className="text-white/90 font-medium text-sm">Multilingual Support</span>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur opacity-50 -z-10"></div>
            </div>
          </motion.div>

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
            {/* Glassmorphic container for title */}
            <div className="relative inline-block">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl mb-8">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
                  variants={fadeInUp}
                >
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                    {t('translations.title') || "Help Us Translate"}
                  </span>
                </motion.h1>
                
                <motion.p 
                  className="text-xl text-gray-300/90 mb-4 max-w-3xl mx-auto font-light"
                  variants={fadeInUp}
                >
                  {t('translations.subtitle') || "Join our community effort to make gvng.io accessible to gamers around the world. Your contributions will help us reach more players in their native languages."}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Language Progress Section */}
          <motion.div
            className="mb-16"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Glassmorphic container for section title */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl text-center">
                <h2 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                    {t('translations.progress') || "Translation Progress"}
                  </span>
                </h2>
              </div>
            </div>
            
            {/* Language Translation Level Overview - Glassmorphic */}
            <div className="relative mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 text-center text-white">
                  {locale === 'tr' ? 'Çeviri Tamamlanma Oranları' : 'Translation Completion Rates'}
                </h3>
                <div className="flex flex-wrap items-end justify-center gap-6 mb-8">
                  {SUPPORTED_LANGUAGES.map((language) => (
                    <div key={`bar-${language.code}`} className="flex flex-col items-center group">
                      <div className="flex flex-col items-center justify-end h-32 mb-2 relative">
                        {/* Glow effect for selected language */}
                        {language.code === selectedLanguage && (
                          <div className="absolute -inset-1 bg-emerald-500/30 rounded-t-md blur-md opacity-70 -z-10"></div>
                        )}
                        <div 
                          className={`w-14 rounded-t-md ${language.code === selectedLanguage ? 'bg-emerald-500' : 'bg-emerald-500/60'} group-hover:bg-emerald-400 transition-all duration-300`}
                          style={{ height: `${Math.max(language.completionValue, 3)}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="relative p-1 bg-gray-800/80 rounded-md border border-white/10 mb-1">
                          <Image 
                            src={language.flag} 
                            alt={language.name} 
                            width={28} 
                            height={20} 
                            className="rounded-sm"
                          />
                        </div>
                        <span className="text-xs text-emerald-400 font-bold">{language.completion}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-300/80 text-center">
                  {locale === 'tr' ? 'Daha fazla çeviri eklemek için aşağıdaki dilleri seçin.' : 'Select languages below to add more translations.'}
                </p>
              </div>
            </div>
            
            {/* Language Cards - Glassmorphic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SUPPORTED_LANGUAGES.map((language) => (
                <motion.div
                  key={language.code}
                  variants={fadeInUp}
                  className="group"
                >
                  <div className="relative h-full">
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-all duration-300 -z-10"></div>
                    
                    {/* Card content */}
                    <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-2xl h-full flex flex-col">
                      <div className="flex items-center mb-4">
                        <div className="mr-4 relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-md blur-sm opacity-70 -z-10"></div>
                          <div className="relative bg-gray-800/80 p-1 rounded-md border border-white/10">
                            <Image 
                              src={language.flag} 
                              alt={language.name} 
                              width={48} 
                              height={32} 
                              className="rounded-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{language.name}</h3>
                          <p className="text-gray-400 text-sm">Language Code: {language.code}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-300">Completion:</span>
                          <span className="text-sm font-medium text-emerald-400">{language.completion}</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full" 
                            style={{ width: `${Math.max(language.completionValue, 3)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-auto">
                        <div className="relative group/button">
                          <div className={`absolute -inset-0.5 rounded-lg blur opacity-75 group-hover/button:opacity-100 transition duration-500 ${language.code === locale ? 'bg-emerald-500/50' : 'bg-gray-600/50'}`}></div>
                          <button
                            onClick={() => setLocale(language.code as "en" | "tr" | "es" | "fr" | "de" | "ja" | "ru")}
                            className={`relative px-4 py-2 rounded-lg transition-all duration-300 z-10 ${language.code === locale ? 'bg-gray-900 text-emerald-400' : 'bg-gray-900 text-gray-300 hover:text-white'}`}
                          >
                            {language.code === locale ? (
                              <span className="flex items-center">
                                <FiCheck className="mr-1" /> Active
                              </span>
                            ) : (
                              'Switch to'
                            )}
                          </button>
                        </div>
                        
                        <Link 
                          href={`https://github.com/Gangio-App/translations/tree/main/${language.code}`}
                          target="_blank"
                          className="text-emerald-400 hover:text-emerald-300 flex items-center transition-colors duration-300"
                        >
                          <FiGithub className="mr-1" />
                          <span>View on GitHub</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Translation Guide - Glassmorphic Design */}
          <motion.div
            className="mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Glassmorphic container for section title */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-2xl text-center">
                <h2 className="text-3xl font-bold">
                  <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    {t('translations.howToContribute') || "How to Contribute"}
                  </span>
                </h2>
              </div>
            </div>
            
            {/* Glassmorphic container for content */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl">
                <ol className="space-y-8">
                  <motion.li className="flex items-start" variants={fadeInUp}>
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur-sm opacity-70"></div>
                      <div className="relative w-full h-full bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-emerald-500/30">
                        <span className="text-emerald-400 font-bold">1</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold mb-3 text-white">{t('translations.steps.fork') || "Fork our repository"}</h3>
                      <p className="text-gray-300/90 mb-3">
                        Start by forking our GitHub repository to create your own copy of the project.
                      </p>
                      <div className="relative">
                        <div className="absolute -inset-1 bg-emerald-500/10 rounded-md blur-sm opacity-70 -z-10"></div>
                        <div className="relative bg-gray-900/70 p-4 rounded-md border border-emerald-500/20 mb-2 overflow-hidden">
                          <code className="text-emerald-400 font-mono">git clone https://github.com/Gangio-App/translations.git</code>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                  
                  <motion.li className="flex items-start" variants={fadeInUp}>
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <div className="absolute -inset-1 bg-blue-500/30 rounded-full blur-sm opacity-70"></div>
                      <div className="relative w-full h-full bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-500/30">
                        <span className="text-blue-400 font-bold">2</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold mb-3 text-white">{t('translations.steps.locate') || "Locate translation files"}</h3>
                      <p className="text-gray-300/90 mb-3">
                        Translation files are located in the <code className="bg-gray-900/70 px-2 py-1 rounded text-blue-400 font-mono">messages/[language-code]/common.json</code> directory.
                      </p>
                      <div className="relative">
                        <div className="absolute -inset-1 bg-blue-500/10 rounded-md blur-sm opacity-70 -z-10"></div>
                        <div className="relative bg-gray-900/70 p-4 rounded-md border border-blue-500/20 mb-2 overflow-hidden">
                          <code className="text-blue-400 font-mono">messages/en/common.json  # English translations<br/>
                          messages/tr/common.json  # Turkish translations<br/>
                          messages/es/common.json  # Spanish translations (create if needed)</code>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                  
                  <motion.li className="flex items-start" variants={fadeInUp}>
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <div className="absolute -inset-1 bg-purple-500/30 rounded-full blur-sm opacity-70"></div>
                      <div className="relative w-full h-full bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-purple-500/30">
                        <span className="text-purple-400 font-bold">3</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold mb-3 text-white">{t('translations.steps.translate') || "Translate the strings"}</h3>
                      <p className="text-gray-300/90 mb-3">
                        Copy the English file as a template and translate each string to your target language. Keep the JSON structure intact.
                      </p>
                      <div className="relative">
                        <div className="absolute -inset-1 bg-purple-500/10 rounded-md blur-sm opacity-70 -z-10"></div>
                        <div className="relative bg-gray-900/70 p-4 rounded-md border border-purple-500/20 mb-2 overflow-auto">
                          <pre className="text-sm text-purple-400 font-mono">
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
}`}</pre>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                  
                  <motion.li className="flex items-start" variants={fadeInUp}>
                    <div className="flex-shrink-0 w-10 h-10 relative">
                      <div className="absolute -inset-1 bg-teal-500/30 rounded-full blur-sm opacity-70"></div>
                      <div className="relative w-full h-full bg-gray-900/70 backdrop-blur-sm rounded-full flex items-center justify-center border border-teal-500/30">
                        <span className="text-teal-400 font-bold">4</span>
                      </div>
                    </div>
                    <div className="ml-6">
                      <h3 className="text-xl font-bold mb-3 text-white">{t('translations.steps.submit') || "Submit a pull request"}</h3>
                      <p className="text-gray-300/90 mb-3">
                        Once you've translated the strings, commit your changes and submit a pull request to our main repository.
                      </p>
                      <div className="relative">
                        <div className="absolute -inset-1 bg-teal-500/10 rounded-md blur-sm opacity-70 -z-10"></div>
                        <div className="relative bg-gray-900/70 p-4 rounded-md border border-teal-500/20 mb-2 overflow-hidden">
                          <code className="text-teal-400 font-mono">git add .<br/>
                          git commit -m "Add [language] translation"<br/>
                          git push origin main</code>
                        </div>
                      </div>
                      <p className="text-gray-300/90 mb-2">
                        Then create a pull request on GitHub and we'll review your translation.
                      </p>
                    </div>
                  </motion.li>
                </ol>
                
                <div className="mt-10 relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-teal-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
                  <div className="relative bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold mb-4 text-white">Important Notes:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-300/90">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <FiCheck className="text-emerald-400" />
                        </div>
                        <span>{t('translations.notes.placeholders') || "Keep placeholders like {name} intact - they will be replaced dynamically"}</span>
                      </li>
                      <li className="flex items-center text-gray-300/90">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <FiCheck className="text-emerald-400" />
                        </div>
                        <span>{t('translations.notes.structure') || "Maintain the same JSON structure and keys as the English file"}</span>
                      </li>
                      <li className="flex items-center text-gray-300/90">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <FiCheck className="text-emerald-400" />
                        </div>
                        <span>{t('translations.notes.keysOnly') || "Only translate the values, not the keys themselves"}</span>
                      </li>
                      <li className="flex items-center text-gray-300/90">
                        <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                          <FiCheck className="text-emerald-400" />
                        </div>
                        <span>{t('translations.notes.test') || "Test your translations by switching the app language"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Translation File Example */}
          <motion.div
            className="mb-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                {t('translations.fileStructure') || "Translation File Structure"}
              </span>
            </h2>
            
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl">
              <div className="mb-6">
                <p className="text-gray-300 mb-4">
                  Our translation files use a simple JSON structure with nested keys. Here's an example of what you'll be translating:
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-md border border-gray-800/50 overflow-auto">
                <pre className="text-sm text-emerald-400">
{`{
  "app": {
    "name": "gvng.io",
    "tagline": "Connect with friends and communities."
  },
  "navigation": {
    "home": "Home",
    "friends": "Friends",
    "servers": "Servers",
    "messages": "Messages",
    "settings": "Settings",
    "logout": "Logout"
  },
  "settings": {
    "title": "Settings",
    "categories": {
      "userSettings": "USER SETTINGS",
      "appSettings": "APP SETTINGS",
      "info": "INFO"
    }
  },
  "dashboard": {
    "welcome": "Welcome",
    "welcomeBack": "Welcome Back, {name}!",
    "quickActions": "Quick Actions"
  }
}`}
                </pre>
              </div>
              
              <div className="mt-6">
                <p className="text-gray-300">
                  <strong className="text-emerald-400">Important notes:</strong>
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2 mt-2">
                  <li>{t('translations.notes.placeholders') || "Keep placeholders like"} <code className="bg-gray-900/50 px-2 py-0.5 rounded text-emerald-400">{'{name}'}</code> {locale === 'tr' ? "olduğu gibi bırakın" : "intact as they will be replaced with dynamic content."}</li>
                  <li>{t('translations.notes.structure') || "Maintain the same JSON structure and keys as the English version."}</li>
                  <li>{t('translations.notes.keysOnly') || "Only translate the values, not the keys."}</li>
                  <li>{t('translations.notes.test') || "Test your translations by switching to your language in the app."}</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            className="text-center"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Link 
              href="https://github.com/Gangio-App" 
              target="_blank"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 shadow-lg shadow-emerald-600/20 group"
            >
              <FiGithub className="mr-2 text-lg" />
              {t('translations.startContributing') || "Start Contributing"}
              <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>
    </PageLayout>
  );
}
