'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RootPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('currentUser');
    
    // Brief loading spinner for better UX
    const timeout = setTimeout(() => {
      setIsLoading(false);
      
      // Redirect based on authentication status
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/landing');
      }
    }, 500); // Reduced loading time for better performance
    
    return () => clearTimeout(timeout);
  }, [router]);

  // Simple loading spinner
  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div 
        className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
