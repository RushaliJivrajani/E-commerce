import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Rush Closet | International Premium Fashion',
  description: 'Discover luxury fashion, premium collections, and exclusive styles at Rush Closet.',
  keywords: ['fashion', 'luxury', 'clothing', 'Rush Closet', 'premium fashion', 'ecommerce'],
  openGraph: {
    title: 'Rush Closet | International Premium Fashion',
    description: 'Discover luxury fashion, premium collections, and exclusive styles at Rush Closet.',
    url: 'https://rushcloset.com',
    siteName: 'Rush Closet',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Rush Closet Premium Fashion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
        {children}
      </body>
    </html>
  );
}
