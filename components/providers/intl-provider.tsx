'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Locale, defaultLocale } from '@/i18n';

interface IntlProviderProps {
  children: ReactNode;
  locale?: Locale;
  messages?: Record<string, any>;
}

export function IntlProvider({ 
  children, 
  locale = defaultLocale,
  messages
}: IntlProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [currentMessages, setCurrentMessages] = useState<Record<string, any> | undefined>(messages);

  // Load messages if they weren't provided
  useEffect(() => {
    if (!currentMessages) {
      // Only access localStorage on client side
      if (typeof window !== 'undefined') {
        // Try to get language settings from localStorage
        const savedSettings = localStorage.getItem('languageSettings');
        if (savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            if (settings.language) {
              // Extract the language code from the locale (e.g., 'en-US' -> 'en')
              const languageCode = settings.language.split('-')[0] as Locale;
              
              // Only change if different from current
              if (languageCode !== currentLocale) {
                setCurrentLocale(languageCode);
                
                // Load messages for the new locale
                import(`@/messages/${languageCode}/common.json`)
                  .then((module) => {
                    setCurrentMessages(module.default);
                  })
                  .catch((err) => {
                    console.error(`Failed to load messages for locale ${languageCode}:`, err);
                    // Fallback to default locale
                    if (languageCode !== defaultLocale) {
                      import(`@/messages/${defaultLocale}/common.json`)
                        .then((module) => {
                          setCurrentMessages(module.default);
                          setCurrentLocale(defaultLocale);
                        })
                        .catch((err) => {
                          console.error(`Failed to load fallback messages:`, err);
                        });
                    }
                  });
              }
            }
          } catch (e) {
            console.error('Failed to parse language settings:', e);
          }
        }
      }
    }
  }, [currentLocale, currentMessages]);

  // If we don't have messages yet, show a loading state or fallback
  if (!currentMessages) {
    return <div className="loading-translations">Loading translations...</div>;
  }

  return (
    <NextIntlClientProvider locale={currentLocale} messages={currentMessages}>
      {children}
    </NextIntlClientProvider>
  );
}
