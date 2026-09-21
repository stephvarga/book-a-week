import type { Metadata } from 'next';
import { Abril_Fatface, DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { DynamicFavicon } from '@/components/DynamicFavicon';
import { site } from '@/content/site';

// next/font self-hosts these at build time (faster, no request to Google's
// CDN at runtime, and no need for the old <link rel="preconnect"> dance).
// The generated CSS variables match the names globals.css already expects.
const fontDisplay = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const fontBody = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

const fontAccent = Abril_Fatface({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-accent',
  display: 'swap',
});

export const metadata: Metadata = {
  title: site.meta.title,
  description: site.meta.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${fontDisplay.variable} ${fontBody.variable} ${fontAccent.variable}`}>
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
