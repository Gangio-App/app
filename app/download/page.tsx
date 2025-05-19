'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import NavigationBar from '@/components/NavigationBar';
import ThreeBackground from '@/components/ui/ThreeBackground';
import Footer from '@/components/Footer';
import DownloadModal from '@/components/DownloadModal';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

// React Icons
import { FaWindows, FaApple, FaLinux, FaAndroid, FaDownload, FaGamepad, FaHeadset, FaRocket, FaShieldAlt, FaUsers } from 'react-icons/fa';
import { SiIos, SiSteam, SiDiscord, SiEpicgames, SiTwitch } from 'react-icons/si';
import { BiWorld, BiLaptop, BiMobile, BiDesktop } from 'react-icons/bi';
import { HiOutlineSparkles, HiOutlineGlobe, HiOutlineDeviceMobile, HiOutlineDesktopComputer, HiOutlineDownload } from 'react-icons/hi';
import { IoGameControllerOutline, IoRocketOutline, IoSparklesOutline, IoFlashOutline } from 'react-icons/io5';

export default function DownloadPage() {
  const { t } = useTranslations('downloadPage');
  const { locale } = useLanguage();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('desktop');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlatformType, setModalPlatformType] = useState<'desktop' | 'mobile'>('desktop');
  const [modalInitialPlatform, setModalInitialPlatform] = useState<string>('Windows');

  useEffect(() => {
    const userString = localStorage.getItem('currentUser');
    if (userString) {
      try {
        setCurrentUser(JSON.parse(userString));
      } catch (error) {
        console.error("Error parsing user from localStorage", error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    window.location.href = '/';
  };

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

  // Desktop download options
  const desktopOptions = [
    {
      platform: 'Windows',
      icon: FaWindows,
      description: t('download.platforms.windows.description'),
      version: 'v2.5.1',
      size: '85.2 MB',
      link: '#',
      image: '/assets/gangiobear-gaming.png',
      primary: true,
      requirements: t('download.platforms.windows.requirements')
    },
    {
      platform: 'macOS',
      icon: FaApple,
      description: t('download.platforms.macos.description'),
      version: 'v2.5.1',
      size: '92.7 MB',
      link: '#',
      image: '/assets/gangiobear-dashboard.png',
      primary: false,
      requirements: t('download.platforms.macos.requirements')
    },
    {
      platform: 'Linux',
      icon: FaLinux,
      description: t('download.platforms.linux.description'),
      version: 'v2.5.1',
      size: '78.5 MB',
      link: '#',
      image: '/assets/gangiobear-friends.png',
      primary: false,
      requirements: t('download.platforms.linux.requirements')
    }
  ];

  // Mobile download options
  const mobileOptions = [
    {
      platform: 'Android',
      icon: FaAndroid,
      description: t('download.platforms.android.description'),
      version: 'v2.3.5',
      size: '45.8 MB',
      link: '#',
      image: '/assets/gangiobear-mobile.png',
      primary: true,
      requirements: t('download.platforms.android.requirements')
    },
    {
      platform: 'iOS',
      icon: SiIos,
      description: t('download.platforms.ios.description'),
      version: 'v2.3.5',
      size: '52.3 MB',
      link: '#',
      image: '/assets/gangiobear-witch-transparent.png',
      primary: false,
      requirements: t('download.platforms.ios.requirements')
    }
  ];

  // Web app option
  const webOption = {
    platform: t('download.platforms.web.name'),
    icon: HiOutlineGlobe,
    description: t('download.platforms.web.description'),
    version: t('download.platforms.web.version'),
    size: t('download.platforms.web.size'),
    link: '/',
    image: '/assets/gangiobear-wymsical-forest-transparent.png',
    primary: true,
    requirements: t('download.platforms.web.requirements')
  };

  // Features list
  const features = [
    { name: t('download.features.voiceChat.title'), icon: FaHeadset, description: t('download.features.voiceChat.description') },
    { name: t('download.features.gameIntegration.title'), icon: FaGamepad, description: t('download.features.gameIntegration.description') },
    { name: t('download.features.community.title'), icon: FaUsers, description: t('download.features.community.description') },
    { name: t('download.features.security.title'), icon: FaShieldAlt, description: t('download.features.security.description') },
    { name: t('download.features.performance.title'), icon: FaRocket, description: t('download.features.performance.description') },
    { name: t('download.features.crossPlatform.title'), icon: BiWorld, description: t('download.features.crossPlatform.description') }
  ];

  const getPlatformOptions = () => {
    switch(selectedPlatform) {
      case 'desktop': return desktopOptions;
      case 'mobile': return mobileOptions;
      case 'web': return [webOption];
      default: return desktopOptions;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavigationBar currentUser={currentUser} onLogout={handleLogout} />
      <div className="pt-20"> {/* Padding for fixed navbar */}
        <ThreeBackground preset="landing" />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] pointer-events-none"></div>
        
        {/* Download Modal */}
        <DownloadModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          platformType={modalPlatformType}
          initialPlatform={modalInitialPlatform}
        />
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <div className="inline-block p-2 px-4 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
                <div className="flex items-center space-x-2">
                  <FaDownload className="text-emerald-400" />
                  <span className="text-emerald-300 font-medium">{t('download.officialDownloads')}</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                {t('download.title.first')} <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">GANGIO</span> {t('download.title.second')}
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {t('download.subtitle')}
              </p>
              
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div 
                    className="absolute -top-12 -right-12 w-24 h-24 opacity-70"
                    animate={floatingAnimation}
                  >
                    <Image 
                      src="/assets/gangiobear-wymsical-forest-transparent.png" 
                      alt="GANGIO Bear" 
                      width={100} 
                      height={100} 
                      className="object-contain"
                    />
                  </motion.div>
                  <motion.button
                    onClick={() => {
                      setModalPlatformType('desktop');
                      setModalInitialPlatform('Windows');
                      setIsModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 relative overflow-hidden group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                    <motion.span 
                      className="absolute inset-0 flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <HiOutlineSparkles className="text-xl text-white/70 absolute top-1 left-6" />
                      <HiOutlineSparkles className="text-sm text-white/70 absolute bottom-1 right-6" />
                    </motion.span>
                    <span className="flex items-center justify-center relative z-10">
                      {t('download.downloadNow')}
                      <HiOutlineDownload className="ml-2 text-xl" />
                    </span>
                  </motion.button>
                  <motion.div 
                    className="absolute -bottom-8 -left-12 w-20 h-20 opacity-70"
                    animate={floatingAnimation}
                  >
                    <Image 
                      src="/assets/gangiobear-witch-transparent.png" 
                      alt="GANGIO Witch" 
                      width={80} 
                      height={80} 
                      className="object-contain"
                    />
                  </motion.div>
                </div>
              </div>
              
              {/* Platform selector */}
              <div className="flex justify-center mb-12 space-x-4 flex-wrap">
                <button 
                  onClick={() => setSelectedPlatform('desktop')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${selectedPlatform === 'desktop' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <BiDesktop className="text-xl" />
                  <span>{t('download.platformTypes.desktop')}</span>
                </button>
                
                <button 
                  onClick={() => setSelectedPlatform('mobile')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${selectedPlatform === 'mobile' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <BiMobile className="text-xl" />
                  <span>{t('download.platformTypes.mobile')}</span>
                </button>
                
                <button 
                  onClick={() => setSelectedPlatform('web')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${selectedPlatform === 'web' ? 'bg-emerald-500 text-white' : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'}`}
                >
                  <BiWorld className="text-xl" />
                  <span>{t('download.platformTypes.web')}</span>
                </button>
              </div>
            </motion.div>

            {/* Download Options */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
              variants={staggerContainer}
            >
              {getPlatformOptions().map((option) => (
                <motion.div
                  key={option.platform}
                  className={`bg-gradient-to-br ${option.primary ? 'from-gray-800/90 to-gray-900/90 border-emerald-500/30' : 'from-gray-800/70 to-gray-900/70 border-gray-700/50'} backdrop-blur-md p-8 rounded-xl border shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col h-full`}
                  whileHover={{ y: -5, scale: 1.02 }}
                  variants={fadeInUp}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <option.icon className={`text-3xl ${option.primary ? 'text-emerald-400' : 'text-gray-400'} mr-3`} />
                      <h3 className="text-2xl font-bold">{option.platform}</h3>
                    </div>
                    {option.primary && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs font-medium px-2.5 py-1 rounded-full border border-emerald-500/30">
                        {t('download.recommended')}
                      </span>
                    )}
                  </div>
                  
                  <div className="relative h-48 mb-6 overflow-hidden rounded-lg">
                    <Image 
                      src={option.image} 
                      alt={`${option.platform} preview`} 
                      width={400} 
                      height={300}
                      className="object-contain w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent"></div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-300 mb-4">{option.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-400 mb-4">
                      <div>
                        <span className="block text-gray-500">{t('download.version')}</span>
                        <span>{option.version}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">{t('download.size')}</span>
                        <span>{option.size}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mb-6">
                      <span className="block font-medium text-gray-400 mb-1">{t('download.systemRequirements')}:</span>
                      <p>{option.requirements}</p>
                    </div>
                  </div>
                  
                  {option.platform === 'Web App' ? (
                    <a
                      href={option.link}
                      target="_self"
                      rel="noopener noreferrer"
                      className={`mt-auto w-full inline-block bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center group`}
                    >
                      <span className="flex items-center justify-center">
                        {t('download.launchWebApp')}
                        <IoRocketOutline className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </a>
                  ) : (
                    <motion.button
                      onClick={() => {
                        setModalPlatformType(selectedPlatform === 'desktop' ? 'desktop' : 'mobile');
                        setModalInitialPlatform(option.platform);
                        setIsModalOpen(true);
                      }}
                      className={`mt-auto w-full inline-block ${option.primary ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500' : 'bg-gray-700 hover:bg-gray-600'} text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center group relative overflow-hidden`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <motion.span 
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.span 
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                      >
                        <IoSparklesOutline className="text-lg text-white/70 absolute top-1 left-10" />
                        <IoSparklesOutline className="text-sm text-white/70 absolute bottom-1 right-10" />
                      </motion.span>
                      <span className="flex items-center justify-center relative z-10">
                        {t('download.download')}
                        <FaDownload className="ml-2 group-hover:translate-y-1 transition-transform duration-300" />
                      </span>
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Features Section */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-3xl font-bold mb-10 text-center">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  {t('download.featuresTitle.first')}
                </span>
                <span className="text-white"> {t('download.featuresTitle.second')}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300 group"
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                  >
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors duration-300">
                      <feature.icon className="text-2xl text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors duration-300">{feature.name}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Gaming Platforms Integration */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">{t('download.integrationsTitle')}</h2>
              
              <div className="flex flex-wrap justify-center gap-8">
                <div className="flex items-center space-x-8">
                  <SiSteam className="text-4xl text-gray-400 hover:text-white transition-colors duration-300" />
                  <SiEpicgames className="text-4xl text-gray-400 hover:text-white transition-colors duration-300" />
                  <SiDiscord className="text-4xl text-gray-400 hover:text-white transition-colors duration-300" />
                  <SiTwitch className="text-4xl text-gray-400 hover:text-white transition-colors duration-300" />
                  <IoGameControllerOutline className="text-4xl text-gray-400 hover:text-white transition-colors duration-300" />
                </div>
              </div>
            </motion.div>

            {/* FAQ Section */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-2xl font-bold mb-8 text-center">{t('download.faqTitle')}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-300">{t('download.faq.free.question')}</h3>
                  <p className="text-gray-300">{t('download.faq.free.answer')}</p>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-300">{t('download.faq.multipleDevices.question')}</h3>
                  <p className="text-gray-300">{t('download.faq.multipleDevices.answer')}</p>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-300">{t('download.faq.security.question')}</h3>
                  <p className="text-gray-300">{t('download.faq.security.answer')}</p>
                </div>
                
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-3 text-emerald-300">{t('download.faq.updates.question')}</h3>
                  <p className="text-gray-300">{t('download.faq.updates.answer')}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}