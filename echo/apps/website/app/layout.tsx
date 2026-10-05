import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const font = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Echo: talk, and it answers in your ear',
  description: 'Echo is a voice assistant for your earbuds. Tap, speak, and hear the answer. Android and iOS.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className={font.className}>{children}</body></html>);
}
