'use client';
import { CalendarHeart, Home, ShoppingBag, Sparkles, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { useI18n } from '@/lib/i18n';

/** Mobile Navigation wie in einer App. Buchen ist die hervorgehobene Mitte. */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  if (pathname.startsWith('/admin') || pathname.startsWith('/buchen') || pathname.startsWith('/kasse')) return null;
  const items = [
    { href: '/', label: t('nav.start'), icon: Home, match: (p: string) => p === '/' },
    { href: '/behandlungen/', label: t('nav.treatments'), icon: Sparkles, match: (p: string) => p.startsWith('/behandlungen') },
    { href: '/buchen/', label: t('nav.book'), icon: CalendarHeart, center: true, match: () => false },
    { href: '/shop/', label: t('nav.shop'), icon: ShoppingBag, match: (p: string) => p.startsWith('/shop') },
    { href: '/konto/', label: t('nav.account'), icon: User, match: (p: string) => p.startsWith('/konto') || p.startsWith('/login') },
  ];
  return (
    <nav
      aria-label="App-Navigation"
      data-quick-curtain
      className="pb-safe fixed inset-x-0 bottom-0 z-50 border-t border-line-soft bg-cream-50/95 backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon, center, match }) => {
          const active = match(pathname);
          return (
            <li key={href} className="flex justify-center">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn('flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[0.66rem] tracking-wide', active ? 'text-honey-950' : 'text-muted')}
              >
                {center ? (
                  <span className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-honey-950 text-honey-300 shadow-lg shadow-honey-950/25 ring-4 ring-cream-50">
                    <Icon strokeWidth={1.5} className="h-6 w-6" />
                  </span>
                ) : (
                  <Icon strokeWidth={active ? 1.8 : 1.5} className="h-5 w-5" />
                )}
                <span className={cn(center && 'font-medium text-honey-950')}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
