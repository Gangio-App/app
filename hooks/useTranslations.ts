'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import get from 'lodash/get';

// Custom translation hook that uses our LanguageContext
export function useTranslations(namespace?: string) {
  const { messages } = useLanguage();
  
  // Translation function that gets nested values from messages
  const t = (key: string, params?: Record<string, any>) => {
    const value = get(messages, key, key);
    
    if (typeof value !== 'string') {
      return key;
    }
    
    if (!params) {
      return value;
    }
    
    // Replace parameters in the string
    return value.replace(/{([^}]+)}/g, (_, paramName) => {
      return params[paramName] !== undefined ? String(params[paramName]) : `{${paramName}}`;
    });
  };
  
  return {
    // Basic translation function
    t: (key: string, params?: Record<string, any>) => t(key, params),
    
    // Namespaced translation functions for common sections
    app: {
      name: () => t('app.name'),
      tagline: () => t('app.tagline')
    },
    navigation: {
      home: () => t('navigation.home'),
      friends: () => t('navigation.friends'),
      servers: () => t('navigation.servers'),
      messages: () => t('navigation.messages'),
      settings: () => t('navigation.settings'),
      logout: () => t('navigation.logout')
    },
    settings: {
      title: () => t('settings.title'),
      categories: {
        userSettings: () => t('settings.categories.userSettings'),
        appSettings: () => t('settings.categories.appSettings'),
        info: () => t('settings.categories.info')
      },
      tabs: {
        myAccount: () => t('settings.tabs.myAccount'),
        profile: () => t('settings.tabs.profile'),
        connections: () => t('settings.tabs.connections'),
        privacySafety: () => t('settings.tabs.privacySafety'),
        appearance: () => t('settings.tabs.appearance'),
        notifications: () => t('settings.tabs.notifications'),
        voiceVideo: () => t('settings.tabs.voiceVideo'),
        keybinds: () => t('settings.tabs.keybinds'),
        language: () => t('settings.tabs.language'),
        experimental: () => t('settings.tabs.experimental'),
        feedback: () => t('settings.tabs.feedback'),
        changelog: () => t('settings.tabs.changelog')
      },
      notImplemented: () => t('settings.notImplemented')
    },
    appearance: {
      title: () => t('appearance.title'),
      theme: {
        title: () => t('appearance.theme.title'),
        dark: () => t('appearance.theme.dark'),
        light: () => t('appearance.theme.light'),
        system: () => t('appearance.theme.system')
      },
      colorScheme: {
        title: () => t('appearance.colorScheme.title'),
        blue: () => t('appearance.colorScheme.blue'),
        green: () => t('appearance.colorScheme.green'),
        purple: () => t('appearance.colorScheme.purple'),
        pink: () => t('appearance.colorScheme.pink'),
        red: () => t('appearance.colorScheme.red'),
        orange: () => t('appearance.colorScheme.orange'),
        custom: () => t('appearance.colorScheme.custom')
      }
    },
    language: {
      title: () => t('language.title'),
      displayLanguage: {
        title: () => t('language.displayLanguage.title'),
        autoDetect: () => t('language.displayLanguage.autoDetect'),
        helpText: () => t('language.displayLanguage.helpText')
      },
      regionalFormat: {
        title: () => t('language.regionalFormat.title'),
        dateFormat: () => t('language.regionalFormat.dateFormat'),
        timeFormat: () => t('language.regionalFormat.timeFormat'),
        helpText: () => t('language.regionalFormat.helpText')
      },
      textTranslation: {
        title: () => t('language.textTranslation.title'),
        spellCheck: () => t('language.textTranslation.spellCheck'),
        autoTranslate: () => t('language.textTranslation.autoTranslate'),
        threshold: () => t('language.textTranslation.threshold'),
        thresholdLow: () => t('language.textTranslation.thresholdLow'),
        thresholdHigh: () => t('language.textTranslation.thresholdHigh'),
        thresholdHelp: () => t('language.textTranslation.thresholdHelp'),
        downloadPack: () => t('language.textTranslation.downloadPack'),
        contribute: () => t('language.textTranslation.contribute')
      }
    },
    voiceVideo: {
      title: () => t('voiceVideo.title'),
      inputDevices: {
        title: () => t('voiceVideo.inputDevices.title'),
        microphone: () => t('voiceVideo.inputDevices.microphone'),
        inputVolume: () => t('voiceVideo.inputDevices.inputVolume'),
        noiseSupression: () => t('voiceVideo.inputDevices.noiseSupression'),
        echoCancellation: () => t('voiceVideo.inputDevices.echoCancellation'),
        autoGain: () => t('voiceVideo.inputDevices.autoGain'),
        testMic: () => t('voiceVideo.inputDevices.testMic')
      },
      outputDevices: {
        title: () => t('voiceVideo.outputDevices.title'),
        speaker: () => t('voiceVideo.outputDevices.speaker'),
        outputVolume: () => t('voiceVideo.outputDevices.outputVolume'),
        testSpeaker: () => t('voiceVideo.outputDevices.testSpeaker')
      }
    },
    squadFinder: {
      title: () => t('squadFinder.title'),
      createSquad: () => t('squadFinder.createSquad'),
      joinSquad: () => t('squadFinder.joinSquad'),
      leaveSquad: () => t('squadFinder.leaveSquad'),
      waitingForOthers: () => t('squadFinder.waitingForOthers'),
      squadRoom: () => t('squadFinder.squadRoom'),
      skillLevel: () => t('squadFinder.skillLevel'),
      region: () => t('squadFinder.region'),
      settings: {
        title: () => t('squadFinder.settings.title'),
        displayName: () => t('squadFinder.settings.displayName'),
        displayNameDesc: () => t('squadFinder.settings.displayNameDesc'),
        steamProfile: () => t('squadFinder.settings.steamProfile'),
        steamProfileDesc: () => t('squadFinder.settings.steamProfileDesc'),
        cs2Rating: () => t('squadFinder.settings.cs2Rating'),
        gamingRegion: () => t('squadFinder.settings.gamingRegion'),
        gamingRegionDesc: () => t('squadFinder.settings.gamingRegionDesc')
      }
    },
    actions: {
      save: () => t('actions.save'),
      cancel: () => t('actions.cancel'),
      delete: () => t('actions.delete'),
      edit: () => t('actions.edit'),
      apply: () => t('actions.apply'),
      confirm: () => t('actions.confirm'),
      back: () => t('actions.back'),
      next: () => t('actions.next'),
      finish: () => t('actions.finish')
    }
  };
}
