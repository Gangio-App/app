
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/Button';
import { LanguageIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { locales } from '@/i18n';
import Image from 'next/image';

// Define the supported languages with their codes and names
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English (100%)', flag: '/assets/flags/us.webp' },
  { code: 'tr', name: 'Türkçe (45%)', flag: '/assets/flags/tr.webp' },
  { code: 'es', name: 'Español (35%)', flag: '/assets/flags/es.webp' },
  { code: 'fr', name: 'Français (30%)', flag: '/assets/flags/fr.webp' },
  { code: 'de', name: 'Deutsch (32%)', flag: '/assets/flags/de.webp' },
  { code: 'ja', name: '日本語 (25%)', flag: '/assets/flags/jp.webp' },
  { code: 'ru', name: 'Русский (40%)', flag: '/assets/flags/ru.webp' }
];

// Define the date formats
const DATE_FORMATS = [
  { code: 'MM/DD/YYYY', name: 'MM/DD/YYYY (US)', example: '05/13/2025' },
  { code: 'DD/MM/YYYY', name: 'DD/MM/YYYY (EU)', example: '13/05/2025' },
  { code: 'YYYY-MM-DD', name: 'YYYY-MM-DD (ISO)', example: '2025-05-13' },
  { code: 'DD.MM.YYYY', name: 'DD.MM.YYYY', example: '13.05.2025' },
  { code: 'DD MMM YYYY', name: 'DD MMM YYYY', example: '13 May 2025' },
  { code: 'MMM DD, YYYY', name: 'MMM DD, YYYY', example: 'May 13, 2025' },
];

// Define the time formats
const TIME_FORMATS = [
  { code: '12h', name: '12-hour (AM/PM)', example: '11:59 PM' },
  { code: '24h', name: '24-hour', example: '23:59' },
];

// Define the interface for language settings
interface LanguageSettings {
  language: string;
  dateFormat: string;
  timeFormat: string;
  autoDetectLanguage: boolean;
  spellCheck: boolean;
  translateMessages: boolean;
  translateThreshold: number; // Percentage of confidence for auto-translation
}

