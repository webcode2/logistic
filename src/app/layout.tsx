import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/index.css';

export const metadata: Metadata = {
  title: 'LogiTrack Pro - Global Logistics Solutions',
  description: 'Fast, reliable, and secure shipping solutions for businesses worldwide.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
