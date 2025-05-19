import type { Metadata } from 'next';
import './globals.css';
import '@livekit/components-styles';
import '../styles/fonts.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { ModalProvider } from '@/providers/ModalProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';

export const metadata: Metadata = {
  title: 'gvng.io',
  description: 'Connect with friends and communities.',
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
            <LanguageProvider>
                <ModalProvider />
                {children}
            </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}