import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Download Gangio | Cross-Platform Communication App',
  description: 'Download Gangio for Windows, macOS, Linux, Android, or iOS. Experience seamless communication across all your devices with our secure, feature-rich platform.',
  keywords: 'Gangio download, gaming chat app, cross-platform communication, voice chat, video calls, screen sharing, game integration',
  openGraph: {
    title: 'Download Gangio | Cross-Platform Communication App',
    description: 'Download Gangio for Windows, macOS, Linux, Android, or iOS. Experience seamless communication across all your devices.',
    url: 'https://Gangio.vercel.app/download',
    siteName: 'Gangio',
    images: [
      {
        url: 'https://Gangio.com/og-download.jpg',
        width: 1200,
        height: 630,
        alt: 'Gangio Download Page',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Download Gangio | Cross-Platform Communication App',
    description: 'Download Gangio for Windows, macOS, Linux, Android, or iOS. Experience seamless communication across all your devices.',
    images: ['https://Gangio.com/og-download.jpg'],
    creator: '@Gangio',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://Gangio.com/download',
    languages: {
      'en-US': 'https://Gangio.com/en/download',
      'es-ES': 'https://Gangio.com/es/download',
      'fr-FR': 'https://Gangio.com/fr/download',
      'de-DE': 'https://Gangio.com/de/download',
      'ja-JP': 'https://Gangio.com/ja/download',
      'ru-RU': 'https://Gangio.com/ru/download',
    },
  },
};
