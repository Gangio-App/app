'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { locales, defaultLocale } from '@/i18n';

type Locale = typeof locales[number];

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Record<string, any>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load saved language preference from localStorage
    const savedLocale = localStorage.getItem('language') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setLocale(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Load messages for the current locale
    const loadMessages = async () => {
      try {
        const localeMessages = await import(`@/messages/${locale}/common.json`);
        setMessages(localeMessages.default);
      } catch (error) {
        console.error(`Failed to load messages for locale ${locale}:`, error);
        // Fallback to default locale if loading fails
        if (locale !== defaultLocale) {
          const defaultMessages = await import(`@/messages/${defaultLocale}/common.json`);
          setMessages(defaultMessages.default);
        }
      }
    };

    loadMessages();
  }, [locale]);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', locale);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, messages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
