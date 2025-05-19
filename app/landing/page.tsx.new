'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ThreeBackground from '@/components/ui/ThreeBackground';
import NavigationBar from '@/components/NavigationBar';
import { FiArrowRight, FiUsers, FiMessageSquare, FiHeadphones, FiShield } from 'react-icons/fi';
import { BiGame, BiJoystick, BiWorld, BiRocket } from 'react-icons/bi';
import { IoGameControllerOutline } from 'react-icons/io5';
import { HiOutlineSparkles } from 'react-icons/hi';

export default function LandingPage() {
  const router = useRouter();
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white overflow-hidden">
      {/* Navigation */}
      <NavigationBar currentUser={null} />
      
      {/* Main Content */}
      <div className="pt-20 relative">
        {/* Animated background */}
        <ThreeBackground preset="landing" />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] pointer-events-none"></div>

        {/* Hero Section */}
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side of Hero */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, x: -50 },
                visible: { opacity: 1, x: 0 }
              }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1 
                className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
                variants={fadeInUp}
              >
                <span className="block">Where Gamers</span>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                  Unite & Conquer
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-300 mb-8 max-w-lg"
                variants={fadeInUp}
              >
                Connect with fellow gamers, build your squad, and dominate together. Voice chat, screen sharing, and epic gaming moments all in one place.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                variants={fadeInUp}
              >
                <Link 
                  href="/login" 
                  className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 flex items-center justify-center shadow-lg shadow-emerald-600/20 group"
                  onMouseEnter={() => setIsHovering('login')}
                  onMouseLeave={() => setIsHovering('')}
                >
                  Get Started
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link 
                  href="/about" 
                  className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-md font-medium hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center"
                >
                  Learn More
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Right side of Hero - Gaming Bear Illustration */}
            <motion.div
              className="hidden lg:flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="relative w-full max-w-md">
                <motion.div
                  animate={floatingAnimation}
                  className="relative z-10"
                >
                  <Image 
                    src="/assets/gangiobear-gaming.png" 
                    alt="Gangio Bear Gaming" 
                    width={500} 
                    height={500} 
                    className="object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  />
                </motion.div>
                
                {/* Glowing effect */}
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl z-0"></div>
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
                  Features Designed for Gamers
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Everything you need to build your gaming community and dominate the competition.
              </p>
            </motion.div>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Feature 1 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <FiHeadphones className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Crystal Clear Voice Chat</h3>
                <p className="text-gray-300 leading-relaxed">
                  Low-latency, high-quality voice communication that keeps you connected with your team during intense gaming sessions.
                </p>
              </motion.div>
              
              {/* Feature 2 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <BiGame className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Screen Sharing</h3>
                <p className="text-gray-300 leading-relaxed">
                  Share your epic gaming moments, strategies, or tutorials with your friends in real-time with high-quality screen sharing.
                </p>
              </motion.div>
              
              {/* Feature 3 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <FiUsers className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Gaming Communities</h3>
                <p className="text-gray-300 leading-relaxed">
                  Create and join gaming communities dedicated to your favorite games, find teammates, and build lasting friendships.
                </p>
              </motion.div>
              
              {/* Feature 4 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <FiMessageSquare className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Rich Text Chat</h3>
                <p className="text-gray-300 leading-relaxed">
                  Express yourself with rich text formatting, emoji reactions, GIFs, and file sharing in our modern chat interface.
                </p>
              </motion.div>
              
              {/* Feature 5 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <BiJoystick className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Game Integration</h3>
                <p className="text-gray-300 leading-relaxed">
                  Connect your Steam account and show off what you're playing. Automatic game detection and rich presence features.
                </p>
              </motion.div>
              
              {/* Feature 6 */}
              <motion.div 
                className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1 group"
                variants={fadeInUp}
              >
                <div className="w-14 h-14 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors duration-300">
                  <FiShield className="h-7 w-7 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold mb-3 group-hover:text-emerald-400 transition-colors duration-300">Privacy & Security</h3>
                <p className="text-gray-300 leading-relaxed">
                  Advanced permissions system, role management, and moderation tools to keep your gaming communities safe.
                </p>
              </motion.div>
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
                    Ready to Level Up Your Gaming Experience?
                  </h2>
                  <p className="text-xl text-gray-300 mb-8">
                    Join thousands of gamers already using our platform to connect, communicate, and conquer together.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link 
                      href="/register" 
                      className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 text-center shadow-lg shadow-emerald-600/20 group flex items-center justify-center"
                    >
                      Create Your Account
                      <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                    <Link 
                      href="/login" 
                      className="px-6 py-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-white rounded-md font-medium hover:bg-gray-700/50 transition-all duration-300 text-center"
                    >
                      Sign In
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

        {/* Footer */}
        <footer className="relative pt-16 pb-8 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center mb-6">
                  <Image 
                    src="/assets/logo.png" 
                    alt="Gangio Logo" 
                    width={40} 
                    height={40} 
                    className="mr-3"
                  />
                  <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                    Gangio
                  </span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  The ultimate platform for gamers to connect, communicate, and conquer together. Build your gaming community and dominate the competition.
                </p>
                <div className="flex space-x-5">
                  <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                    </svg>
                  </a>
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">Product</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Features</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Pricing</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">FAQ</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Download</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-bold mb-6 text-white">Company</h4>
                <ul className="space-y-4">
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">About</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Blog</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Careers</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300">Contact</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Gangio. All rights reserved.</p>
              <div className="flex space-x-6 mt-6 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300 text-sm">Privacy Policy</a>
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300 text-sm">Terms of Service</a>
                <a href="#" className="text-gray-400 hover:text-emerald-500 transition-colors duration-300 text-sm">Cookie Policy</a>
              </div>
            </div>
            
            {/* Footer image */}
            <div className="mt-8 flex justify-center">
              <Image 
                src="/assets/gvngio-footer.png" 
                alt="Gangio Footer" 
                width={200} 
                height={50} 
                className="opacity-50 hover:opacity-80 transition-opacity duration-300"
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
