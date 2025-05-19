'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavigationBar from '@/components/NavigationBar';
import ThreeBackground from '@/components/ui/ThreeBackground';

export default function AboutPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

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
    // Optionally redirect
    window.location.href = '/'; // Simple redirect for now
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden">
      <NavigationBar currentUser={currentUser} onLogout={handleLogout} />
      <div className="pt-20"> {/* Padding for fixed navbar */}
        <ThreeBackground preset="landing" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-6 text-center"
              variants={fadeInUp}
            >
              About <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">GANGIO</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
              variants={fadeInUp}
            >
              GANGIO was born from a simple idea: to create the ultimate platform where gamers can truly connect, collaborate, and conquer together.
            </motion.p>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
                <p className="text-gray-400 mb-4">
                  We are Gangio. I (@korybantes on GitHub) started from a small idea but big dreams. I even couldn't play co-op video games with my own brother because of the lack of suitable apps in my country, Türkiye.
                </p>
                <p className="text-gray-400 mb-4">
                  This app is for all the gamers around the globe, not just Türkiye or Russia. My mission is to connect all gamers in one place so we can play, chat, and have fun together in our free time.
                </p>
                <p className="text-gray-400">
                  Gangio is made with passion, for freedom.
                </p>
              </div>
              <div className="relative h-64 md:h-auto">
                <img
                  src="/assets/gangiobear-wymsical-forest.png"
                  alt="GANGIO Mascot in forest"
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                />
              </div>
            </motion.div>

            <motion.div className="text-center" variants={fadeInUp}>
              <h2 className="text-2xl font-semibold mb-6">Meet the GANG</h2>
              <p className="text-gray-400 mb-6 max-w-3xl mx-auto">
                Our mascots represent the spirit and values of Gangio. Each character brings their unique personality to our community.
              </p>
              <div className="flex justify-center">
                <a 
                  href="/meet-the-gang" 
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20"
                >
                  Meet Our Mascots
                </a>
              </div>
            </motion.div>

          </motion.div>
        </div>
        {/* You can add a simple footer here or reuse the LandingPage footer component if extracted */}
      </div>
    </div>
  );
} 