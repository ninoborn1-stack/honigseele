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
    // Startseite: transparent über dem Hero, fest sobald der Hero durchgescrollt ist
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>('.hero');
      const limit = hero ? hero.offsetHeight - window.innerHeight * 0.85 : 40;
      setScrolled(window.scrollY > Math.max(40, limit));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (pathname.startsWith('/admin') || pathname.startsWith('/buchen')) return null;

  return (
    <header
      data-site-header
      className={cn(
        'transition-[background-color,color,border-color] duration-500',
        overHero ? 'border-b border-transparent bg-transparent text-cream-50' : 'border-b border-line-soft bg-cream-50/92 text-honey-950 backdrop-blur-md',
      )}
    >
      <div className="wrap flex h-16 items-center justify-between gap-6 md:h-20">
        <Link href="/" aria-label="Honigseele – Startseite" data-label="Honigseele">
          <Logo light={overHero} />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-6 whitespace-nowrap text-[0.78rem] font-medium uppercase tracking-[0.16em] xl:gap-10">
            {mainNav.slice(1, 5).map((item, i) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'relative py-2 transition-opacity hover:opacity-100',
                      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100',
                      active ? 'opacity-100 after:scale-x-100' : 'opacity-80 after:scale-x-0',
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
