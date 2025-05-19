'use client';

import { motion } from 'framer-motion';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <motion.div 
        className="h-16 w-16 rounded-full border-t-4 border-b-4 border-emerald-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
} 