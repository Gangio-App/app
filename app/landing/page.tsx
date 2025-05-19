'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import { FiArrowRight, FiUsers, FiMessageSquare, FiHeadphones, FiShield, FiGlobe } from 'react-icons/fi';
import { BiGame, BiJoystick, BiWorld, BiRocket } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

// Language data for welcome messages
const languageWelcomes: Record<string, string> = {
  en: "Welcome",
  tr: "Hoş Geldiniz",
  es: "Bienvenido",
  fr: "Bienvenue",
  de: "Willkommen",
  ja: "ようこそ",
  ru: "Добро пожаловать"
};

// Supported languages with their codes, names, and completion percentages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (100%)', flag: '/assets/flags/us.webp' },
  { code: 'tr', name: 'Türkçe (45%)', flag: '/assets/flags/tr.webp' },
  { code: 'ru', name: 'Русский (40%)', flag: '/assets/flags/ru.webp' },
  { code: 'es', name: 'Español (35%)', flag: '/assets/flags/es.webp' },
  { code: 'de', name: 'Deutsch (32%)', flag: '/assets/flags/de.webp' },
  { code: 'fr', name: 'Français (30%)', flag: '/assets/flags/fr.webp' },
  { code: 'ja', name: '日本語 (25%)', flag: '/assets/flags/jp.webp' }
];

