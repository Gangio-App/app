'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { FaSteam, FaGithub, FaFacebookF, FaGlobe } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';
import Image from 'next/image';

export default function LoginPage() {
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslations();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Assuming data is now { user: { ... }, token: "..." }
      if (data && data.user && data.token) {
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.setItem('authToken', data.token);
        console.log('[Login Page] currentUser stored:', data.user);
        console.log('[Login Page] authToken stored:', data.token);
      } else {
        // Handle cases where the response structure might not be as expected, or token/user is missing
        console.warn('[Login Page] Login response did not have expected structure (data.user and data.token). Data received:', data);
        // Attempt to store data directly if it's not the new structure, for backward compatibility or error analysis
        localStorage.setItem('currentUser', JSON.stringify(data)); 
        if (data && data.token) { // If token is at root and user is not nested
          localStorage.setItem('authToken', data.token);
        }
        // It's crucial to figure out why the structure is not as expected if this branch is hit.
      }
      
      // Show success state before redirecting
      setIsLoggedIn(true);
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (isLoggedIn) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mx-auto flex items-center justify-center mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl text-white font-bold mb-4"
          >
            {t('login.loginSuccessful')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-300"
          >
            {t('login.redirecting')}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Language options with flags
  const languageOptions = [
    { code: 'en', name: 'English', flag: '/assets/flags/us.webp' },
    { code: 'tr', name: 'Türkçe', flag: '/assets/flags/tr.webp' },
    { code: 'es', name: 'Español', flag: '/assets/flags/es.webp' },
    { code: 'fr', name: 'Français', flag: '/assets/flags/fr.webp' },
    { code: 'de', name: 'Deutsch', flag: '/assets/flags/de.webp' },
    { code: 'ja', name: '日本語', flag: '/assets/flags/jp.webp' }
  ];

  // Handle language change
  const handleLanguageChange = (langCode: "en" | "es" | "fr" | "de" | "ja" | "tr") => {
    setLocale(langCode);
    setIsLanguageDropdownOpen(false);
  };

  // Get current language data
  const currentLanguage = languageOptions.find(lang => lang.code === locale) || languageOptions[0];

  return (
    <div className="flex h-screen">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 to-gray-800 relative">
        {/* Language Selector - Top Right */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <button 
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700/80 px-3 py-2 rounded-lg border border-gray-700 transition-colors"
            >
              <Image 
                src={currentLanguage.flag} 
                alt={currentLanguage.name} 
                width={20} 
                height={15} 
                className="rounded-sm"
              />
              <span className="text-sm text-gray-300">{currentLanguage.name}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isLanguageDropdownOpen ? 'transform rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isLanguageDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code as "en" | "es" | "fr" | "de" | "ja" | "tr")}
                    className={`flex items-center w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors ${locale === lang.code ? 'bg-gray-700' : ''}`}
                  >
                    <Image 
                      src={lang.flag} 
                      alt={lang.name} 
                      width={20} 
                      height={15} 
                      className="rounded-sm mr-3"
                    />
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <motion.div
          className="max-w-md w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="mb-8 text-center"
            variants={itemVariants}
          >
            <motion.h1 
              className="text-4xl font-bold mb-2 text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {t('login.welcomeBack')}
            </motion.h1>
            <motion.p 
              className="text-gray-400"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('login.subtitle')}
            </motion.p>
          </motion.div>

          {error && (
            <motion.div 
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.div>
          )}

          <motion.form onSubmit={handleSubmit} className="space-y-5" variants={containerVariants}>
            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                {t('login.email')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <motion.input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800/50 text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="you@example.com"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </motion.div>

            <motion.div className="space-y-2" variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                {t('login.password')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <motion.input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800/50 text-white block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-500 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                    {t('login.rememberMe')}
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-500 hover:text-emerald-400 transition-colors">
                    {t('login.forgotPassword')}
                  </a>
                </div>
              </div>
            </motion.div>

            <motion.div className="pt-2" variants={itemVariants}>
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                {isLoading ? t('login.loggingIn') : t('login.signIn')}
              </motion.button>
            </motion.div>
            
            <motion.div 
              className="mt-8 text-center text-gray-400"
              variants={itemVariants}
            >
              {t('login.orSignInWith')}
            </motion.div>
            
            {/* Social Login Buttons */}
            <div className="space-y-3 mt-6">
              {/* Steam Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <button
                  onClick={() => signIn('steam', { callbackUrl: '/' })}
                  className="flex items-center justify-center w-full py-3 px-4 bg-[#171a21] hover:bg-[#2a475e] text-white rounded-lg transition-colors duration-200"
                >
                  <FaSteam className="w-5 h-5 mr-3" />
                  {t('login.signInWithSteam')}
                </button>
              </motion.div>
              
              {/* Google Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={() => signIn('google', { callbackUrl: '/' })}
                  className="flex items-center justify-center w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg transition-colors duration-200"
                >
                  <FcGoogle className="w-5 h-5 mr-3" />
                  {t('login.signInWithGoogle')}
                </button>
              </motion.div>
              
              {/* GitHub Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <button
                  onClick={() => signIn('github', { callbackUrl: '/' })}
                  className="flex items-center justify-center w-full py-3 px-4 bg-[#24292e] hover:bg-[#1b1f23] text-white rounded-lg transition-colors duration-200"
                >
                  <FaGithub className="w-5 h-5 mr-3" />
                  {t('login.signInWithGithub')}
                </button>
              </motion.div>
              
              {/* Facebook Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <button
                  onClick={() => signIn('facebook', { callbackUrl: '/' })}
                  className="flex items-center justify-center w-full py-3 px-4 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg transition-colors duration-200"
                >
                  <FaFacebookF className="w-5 h-5 mr-3" />
                  {t('login.signInWithFacebook')}
                </button>
              </motion.div>
            </div>
          </motion.form>

          <motion.div 
            className="mt-8 text-center text-sm text-gray-400"
            variants={itemVariants}
          >
            {t('login.noAccount')}{' '}
            <Link href="/signup" className="text-emerald-500 hover:text-emerald-400 transition-colors font-medium hover:underline">
              {t('login.signUp')}
            </Link>
          </motion.div>
          
        </motion.div>
      </div>

      {/* Right side - Illustration */}
      <motion.div 
        className="hidden md:block md:w-1/2 bg-gray-900 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mix-blend-overlay z-10"></div>
          <img 
            src="/assets/gangio-login.jpg" 
            alt="Background" 
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent z-20"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-md text-center"
          >
            <motion.h2 
              className="text-3xl md:text-4xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {t('login.welcomeBack')}
            </motion.h2>
            
            <motion.p 
              className="text-gray-300 mb-8 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {t('login.welcomeMessage')}
            </motion.p>
            
            <motion.div 
              className="flex justify-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              {[1, 2, 3, 4].map((i) => (
                <motion.div 
                  key={i}
                  className={`h-1.5 rounded-full ${i === 2 ? 'w-8 bg-emerald-500' : 'w-2 bg-emerald-500/50'}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.3 + (i * 0.1), duration: 0.4 }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
        
        {/* Animated elements */}
        <motion.div 
          className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        
        <motion.div 
          className="absolute top-1/2 -right-32 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1 
          }}
        />
        
        <motion.div 
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ 
            duration: 7, 
            repeat: Infinity,
            repeatType: "reverse",
            delay: 2
          }}
        />
        {/* Photo credit */}
        <motion.div
          className="absolute bottom-4 right-4 text-xs text-gray-400/70 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          {t('login.photoCredit')}{' '}
          <a 
            href="https://unsplash.com/@nemo765" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            nemo
          </a>
          {' '}{t('login.on')}{' '}
          <a 
            href="https://unsplash.com/photos/a-close-up-of-a-bunch-of-different-shapes-ZTfbbcBIsUg" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-emerald-400 transition-colors"
          >
            Unsplash
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
} 