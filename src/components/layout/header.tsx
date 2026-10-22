'use client';
import { Menu, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/features/shop/cart';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';
import { mainNav } from '@/lib/nav';
import { ButtonLink } from '../ui/button';
import { Drawer } from '../ui/drawer';
import { Logo } from './logo';

const navKeys = ['nav.start', 'nav.treatments', 'nav.courses', 'nav.shop', 'nav.about', 'nav.book'] as const;

export function Header() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
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
      <div className="wrap grid h-16 grid-cols-[1fr_auto] items-center gap-4 md:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <Link href="/" aria-label="Honigseele – Startseite" data-label="Honigseele" className="justify-self-start">
          <Logo light={overHero} />
        </Link>
        <nav aria-label="Hauptnavigation" className="hidden justify-self-center lg:block">
          <ul className="flex items-center gap-4 whitespace-nowrap text-[0.74rem] font-medium uppercase tracking-[0.1em] min-[1360px]:gap-10 min-[1360px]:text-[0.76rem] min-[1360px]:tracking-[0.16em]">
            {mainNav.slice(0, 5).map((item, i) => {
              // „Start“ führt an den Willkommen-Bereich, nicht zurück in den Hero
              const isStart = item.href === '/';
              const active = isStart ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={isStart ? '/#willkommen' : item.href}
                    data-label={isStart ? 'Willkommen' : undefined}
                    className={cn(
                      'relative py-2 transition-opacity hover:opacity-100',
                      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-500 hover:after:scale-x-100',
                      active ? 'opacity-100 after:scale-x-100' : 'opacity-80 after:scale-x-0',
                    )}
                  >
                    {t(navKeys[i])}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="flex items-center gap-1 justify-self-end">
          <button
            onClick={() => setLocale(locale === 'de' ? 'en' : 'de')}
            className="hidden min-h-11 rounded-full px-3 text-xs font-medium tracking-widest opacity-75 hover:opacity-100 min-[1360px]:block"
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
              <span className="min-[1360px]:hidden">{t('nav.book')}</span>
              <span className="hidden min-[1360px]:inline">{t('cta.book')}</span>
            </ButtonLink>
          </span>
          {/* Tablet: Menü, solange die Navigation oben nicht passt (Handy hat die untere Leiste) */}
          <button onClick={() => setMenu(true)} className="hidden h-11 w-11 place-items-center rounded-full opacity-80 hover:opacity-100 md:grid lg:hidden" aria-label="Menü öffnen">
            <Menu strokeWidth={1.5} className="h-5 w-5" />
          </button>
        </div>
      </div>
      <Drawer open={menu} onClose={() => setMenu(false)} title="Menü">
        <nav aria-label="Menü" className="text-honey-950">
          <ul className="border-t border-line-soft">
            {mainNav.map((item, i) => (
              <li key={item.href} className="border-b border-line-soft">
                <Link href={item.href === '/' ? '/#willkommen' : item.href} onClick={() => setMenu(false)} className="flex min-h-14 items-center justify-between font-serif text-3xl">
                  {t(navKeys[i])}
                </Link>
              </li>
            ))}
          </ul>
          <button onClick={() => setLocale(locale === 'de' ? 'en' : 'de')} className="mt-6 min-h-11 text-sm font-medium tracking-widest text-muted">
            {locale === 'de' ? 'English' : 'Deutsch'}
          </button>
        </nav>
      </Drawer>
    </header>
  );
}
