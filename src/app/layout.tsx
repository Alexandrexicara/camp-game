import type { Metadata, Viewport } from 'next';
import Script from "next/script";
import { HappySeedsWatermark } from '@/components/HappySeedsWatermark';
import { OrientationGuard } from '@/components/OrientationGuard';
import './globals.css';
import jsonMetadata from '../../metadata.json';

export const metadata: Metadata = jsonMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Minijogo SDK — carrega antes do jogo iniciar */}
        <Script
          src="https://sdk0.minigame.vip/js/1.0/minigame-sdk.debug.js"
          strategy="beforeInteractive"
        />
        {process.env.NODE_ENV === 'production' && (
          <Script
            async
            src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
            data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>

      <body>
        {children}
        <OrientationGuard />
        <HappySeedsWatermark />
      </body>
    </html>
  );
}
