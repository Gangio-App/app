'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import NavigationBar from '@/components/NavigationBar';
import ThreeBackground from '@/components/ui/ThreeBackground';

export default function NotFoundPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Fetch user info to display correct navbar state
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
    // No redirect needed here, user is already off-app context
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col">
      <NavigationBar currentUser={currentUser} onLogout={handleLogout} />
      <div className="flex-grow flex items-center justify-center px-6 pt-20"> {/* pt-20 for navbar offset */}
        <ThreeBackground preset="landing" /> {/* Optional: Add a specific preset for error pages */}
        <motion.div
          className="text-center relative z-10"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
        >
          <motion.img
            src="/assets/404.png" // Make sure this path is correct
            alt="404 Not Found Mascot"
            className="max-w-xs md:max-w-sm mx-auto mb-8"
            variants={fadeInUp}
          />
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-emerald-400 mb-4"
            variants={fadeInUp}
          >
            Oops! Page Not Found
          </motion.h1>
          <motion.p
            className="text-lg text-gray-300 mb-8"
            variants={fadeInUp}
          >
            Looks like the page you're looking for took a wrong turn.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link
              href="/"
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-lg"
            >
              Go Back Home
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 