export default function LandingPage() {
  const router = useRouter();
  const [isHovering, setIsHovering] = useState('');
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslations();
  const [hoveredLanguage, setHoveredLanguage] = useState<string | null>(null);
  
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

  const featureItems = [
    {
      icon: FiMessageSquare,
      title: (t: Function) => t('landing.features.realTimeChat.title', "Real-Time Chat"),
      description: (t: Function) => t('landing.features.realTimeChat.description', "Experience lightning-fast messaging with our cutting-edge real-time communication infrastructure."),
      colors: { from: 'from-emerald-400', to: 'to-teal-400' }
    },
    {
      icon: FiUsers,
      title: (t: Function) => t('landing.features.serverCommunities.title', "Server Communities"),
      description: (t: Function) => t('landing.features.serverCommunities.description', "Create or join servers, organize channels, and build your community around shared interests."),
      colors: { from: 'from-blue-400', to: 'to-indigo-400' }
    },
    {
      icon: FiHeadphones,
      title: (t: Function) => t('landing.features.voiceChannels.title', "Crystal-Clear Voice"),
      description: (t: Function) => t('landing.features.voiceChannels.description', "High-quality, low-latency voice channels for seamless team communication and casual hangouts."),
      colors: { from: 'from-purple-400', to: 'to-pink-400' }
    },
    {
      icon: HiOutlineSparkles,
      isGifFeature: true,
      imageSrc: 'https://media.tenor.com/jPxY0GuCPoIAAAAi/turkey-tur.gif',
      title: (t: Function) => t('landing.features.gifSupport.title', "Express with GIFs!"),
      description: (t: Function) => t('landing.features.gifSupport.description', "Bring your chats to life! Easily search, preview, and send GIFs to make conversations more engaging and fun."),
      colors: { from: 'from-rose-400', to: 'to-red-400' }
    },
    {
      icon: BiGame,
      title: (t: Function) => t('landing.features.gamerFocused.title', "Gamer Focused"),
      description: (t: Function) => t('landing.features.gamerFocused.description', "Built by gamers, for gamers. Our platform is designed to meet the unique needs of the gaming community."),
      colors: { from: 'from-emerald-400', to: 'to-teal-400' }
    },
    {
      icon: FiShield,
      title: (t: Function) => t('landing.features.security.title', "Security & Privacy"),
      description: (t: Function) => t('landing.features.security.description', "We take your security and privacy seriously. Our platform is built with robust security measures to protect your data."),
      colors: { from: 'from-purple-400', to: 'to-pink-400' }
    }
  ];

  return (
    <PageLayout showBackground={true}>
      <div className="relative">

        {/* Hero Section - 2025 Glassmorphic Design */}
        <div className="relative min-h-screen overflow-hidden flex items-center">
          {/* Advanced background effects */}
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
          
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side of Hero - Glassmorphic Content */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, x: -50 },
                  visible: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="inline-block mb-6"
                >
                  <div className="relative inline-flex items-center px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-md border border-white/10 shadow-lg">
                    <IoGameControllerOutline className="text-emerald-400 mr-2" />
                    <span className="text-white/90 font-medium text-sm">{t('landing.hero.badge') || "Next-Gen Gaming Platform"}</span>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur opacity-50 -z-10"></div>
                  </div>
                </motion.div>
                
                <motion.div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 rounded-xl blur-lg opacity-70 -z-10"></div>
                  <div className="relative bg-gray-900/40 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-2xl mb-8">
                    <motion.h1 
                      className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight"
                      variants={fadeInUp}
                    >
                      <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                        {t('landing.hero.title') || "Level Up Your Gaming Experience"}
                      </span>
                    </motion.h1>
                    
                    <motion.p 
                      className="text-xl text-gray-300/90 mb-8 max-w-lg font-light"
                      variants={fadeInUp}
                    >
                      {t('landing.hero.subtitle') || "The next-generation gamer platform designed to connect, communicate, and conquer with your gaming friends."}
                    </motion.p>
                    
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-4"
                      variants={fadeInUp}
                    >
                      {/* Get Started Button */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-teal-500/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                        <Link 
                          href="/login" 
                          className="relative flex items-center justify-center px-6 py-4 bg-gray-900 text-white rounded-lg font-medium transition-all duration-300 group-hover:bg-gray-800 z-10"
                          onMouseEnter={() => setIsHovering('login')}
                          onMouseLeave={() => setIsHovering('')}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg"></div>
                          <span className="relative">Get Started</span>
                          <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                      </div>
                      
                      {/* Download Button */}
                      <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/50 to-indigo-500/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                        <Link 
                          href="/download" 
                          className="relative flex items-center justify-center px-6 py-4 bg-gray-900 text-white rounded-lg font-medium transition-all duration-300 group-hover:bg-gray-800 z-10 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg"></div>
                          <span className="relative flex items-center">
                            <span className="font-bold">{t('landing.hero.downloadNow') || "Download NOW"}</span> 
                            <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">v2.5.1</span>
                            <HiOutlineSparkles className="ml-2" />
                          </span>
                        </Link>
                      </div>
                      
                      {/* Learn More Button */}
                      <Link 
                        href="/about" 
                        className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-white/10 text-white rounded-lg font-medium hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center"
                      >
                        {t('landing.hero.learnMore') || "Learn More"}
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
                
                {/* Feature highlights */}
                <motion.div 
                  className="flex flex-wrap gap-4 mt-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  {[
                    { 
                      icon: <FiHeadphones className="text-emerald-400" />, 
                      text: t('landing.features.voiceChat.title') || "Crystal Clear Voice" 
                    },
                    { 
                      icon: <BiGame className="text-blue-400" />, 
                      text: t('landing.features.gameIntegration.title') || "Game Integration" 
                    },
                    { 
                      icon: <FiUsers className="text-purple-400" />, 
                      text: t('landing.features.community.title') || "Community Building" 
                    },
                    { 
                      icon: <FiShield className="text-teal-400" />, 
                      text: t('landing.features.security.title') || "Secure & Private" 
                    }
                  ].map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-2 bg-gray-800/30 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/5"
                    >
                      <span>{feature.icon}</span>
                      <span className="text-sm text-gray-300">{feature.text}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>
              
              {/* Right side of Hero - Gaming Bear Illustration with Glassmorphic Effect */}
              <motion.div
                className="hidden lg:flex justify-center items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
              >
                <div className="relative w-full max-w-lg">
                  {/* Glassmorphic container */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/30 via-blue-500/20 to-purple-500/30 rounded-2xl blur-lg opacity-70"></div>
                  <div className="relative bg-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl overflow-hidden">
                    {/* Animated particles inside container */}
                    <div className="absolute inset-0 overflow-hidden">
                      {[...Array(15)].map((_, i) => (
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
                    
                    <motion.div
                      animate={floatingAnimation}
                      className="relative z-10"
                    >
                      <Image 
                        src="/assets/gangiobear-gaming.webp" 
                        alt="Gangio Bear Gaming" 
                        width={500} 
                        height={500} 
                        className="object-contain drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                      />
                    </motion.div>
                    
                    {/* Interactive elements */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                      {["emerald", "blue", "purple", "pink"].map((color, i) => (
                        <motion.div 
                          key={color}
                          className={`w-2 h-2 rounded-full bg-${color}-400 cursor-pointer hover:scale-150 transition-all duration-300`}
                          whileHover={{ scale: 1.5 }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Glowing effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl z-0"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Multilanguage Section */}
        <div className="relative py-24 overflow-hidden">
          {/* Advanced background effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-soft-light"></div>
          
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow-delayed"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse-slow-more-delayed"></div>
          
          {/* Mesh grid effect */}
          <div className="absolute inset-0 bg-[url('/assets/grid.svg')] bg-repeat opacity-[0.03]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="inline-block mb-4"
              >
                <div className="relative inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-md border border-white/10 shadow-lg">
                  <FiGlobe className="text-emerald-400 mr-2" />
                  <span className="text-white/90 font-medium">{t('landing.multilanguage.badge') || "Global Reach"}</span>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur opacity-50 -z-10"></div>
                </div>
              </motion.div>
              
              <h2 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                  {t('landing.multilanguage.title') || "Now It's Multilanguage"}
                </span>
              </h2>
              <p className="text-xl text-gray-300/90 max-w-3xl mx-auto font-light">
                {t('landing.multilanguage.subtitle') || "Connect with gamers from around the world in their native language."}
              </p>
            </motion.div>
            
            {/* Glassmorphic language selector container */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative mx-auto max-w-4xl mb-16"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-blue-500/20 to-purple-500/30 rounded-2xl blur-lg opacity-70"></div>
              <div className="relative bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl overflow-hidden">
                {/* Subtle animated particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(20)].map((_, i) => (
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
                
                <div className="relative z-10">
                  <div className="flex flex-wrap justify-center gap-8 mb-8">
                    {SUPPORTED_LANGUAGES.map((language) => (
                      <motion.div 
                        key={language.code}
                        className="relative group"
                        variants={fadeInUp}
                        onClick={() => setLocale(language.code as any)}
                        onMouseEnter={() => setHoveredLanguage(language.code)}
                        onMouseLeave={() => setHoveredLanguage(null)}
                      >
                        <div className={`
                          relative overflow-hidden rounded-xl cursor-pointer transition-all duration-500 transform group-hover:scale-105
                          ${locale === language.code ? 'ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/20' : 'ring-1 ring-white/10'}
                        `}>
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 group-hover:from-white/10 group-hover:to-white/0 transition-all duration-500"></div>
                          <Image 
                            src={language.flag} 
                            alt={language.name} 
                            width={80} 
                            height={60} 
                            className="rounded-xl shadow-lg object-cover"
                          />
                          
                          {/* Language completion indicator */}
                          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/80">
                            <div 
                              className={`h-full ${language.code === 'en' ? 'bg-emerald-500' : language.code === 'tr' ? 'bg-emerald-500/50' : 'bg-emerald-500/20'}`}
                              style={{ width: language.code === 'en' ? '100%' : language.code === 'tr' ? '7%' : '0%' }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Language name label */}
                        <div className="mt-2 text-center">
                          <span className={`text-sm font-medium ${locale === language.code ? 'text-emerald-400' : 'text-gray-400 group-hover:text-white/80'} transition-colors duration-300`}>
                            {language.code.toUpperCase()}
                          </span>
                        </div>
                        
                        {/* Modern tooltip */}
                        {hoveredLanguage === language.code && (
                          <motion.div
                            className="fixed -top-24 left-1/2 transform -translate-x-1/2 z-[50] pointer-events-none"
                            style={{
                              top: `${window.scrollY + 100}px`,
                              left: `${window.innerWidth / 2}px`
                            }}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="relative">
                              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-blue-500/30 rounded-xl blur-md"></div>
                              <div className="relative px-4 py-3 bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl whitespace-nowrap">
                                <div className="text-white font-medium text-sm mb-1">{language.name}</div>
                                <div className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent text-lg font-bold">
                                  {languageWelcomes[language.code]}
                                </div>
                              </div>
                              <div className="absolute left-1/2 -bottom-2 w-4 h-4 bg-gray-900/80 border-r border-b border-white/10 -translate-x-1/2 rotate-45 backdrop-blur-xl"></div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <div className="inline-block relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/50 to-blue-500/50 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                      <Link 
                        href="/translations" 
                        className="relative inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium transition-all duration-300 group-hover:bg-gray-800"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-lg"></div>
                        <FiGlobe className="mr-2 text-emerald-400" />
                        <span className="relative">{t('landing.multilanguage.helpTranslate') || "Help Us Translate"}</span>
                        <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Language stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-8 text-center"
            >
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">6</div>
                <div className="text-gray-400 text-sm">Languages</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">100%</div>
                <div className="text-gray-400 text-sm">English</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">7%</div>
                <div className="text-gray-400 text-sm">Turkish</div>
              </div>
              <div className="bg-gray-800/30 backdrop-blur-md rounded-xl p-4 border border-white/5 shadow-lg">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">4+</div>
                <div className="text-gray-400 text-sm">Coming Soon</div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="relative py-24">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {t('landing.features.title') || "Features Designed for Gamers"}
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {t('landing.features.subtitle') || "Everything you need to build your gaming community and dominate the competition."}
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {featureItems.map((item, index) => (
                <motion.div 
                  key={index} 
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                  variants={fadeInUp}
                >
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                    {item.isGifFeature ? (
                      <Image 
                        src={item.imageSrc} 
                        alt={item.title(t) || 'GIF Feature'}
                        width={80} 
                        height={60} 
                        className="rounded-md object-contain"
                        unoptimized={true} 
                      />
                    ) : (
                      <item.icon className="h-7 w-7 text-emerald-400" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">{item.title(t)}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description(t)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="relative py-24 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 md:p-12 border border-gray-700/50 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    {t('landing.callToAction.title') || "Ready to Level Up Your Gaming Experience?"}
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    {t('landing.callToAction.subtitle') || "Join thousands of gamers already using our platform to connect, communicate, and conquer together."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/signup" 
                      className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 text-center shadow-lg shadow-emerald-600/20 group flex items-center justify-center"
                    >
                      {t('landing.callToAction.createAccount') || "Create Your Account"}
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link 
                      href="/download" 
                      className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-md font-medium transition-all duration-300 text-center shadow-lg shadow-indigo-600/20 group flex items-center justify-center relative overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 transform -translate-x-full hover:translate-x-0 transition-transform duration-700"></span>
                      <span className="relative flex items-center">
                        <HiOutlineSparkles className="mr-2" />
                        <span className="font-bold">{t('landing.callToAction.downloadNow') || "Download NOW"}</span> <span className="ml-1 text-xs bg-white/20 px-1.5 py-0.5 rounded">v2.5.1</span>
                        <HiOutlineSparkles className="ml-2" />
                      </span>
                    </Link>
                    <Link 
                      href="/login" 
                      className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-md font-medium hover:bg-gray-700/50 transition-all duration-300 text-center"
                    >
                      {t('landing.callToAction.signIn') || "Sign In"}
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                  {/* Gangio Bear Illustration */}
                  <motion.div
                    animate={floatingAnimation}
                    className="relative z-10 flex justify-center"
                  >
                    <Image 
                      src="/assets/gangiobear-wymsical-forest-transparent.png" 
                      alt="Gangio Bear" 
                      width={400} 
                      height={400} 
                      className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    />
                  </motion.div>
                  
                  {/* Glowing effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl z-0"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
