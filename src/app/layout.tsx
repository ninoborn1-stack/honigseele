import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Footer } from '@/components/layout/footer';
import { PageTransition } from '@/components/layout/page-transition';
import { SiteTop } from '@/components/layout/site-top';
import { SmoothScroll } from '@/components/layout/smooth-scroll';
import { WhatsAppButton } from '@/components/layout/whatsapp';
import { Intro, introHeadScript } from '@/components/brand/intro';
import { site } from '@/content';
import { MOTION } from '@/lib/motion-config';
import { BASE_PATH, DEMO, SITE_URL, withBase } from '@/lib/config';
import { Providers } from './providers';
import './globals.css';
import { resolveImage } from '@/content/images';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Honigseele – Naturkosmetik & Haarentfernung in Berlin-Kreuzberg',
    template: '%s · Honigseele Berlin',
  },
  description:
    'Waxing mit Honigwachs, Laser-Haarentfernung, Gesichtsbehandlungen, Massagen, Yoga und Coaching in Kreuzberg. Eigene Naturkosmetik, handgemacht in Berlin. Jetzt online buchen.',
  manifest: withBase('/manifest.webmanifest'),
  // Demo nicht indexieren
  robots: DEMO ? { index: false, follow: false } : { index: true, follow: true },
  appleWebApp: { capable: true, title: 'Honigseele', statusBarStyle: 'default' },
  icons: {
    icon: [{ url: withBase('/icons/favicon-32.png'), sizes: '32x32', type: 'image/png' }, { url: withBase('/icons/icon-192.png'), sizes: '192x192', type: 'image/png' }],
    apple: withBase('/icons/apple-touch-icon.png'),
  },
  openGraph: { type: 'website', locale: 'de_DE', siteName: 'Honigseele', images: [resolveImage('hero.shop').src] },
  alternates: { languages: { de: '/', en: '/en/' } },
};

export const viewport: Viewport = {
  themeColor: '#2B2118',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'DaySpa',
  name: 'Honigseele',
  description: site.brand.claim,
  url: SITE_URL,
  telephone: site.settings.contact.phone,
  email: site.settings.contact.email,
  image: `${SITE_URL}${resolveImage('hero.shop').src}`,
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.location.street,
    postalCode: site.location.zip,
    addressLocality: site.location.city,
    addressCountry: 'DE',
  },
  aggregateRating: { '@type': 'AggregateRating', ratingValue: site.brand.rating.value, reviewCount: site.brand.rating.count },
  sameAs: [site.settings.contact.instagram, site.settings.contact.facebook],
  knowsLanguage: ['de', 'en', 'es', 'it'],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning style={{
        ['--flower-mask' as string]: `url('${withBase('/images/flower-mask.svg')}')`,
        ['--page-out-ms' as string]: `${MOTION.page.outMs}ms`,
        ['--page-in-ms' as string]: `${MOTION.page.inMs}ms`,
        ['--page-offset' as string]: `${MOTION.page.offsetPx}px`,
        ['--page-reduced-ms' as string]: `${MOTION.page.reducedMs}ms`,
        ['--intro-exit-at' as string]: `${MOTION.intro.drawMs + MOTION.intro.holdMs}ms`,
        ['--intro-exit-ms' as string]: `${MOTION.intro.exitMs}ms`,
      }}>
      <head>
        {/* Browser soll die Scroll-Position nicht wiederherstellen, sonst startet das Hero-Intro mittendrin */}
        <script
          dangerouslySetInnerHTML={{
            __html: `if("scrollRestoration" in history&&!location.hash)history.scrollRestoration="manual";try{if(location.pathname==="${BASE_PATH}/"&&!location.hash&&!matchMedia("(prefers-reduced-motion: reduce)").matches){var h=document.documentElement;h.classList.add("hero-intro");setTimeout(function(){h.classList.remove("hero-intro")},4000)}}catch(e){}`,
          }}
        />
        <script dangerouslySetInnerHTML={{ __html: introHeadScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Intro />
        <Providers>
          <a href="#inhalt" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-honey-950 focus:px-4 focus:py-2 focus:text-cream-50">
            Zum Inhalt springen
          </a>
          <SiteTop />
          <main id="inhalt" className="min-h-[60svh]">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <WhatsAppButton />
          <SmoothScroll />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
