// Supported languages
export const locales = ['en', 'es', 'fr', 'de', 'ja', 'tr', 'ru'] as const;

// Default language
export const defaultLocale = 'en' as const;

// Type for supported locales
export type Locale = (typeof locales)[number];

// Function to get messages for a specific locale
export async function getMessages(locale: Locale) {
  return (await import(`./messages/${locale}/common.json`)).default;
}
