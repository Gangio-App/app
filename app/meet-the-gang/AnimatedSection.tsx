'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  whileInView?: any;
  viewport?: any;
  transition?: any;
  delay?: number;
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  className,
  initial,
  animate,
  whileInView,
  viewport,
  transition,
  delay
}) => {
  return (
    <motion.div
      className={className}
      initial={initial || { opacity: 0 }}
      animate={animate}
      whileInView={whileInView || { opacity: 1 }}
      viewport={viewport || { once: true }}
      transition={transition || { delay: delay || 0, duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