const LanguagePanel: React.FC = () => {
  const { t } = useTranslations();
  const { locale, setLocale } = useLanguage();
  
  // Initialize settings from localStorage or use defaults
  const [settings, setSettings] = useState<LanguageSettings>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      // Try to get settings from localStorage
      const savedSettings = localStorage.getItem('languageSettings');
      if (savedSettings) {
        try {
          return JSON.parse(savedSettings);
        } catch (e) {
          console.error('Failed to parse saved language settings:', e);
        }
      }
    }
    
    // Default settings if nothing in localStorage
    return {
      language: locale,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      autoDetectLanguage: false,
      spellCheck: true,
      translateMessages: false,
      translateThreshold: 80
    };
  });

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('languageSettings', JSON.stringify(settings));
    }
  }, [settings]);

  // Handle setting changes
  const handleSettingChange = <K extends keyof LanguageSettings>(
    key: K, 
    value: LanguageSettings[K]
  ) => {
    setSettings({
      ...settings,
      [key]: value
    });
  };

  // Apply language settings to the document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Set HTML lang attribute
      document.documentElement.lang = settings.language;
      
      // You could also apply other language-related settings here
      // For example, configure date-fns or other libraries with the selected formats
    }
  }, [settings.language]);
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    // Update settings
    handleSettingChange('language', value);
    
    // Update the locale in the LanguageContext
    setLocale(value as any);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{t('language.title')}</h2>
      
      {/* Language Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white flex items-center">
          <LanguageIcon className="h-5 w-5 mr-2" />
          {t('language.displayLanguage.title')}
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="language-select" className="text-white mb-2 block">{t('language.displayLanguage.title')}</Label>
            <Select
              value={settings.language}
              onValueChange={handleLanguageChange}
            >
              <SelectTrigger className="w-full bg-gray-700 border-gray-600">
                <SelectValue placeholder={t('language.display.selectLanguage')}>
                  {settings.language && (
                    <div className="flex items-center">
                      <div className="relative w-5 h-4 mr-2 overflow-hidden rounded">
                        <Image 
                          src={SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language)?.flag || ''}
                          alt={settings.language}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language)?.name}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="text-white hover:bg-gray-700">
                    <div className="flex items-center">
                      <div className="relative w-5 h-4 mr-2 overflow-hidden rounded">
                        <Image 
                          src={lang.flag} 
                          alt={lang.code} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      {lang.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="mt-4 flex items-center space-x-2">
              <Switch
                id="auto-detect-language"
                checked={settings.autoDetectLanguage}
                onCheckedChange={(checked) => handleSettingChange('autoDetectLanguage', checked)}
              />
              <Label htmlFor="auto-detect-language" className="text-white">
                {t('language.displayLanguage.autoDetect')}
              </Label>
            </div>
          </div>
          
          <div className="mt-2 p-3 bg-gray-700 rounded-md">
            <p className="text-white text-sm">
              {t('language.displayLanguage.helpText')}
            </p>
          </div>
        </div>
      </div>
      
      {/* Date and Time Format */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <GlobeAltIcon className="h-5 w-5 mr-2" />
          {t('language.regionalFormat.title')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date-format" className="text-white mb-2 block">{t('language.regionalFormat.dateFormat')}</Label>
            <Select 
              value={settings.dateFormat} 
              onValueChange={(value: string) => handleSettingChange('dateFormat', value)}
            >
              <SelectTrigger id="date-format" className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {DATE_FORMATS.map(format => (
                  <SelectItem key={format.code} value={format.code}>
                    {format.name} ({format.example})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="time-format" className="text-white mb-2 block">{t('language.regionalFormat.timeFormat')}</Label>
            <Select 
              value={settings.timeFormat} 
              onValueChange={(value: string) => handleSettingChange('timeFormat', value)}
            >
              <SelectTrigger id="time-format" className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select time format" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {TIME_FORMATS.map(format => (
                  <SelectItem key={format.code} value={format.code}>
                    {format.name} ({format.example})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="mt-2 p-3 bg-gray-700 rounded-md">
          <p className="text-white text-sm">
            {t('language.regionalFormat.helpText')}
          </p>
        </div>
      </div>
      
      {/* Text & Translation */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white flex items-center">
          <DocumentTextIcon className="h-5 w-5 mr-2" />
          {t('language.textTranslation.title')}
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="spell-check"
              checked={settings.spellCheck}
              onCheckedChange={(checked) => handleSettingChange('spellCheck', checked)}
            />
            <Label htmlFor="spell-check" className="text-white">
              {t('language.textTranslation.spellCheck')}
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="translate-messages"
              checked={settings.translateMessages}
              onCheckedChange={(checked) => handleSettingChange('translateMessages', checked)}
            />
            <Label htmlFor="translate-messages" className="text-white">
              {t('language.textTranslation.autoTranslate')}
            </Label>
          </div>
          
          {settings.translateMessages && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="translate-threshold" className="text-white">{t('language.textTranslation.threshold')}</Label>
                <span className="text-white text-sm">{settings.translateThreshold}%</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">{t('language.textTranslation.thresholdLow')}</span>
                <input
                  id="translate-threshold"
                  type="range"
                  min={50}
                  max={95}
                  step={5}
                  value={settings.translateThreshold}
                  onChange={(e) => handleSettingChange('translateThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-gray-400 text-sm">{t('language.textTranslation.thresholdHigh')}</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                {t('language.textTranslation.thresholdHelp')}
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <Button variant="outline" className="mr-2">
              {t('language.textTranslation.downloadPack')}
            </Button>
            <Button variant="outline">
              {t('language.textTranslation.contribute')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Preview Section */}
      <div className="space-y-4 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-medium text-white">{t('language.preview.title')}</h3>
        
        <div className="p-4 bg-gray-700 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">{t('language.preview.currentLanguage')}:</span>
            <span className="text-white flex items-center">
              <div className="relative w-5 h-4 mr-2 overflow-hidden rounded">
                <Image 
                  src={SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language)?.flag || ''}
                  alt={settings.language}
                  fill
                  className="object-cover"
                />
              </div>
              {SUPPORTED_LANGUAGES.find(lang => lang.code === settings.language)?.name || settings.language}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">{t('language.preview.dateFormat')}:</span>
            <span className="text-white">
              {DATE_FORMATS.find(format => format.code === settings.dateFormat)?.example || settings.dateFormat}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">{t('language.preview.timeFormat')}:</span>
            <span className="text-white">
              {TIME_FORMATS.find(format => format.code === settings.timeFormat)?.example || settings.timeFormat}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">{t('language.preview.spellCheck')}:</span>
            <span className="text-white">{settings.spellCheck ? t('language.preview.enabled') : t('language.preview.disabled')}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-300">{t('language.preview.autoTranslation')}:</span>
            <span className="text-white">
              {settings.translateMessages 
                ? t('language.preview.withThreshold', { threshold: settings.translateThreshold }) 
                : t('language.preview.disabled')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguagePanel;
