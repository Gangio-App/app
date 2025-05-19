'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import MascotCard from './MascotCard';
import AnimatedSection from './AnimatedSection';

interface MascotData {
  key: string;
  name: string;
  role: string;
  description: string;
  imagePath: string;
}

export default function TranslatedContent() {
  const t = useTranslations('meetTheGang');
  
  const mascots: MascotData[] = [
    {
      key: 'fufu',
      name: t('mascots.fufu.name'),
      role: t('mascots.fufu.role'),
      description: t('mascots.fufu.description'),
      imagePath: '/assets/mascots/fufu.png'
    },
    {
      key: 'kazek',
      name: t('mascots.kazek.name'),
      role: t('mascots.kazek.role'),
      description: t('mascots.kazek.description'),
      imagePath: '/assets/mascots/kazek.png'
    },
    {
      key: 'fela',
      name: t('mascots.fela.name'),
      role: t('mascots.fela.role'),
      description: t('mascots.fela.description'),
      imagePath: '/assets/mascots/fela.png'
    },
    {
      key: 'bobby',
      name: t('mascots.bobby.name'),
      role: t('mascots.bobby.role'),
      description: t('mascots.bobby.description'),
      imagePath: '/assets/mascots/bobby.png'
    }
  ];

  return (
    <>
      <AnimatedSection 
        className="text-center mb-16"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 mb-6">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </AnimatedSection>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {mascots.map((mascot) => (
          <MascotCard
            key={mascot.key}
            name={mascot.name}
            role={mascot.role}
            description={mascot.description}
            imagePath={mascot.imagePath}
          />
        ))}
      </div>

      <AnimatedSection 
        className="mt-20 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-xl p-8 border border-emerald-800/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-emerald-400 mb-4">{t('storyTitle')}</h2>
        <p className="text-gray-300 mb-4">
          {t('storyPart1')}
        </p>
        <p className="text-gray-300 mb-4">
          {t('storyPart2')}
        </p>
        <p className="text-gray-300">
          {t('storyPart3')}
        </p>
      </AnimatedSection>
    </>
  );
}
