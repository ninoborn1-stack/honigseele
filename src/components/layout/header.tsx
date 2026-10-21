'use client';
import { ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/features/shop/cart';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { mainNav } from '@/lib/nav';
import { ButtonLink } from '../ui/button';
import { Logo } from './logo';

const navKeys = ['nav.start', 'nav.treatments', 'nav.courses', 'nav.shop', 'nav.about', 'nav.book'] as const;

export function Header() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === '/' && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/buchen')) return null;

  return (
    <header
      data-site-header
      className={cn(
        'z-50 transition-colors duration-500',
        // Startseite: Header liegt über dem Hero (absolut), danach fixiert – ohne Layout-Sprung
        pathname === '/' ? (overHero ? 'absolute inset-x-0' : 'fixed inset-x-0 top-0') : 'sticky top-0',
        overHero ? 'bg-transparent text-cream-50' : 'border-b border-line-soft bg-cream-50/90 backdrop-blur-md',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 md:h-20 md:px-10">
        <Link href="/" aria-label="Honigseele – Startseite" data-label="Honigseele">
          <Logo light={overHero} />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.92rem]">
            {mainNav.slice(1, 5).map((item, i) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative py-2 transition-opacity hover:opacity-100',
                      active ? 'opacity-100' : 'opacity-75',
                      active && 'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-current',
                    )}
                  >
                    {t(navKeys[i + 1])}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLocale(locale === 'de' ? 'en' : 'de')}
            className="hidden min-h-11 rounded-full px-3 text-xs font-medium tracking-widest opacity-75 hover:opacity-100 sm:block"
            aria-label="Sprache wechseln"
          >
            {locale === 'de' ? 'EN' : 'DE'}
          </button>
          <Link href="/konto/" className="hidden h-11 w-11 place-items-center rounded-full opacity-80 hover:opacity-100 md:grid" aria-label="Mein Konto" data-label="Mein Konto">
            <User strokeWidth={1.5} className="h-5 w-5" />
          </Link>
          <button onClick={() => setOpen(true)} className="relative grid h-11 w-11 place-items-center rounded-full opacity-80 hover:opacity-100" aria-label={`Warenkorb, ${count} Artikel`}>
            <ShoppingBag strokeWidth={1.5} className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-honey-400 px-1 text-[0.65rem] font-semibold text-honey-950">
                {count}
              </span>
            )}
          </button>
          <span className="ml-2 hidden md:block">
            <ButtonLink href="/buchen/" variant={overHero ? 'honey' : 'primary'} size="sm" data-label="Buchen">
              {t('cta.book')}
            </ButtonLink>
          </span>
        </div>
      </div>
    </header>
  );
}
