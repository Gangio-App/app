'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import NavigationBar from '@/components/NavigationBar';
import ThreeBackground from '@/components/ui/ThreeBackground';

// Placeholder Job type
interface JobOpening {
  id: string;
  title: string;
  department: string;
  location: string;
  description: string;
}

export default function CareersPage() {
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
    window.location.href = '/';
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Placeholder job data
  const jobOpenings: JobOpening[] = [
    {
      id: 'eng-01', title: 'Senior Backend Engineer', department: 'Engineering', location: 'Remote',
      description: 'Build and scale our core infrastructure using Go and microservices...'
    },
    {
      id: 'des-01', title: 'Product Designer (UI/UX)', department: 'Design', location: 'Remote / San Francisco',
      description: 'Shape the future of the GANGIO user experience across platforms...'
    },
    {
      id: 'mkt-01', title: 'Community Manager', department: 'Marketing', location: 'Remote',
      description: 'Engage with our user community, manage social channels, and grow our presence...'
    },
     {
      id: 'eng-02', title: 'Frontend Engineer (React/Next.js)', department: 'Engineering', location: 'Remote',
      description: 'Develop and maintain our web application using modern frontend technologies...'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
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
              Join Our <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Team</span>
            </motion.h1>

            <motion.p
              className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto text-center"
              variants={fadeInUp}
            >
              We're building the future of gaming communication and always looking for passionate, talented individuals to help us achieve our mission.
            </motion.p>

            <motion.div 
                className="flex justify-center mb-16"
                variants={fadeInUp}
            >
                <img src="/assets/GangBearHelp-transparent.png" alt="GANGIO Bear helping" className="h-40 md:h-56" />
            </motion.div>

            {/* Job Listings */}
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-semibold mb-8 text-center">Open Positions</h2>
              <div className="space-y-6 max-w-4xl mx-auto">
                {jobOpenings.map((job) => (
                  <motion.div
                    key={job.id}
                    className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 group"
                    whileHover={{ y: -3 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
                      <h3 className="text-xl font-semibold text-white group-hover:text-emerald-400 transition-colors">{job.title}</h3>
                      <div className="text-sm text-gray-400 mt-2 md:mt-0 space-x-3">
                        <span>{job.department}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-4 line-clamp-2">{job.description}</p>
                    <button 
                       onClick={() => alert(`Apply for: ${job.title}`)} // Placeholder action
                       className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors text-sm"
                    >
                      Learn More & Apply →
                    </button>
                  </motion.div>
                ))}
                {jobOpenings.length === 0 && (
                  <p className="text-center text-gray-400">No open positions right now, but check back soon!</p>
                )}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </div>
  );
} 