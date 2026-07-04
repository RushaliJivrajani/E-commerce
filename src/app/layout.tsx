import type { Metadata } from 'next';
import { Poppins, Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/lib/theme-context';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VIARO | Live in Style',
  description: 'Modern. Minimal. Made for the now. Experience premium streetwear and luxury fashion at VIARO.',
  keywords: ['VIARO', 'fashion', 'luxury', 'clothing', 'streetwear', 'premium fashion', 'ecommerce'],
  openGraph: {
    title: 'VIARO | Live in Style',
    description: 'Modern. Minimal. Made for the now. Experience premium streetwear and luxury fashion at VIARO.',
    url: 'https://viaro.in',
    siteName: 'VIARO',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VIARO Premium Streetwear',
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
    <html lang="en" className={`${poppins.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-viaro-red selection:text-white">
        <NextTopLoader color="#FF2D2D" showSpinner={false} height={3} shadow="0 0 10px #FF2D2D,0 0 5px #FF2D2D" />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
