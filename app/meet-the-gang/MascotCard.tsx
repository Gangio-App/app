'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface MascotCardProps {
  name: string;
  role: string;
  description: string;
  imagePath: string;
}

const MascotCard: React.FC<MascotCardProps> = ({ 
  name, 
  role, 
  description, 
  imagePath 
}) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-emerald-500/50 transition-all duration-300"
      whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)' }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative h-64 w-full">
        <Image 
          src={imagePath} 
          alt={name} 
          fill
          className="object-contain p-4"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-400 mb-1">
          {name}
        </h3>
        <p className="text-emerald-500 font-medium mb-4">{role}</p>
        <p className="text-gray-300">{description}</p>
      </div>
    </motion.div>
  );
};

export default MascotCard;
