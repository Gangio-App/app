'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaWindows, FaApple, FaLinux, FaAndroid, FaDownload, FaExternalLinkAlt, FaStore, FaTerminal, FaFileDownload, FaFileArchive, FaLock, FaUserPlus, FaSignInAlt, FaBell } from 'react-icons/fa';
import { SiIos, SiAppstore, SiGoogleplay, SiUbuntu, SiDebian, SiFedora, SiMacos } from 'react-icons/si';
import { IoClose, IoCheckmarkCircle, IoWarning, IoRocketOutline, IoFlashOutline, IoSparklesOutline } from 'react-icons/io5';
import { HiOutlineDesktopComputer, HiOutlineDeviceMobile, HiOutlineSparkles, HiOutlineCog, HiOutlineShieldCheck, HiOutlineGlobe } from 'react-icons/hi';
import { useTranslations } from '@/hooks/useTranslations';

interface DownloadOption {
  platform: string;
  icon: React.ElementType;
  description: string;
  version: string;
  size: string;
  link: string;
  instructions: string[];
}

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  platformType: 'desktop' | 'mobile';
  initialPlatform?: string;
}

export default function DownloadModal({ isOpen, onClose, platformType, initialPlatform }: DownloadModalProps) {
  const { t } = useTranslations();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformKey>(initialPlatform as PlatformKey || (platformType === 'desktop' ? 'Windows' : 'Android'));
  
  // Desktop download instructions
  const desktopOptions: DownloadOption[] = [
    {
      platform: 'Windows',
      icon: FaWindows,
      description: t('download.windows.description') || 'Windows 10/11 (64-bit)',
      version: 'v2.5.1',
      size: '85.2 MB',
      link: '#',
      instructions: [
        t('download.windows.instructions.1') || 'GANGIO yükleyicisini indirin (.exe)',
        t('download.windows.instructions.2') || 'Yükleyiciyi çalıştırın ve ekrandaki talimatları izleyin',
        t('download.windows.instructions.3') || 'Yüklendikten sonra, GANGIO uygulamasını masaüstünüzden veya başlat menüsünden başlatın',
        t('download.windows.instructions.4') || 'Hesabınızla giriş yapın veya yeni bir hesap oluşturun',
        t('download.windows.instructions.5') || 'Oyun topluluklarınızla bağlantı kurmaya başlayın!'
      ]
    },
    {
      platform: 'macOS',
      icon: FaApple,
      description: t('download.macos.description') || 'macOS 11.0+ (Apple Silicon & Intel)',
      version: 'v2.5.1',
      size: '92.7 MB',
      link: '#',
      instructions: [
        t('download.macos.instructions.1') || 'GANGIO disk imajını indirin (.dmg)',
        t('download.macos.instructions.2') || 'Disk imajını açın ve GANGIO uygulamasını Uygulamalar klasörüne sürükleyin',
        t('download.macos.instructions.3') || 'GANGIO uygulamasını Uygulamalar klasöründen başlatın',
        t('download.macos.instructions.4') || 'Güvenlik hakkında uyarı alırsanız, Sistem Tercihleri > Güvenlik ve Gizlilik bölümüne gidin ve GANGIO uygulamasına izin verin',
        t('download.macos.instructions.5') || 'Hesabınızla giriş yapın veya yeni bir hesap oluşturun'
      ]
    },
    {
      platform: 'Linux',
      icon: FaLinux,
      description: t('download.linux.description') || 'Ubuntu, Debian, Fedora ve daha fazlası',
      version: 'v2.5.1',
      size: '78.5 MB',
      link: '#',
      instructions: [
        t('download.linux.instructions.1') || 'Dağıtımınız için uygun paketi indirin (.deb, .rpm veya AppImage)',
        t('download.linux.instructions.2') || '.deb için: sudo dpkg -i gangio.deb komutunu çalıştırın',
        t('download.linux.instructions.3') || '.rpm için: sudo rpm -i gangio.rpm komutunu çalıştırın',
        t('download.linux.instructions.4') || 'AppImage için: chmod +x gangio.AppImage komutu ile çalıştırılabilir yapın ve çalıştırın',
        t('download.linux.instructions.5') || 'GANGIO uygulamasını başlatın ve hesabınızla giriş yapın'
      ]
    }
  ];

  // Mobile download instructions
  const mobileOptions: DownloadOption[] = [
    {
      platform: 'Android',
      icon: FaAndroid,
      description: t('download.android.description') || 'Android 8.0+',
      version: 'v2.3.5',
      size: '45.8 MB',
      link: '#',
      instructions: [
        t('download.android.instructions.1') || 'GANGIO uygulamasını Google Play Store\'dan indirin',
        t('download.android.instructions.2') || 'Yüklemeden sonra uygulamaıyı açın',
        t('download.android.instructions.3') || 'Hesabınızla giriş yapın veya yeni bir hesap oluşturun',
        t('download.android.instructions.4') || 'En iyi deneyim için bildirimlere izin verin',
        t('download.android.instructions.5') || 'Hareket halindeyken oyun topluluklarınızla sohbet etmeye başlayın!'
      ]
    },
    {
      platform: 'iOS',
      icon: SiIos,
      description: t('download.ios.description') || 'iPhone & iPad (iOS 14+)',
      version: 'v2.3.5',
      size: '52.3 MB',
      link: '#',
      instructions: [
        t('download.ios.instructions.1') || 'GANGIO uygulamasını App Store\'dan indirin',
        t('download.ios.instructions.2') || 'Yüklemeden sonra uygulamaıyı açın',
        t('download.ios.instructions.3') || 'Hesabınızla giriş yapın veya yeni bir hesap oluşturun',
        t('download.ios.instructions.4') || 'Sorulduğunda bildirimlere izin verin',
        t('download.ios.instructions.5') || 'iOS cihazınızda GANGIO\'nun keyfini çıkarın!'
      ]
    }
  ];

  const options = platformType === 'desktop' ? desktopOptions : mobileOptions;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: { 
        duration: 0.2
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Define platform style type
  type PlatformKey = 'Windows' | 'macOS' | 'Linux' | 'Android' | 'iOS';
  
  // Platform-specific gradients and colors
  const platformStyles: Record<PlatformKey, {
    gradient: string;
    border: string;
    highlight: string;
    textGradient: string;
    icon: React.ElementType;
    bgImage: string;
  }> = {
    Windows: {
      gradient: 'from-blue-600/20 to-indigo-600/20',
      border: 'border-blue-500/30',
      highlight: 'bg-blue-500',
      textGradient: 'from-blue-400 to-indigo-500',
      icon: FaWindows,
      bgImage: '/assets/gangiobear-gaming.png'
    },
    macOS: {
      gradient: 'from-gray-600/20 to-gray-700/20',
      border: 'border-gray-500/30',
      highlight: 'bg-gray-500',
      textGradient: 'from-gray-300 to-white',
      icon: FaApple,
      bgImage: '/assets/gangiobear-dashboard.png'
    },
    Linux: {
      gradient: 'from-orange-600/20 to-amber-600/20',
      border: 'border-orange-500/30',
      highlight: 'bg-orange-500',
      textGradient: 'from-orange-400 to-amber-500',
      icon: FaLinux,
      bgImage: '/assets/gangiobear-friends.png'
    },
    Android: {
      gradient: 'from-green-600/20 to-emerald-600/20',
      border: 'border-green-500/30',
      highlight: 'bg-green-500',
      textGradient: 'from-green-400 to-emerald-500',
      icon: FaAndroid,
      bgImage: '/assets/gangiobear-mobile.png'
    },
    iOS: {
      gradient: 'from-purple-600/20 to-pink-600/20',
      border: 'border-purple-500/30',
      highlight: 'bg-purple-500',
      textGradient: 'from-purple-400 to-pink-500',
      icon: SiIos,
      bgImage: '/assets/gangiobear-witch-transparent.png'
    }
  };

  // Get the current platform style
  const currentStyle = platformStyles[selectedPlatform] || platformStyles.Windows;
  
  // Get platform-specific icons for instructions
  const getInstructionIcons = (platform: string) => {
    switch(platform) {
      case 'Windows':
        return [FaFileDownload, FaFileArchive, HiOutlineDesktopComputer, FaSignInAlt, IoCheckmarkCircle];
      case 'macOS':
        return [FaFileDownload, SiMacos, FaStore, FaLock, FaSignInAlt];
      case 'Linux':
        return [FaFileDownload, FaTerminal, FaTerminal, FaFileArchive, FaSignInAlt];
      case 'Android':
        return [SiGoogleplay, HiOutlineDeviceMobile, FaSignInAlt, FaBell, IoCheckmarkCircle];
      case 'iOS':
        return [SiAppstore, HiOutlineDeviceMobile, FaSignInAlt, FaBell, IoCheckmarkCircle];
      default:
        return [FaFileDownload, FaFileArchive, HiOutlineDesktopComputer, FaSignInAlt, IoCheckmarkCircle];
    }
  };

  // Get current platform's instruction icons
  const instructionIcons = getInstructionIcons(selectedPlatform);

  // Find the current option based on selected platform
  const currentOption = options.find(option => option.platform === selectedPlatform) || options[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div 
              className={`bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border ${currentStyle.border} rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl shadow-black/50`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative elements */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              <div className="absolute top-20 -left-20 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"></div>
              <div className="absolute bottom-20 -right-20 w-40 h-40 rounded-full bg-blue-500/20 blur-3xl"></div>
              
              <div className="relative p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
                    <span className={`p-2 rounded-lg bg-gradient-to-br ${currentStyle.gradient} mr-3 flex items-center justify-center`}>
                      <currentStyle.icon className="text-white text-xl" />
                    </span>
                    <span>
                      <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">GANGIO</span> for <span className={`bg-gradient-to-r ${currentStyle.textGradient} bg-clip-text text-transparent`}>{selectedPlatform}</span>
                    </span>
                  </h2>
                  <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800/50 backdrop-blur-sm"
                  >
                    <IoClose className="text-2xl" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Platform selector - Left sidebar */}
                  <div className="lg:col-span-3">
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md p-4 rounded-xl border border-gray-700/30 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <HiOutlineDesktopComputer className="mr-2 text-emerald-400" />
                        <span>Platforms</span>
                      </h3>
                      
                      <div className="space-y-2">
                        {options.map((option) => (
                          <button
                            key={option.platform}
                            onClick={() => setSelectedPlatform(option.platform as PlatformKey)}
                            className={`w-full flex items-center p-3 rounded-lg transition-all duration-300 ${selectedPlatform === option.platform 
                              ? `bg-gradient-to-r ${platformStyles[option.platform as PlatformKey]?.gradient || ''} border ${platformStyles[option.platform as PlatformKey]?.border || ''} text-white` 
                              : 'bg-gray-800/50 border-gray-700/30 border text-gray-300 hover:bg-gray-700/50'}`}
                          >
                            <option.icon className={`text-lg mr-2 ${selectedPlatform === option.platform ? 'text-white' : 'text-gray-400'}`} />
                            <span>{option.platform}</span>
                            {selectedPlatform === option.platform && (
                              <IoCheckmarkCircle className="ml-auto text-white" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md p-4 rounded-xl border border-gray-700/30">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                        <HiOutlineSparkles className="mr-2 text-emerald-400" />
                        <span>Why Download?</span>
                      </h3>
                      <ul className="text-gray-300 space-y-3">
                        <li className="flex items-start">
                          <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mr-2 mt-0.5">
                            <IoFlashOutline className="text-sm" />
                          </span>
                          <span className="text-sm">Better performance and lower latency</span>
                        </li>
                        <li className="flex items-start">
                          <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mr-2 mt-0.5">
                            <FaBell className="text-sm" />
                          </span>
                          <span className="text-sm">Desktop notifications and system tray</span>
                        </li>
                        <li className="flex items-start">
                          <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mr-2 mt-0.5">
                            <IoRocketOutline className="text-sm" />
                          </span>
                          <span className="text-sm">Game overlay and activity detection</span>
                        </li>
                        <li className="flex items-start">
                          <span className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400 mr-2 mt-0.5">
                            <HiOutlineShieldCheck className="text-sm" />
                          </span>
                          <span className="text-sm">Enhanced security features</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Main content area - Right side */}
                  <div className="lg:col-span-9">
                    <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-md rounded-xl border border-gray-700/30 overflow-hidden">
                      {/* Platform header with image */}
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-black/70 z-10"></div>
                        <div className={`absolute inset-0 bg-gradient-to-r ${currentStyle.gradient} opacity-30 z-0`}></div>
                        <Image 
                          src={currentStyle.bgImage}
                          alt={`${selectedPlatform} preview`}
                          width={800}
                          height={400}
                          className="object-cover w-full h-full opacity-60"
                        />
                        <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                          <div className="flex items-center">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${currentStyle.gradient} mr-4`}>
                              <currentStyle.icon className="text-white text-2xl" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">{currentOption.platform}</h3>
                              <p className="text-gray-300">{currentOption.description}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Installation instructions */}
                      <div className="p-6">
                        <div className="mb-6">
                          <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <HiOutlineCog className="mr-2 text-emerald-400" />
                            <span>{t('download.installationGuide') || 'Kurulum Rehberi'}</span>
                          </h4>
                          
                          <div className="space-y-4">
                            {currentOption.instructions.map((instruction, idx) => (
                              <div 
                                key={idx}
                                className={`flex items-start p-4 rounded-lg bg-gradient-to-r ${idx % 2 === 0 ? 'from-gray-800/50 to-gray-900/50' : 'from-gray-900/50 to-gray-800/50'} border border-gray-700/30`}
                              >
                                <div className="flex-shrink-0">
                                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStyle.highlight} text-white font-bold mr-4`}>
                                    {idx + 1}
                                  </div>
                                </div>
                                <div className="flex-grow">
                                  <div className="flex items-center mb-1">
                                    <span className={`p-1.5 rounded-md bg-gradient-to-br ${currentStyle.gradient} mr-2`}>
                                      {React.createElement(instructionIcons[idx] || instructionIcons[0], { className: 'text-white text-sm' })}
                                    </span>
                                    <h5 className="font-semibold text-white">{instruction.split(':')[0] || 'Step ' + (idx + 1)}</h5>
                                  </div>
                                  <p className="text-gray-300 text-sm">{instruction.split(':')[1] || instruction}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-400 mb-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-300 mr-2">{t('download.version') || 'Sürüm:'}</span>
                            <span>{currentOption.version}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-300 mr-2">{t('download.size') || 'Boyut:'}</span>
                            <span>{currentOption.size}</span>
                          </div>
                        </div>
                        
                        <motion.a
                          href={currentOption.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full inline-block bg-gradient-to-r ${currentStyle.textGradient} text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 text-center group shadow-lg relative overflow-hidden`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.span 
                            className="absolute inset-0 bg-white/10"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: '100%' }}
                            transition={{ duration: 0.5 }}
                          />
                          <span className="flex items-center justify-center text-lg">
                            {t('download.downloadFor', { platform: currentOption.platform }) || `${currentOption.platform} için indir`}
                            <FaDownload className="ml-2 group-hover:translate-y-1 transition-transform duration-300" />
                          </span>
                        </motion.a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
