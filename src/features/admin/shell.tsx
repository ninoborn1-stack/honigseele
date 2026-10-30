'use client';
// Admin-Shell: Login für das Team, Seitenleiste (Desktop) bzw. Tab-Leiste (Mobil).
import {
  CalendarDays,
  Gift,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Scissors,
  Settings,
  SquarePen,
  Users,
  ExternalLink,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { getAdapter } from '@/data';
import { cn } from '@/lib/cn';
import { useSession } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminToast } from './ui';

// Navigation in wenigen, klar benannten Gruppen
const groups = [
  {
    title: 'Jeden Tag',
    items: [
      { href: '/admin/', label: 'Übersicht', icon: LayoutDashboard },
      { href: '/admin/kalender/', label: 'Kalender', icon: CalendarDays },
    ],
  },
  {
    title: 'Angebot',
    items: [
      { href: '/admin/leistungen/', label: 'Leistungen & Preise', icon: Scissors },
      { href: '/admin/team/', label: 'Team', icon: Users },
      { href: '/admin/kurse/', label: 'Kurse', icon: GraduationCap },
    ],
  },
  {
    title: 'Shop',
    items: [
      { href: '/admin/produkte/', label: 'Produkte', icon: Package },
      { href: '/admin/bestellungen/', label: 'Bestellungen', icon: Receipt },
      { href: '/admin/gutscheine/', label: 'Gutscheine', icon: Gift },
    ],
  },
  {
    title: 'Website',
    items: [
      { href: '/admin/inhalte/', label: 'Texte & Seiten', icon: SquarePen },
      { href: '/admin/einstellungen/', label: 'Einstellungen', icon: Settings },
    ],
  },
];

/** Mobil: wischbare Leiste, aktiver Eintrag wird in Sicht gerückt */
function MobileNav({ isActive }: { isActive: (href: string) => boolean }) {
  const ref = useRef<HTMLElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    ref.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [pathname]);
  return (
    <nav
      ref={ref}
      aria-label="Team-Bereich"
      className="no-scrollbar flex items-center gap-2 overflow-x-auto px-3 pb-3"
      data-lenis-prevent
    >
      {groups.map((g, gi) => (
        <div key={g.title} className="flex shrink-0 items-center gap-2">
          {gi > 0 && <span className="bg-line mx-1 h-6 w-px" aria-hidden />}
          {g.items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cn(
                'flex min-h-12 shrink-0 items-center gap-2 rounded-full px-4 text-base',
                isActive(href)
                  ? 'bg-honey-950 text-cream-50 font-medium'
                  : 'border-line-soft bg-card text-honey-950 border',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

function TeamLogin() {
  return (
    <div className="honey-light grid min-h-[80svh] place-items-center px-5">
      <div className="border-line bg-card w-full max-w-sm rounded-[2rem] border p-8 text-center">
        <Logo />
        <p className="eyebrow mt-8">Team-Bereich</p>
        <h1 className="mt-3 text-4xl">
          Schön, dass <em>Du</em> da bist.
        </h1>
        <p className="text-muted mt-4 text-base">
          Hier pflegt das Team Kalender, Leistungen, Preise, Produkte und Texte.
        </p>
        <Button className="mt-8 w-full" size="lg" onClick={() => getAdapter().loginAs('team')}>
          Als Team anmelden (Demo)
        </Button>
        <Link
          href="/"
          className="text-muted mt-4 inline-flex min-h-12 items-center text-base underline underline-offset-4"
        >
          Zurück zur Website
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, loading } = useSession();
  if (loading) return <Loading className="min-h-svh" />;
  if (session?.role !== 'team') return <TeamLogin />;
  const isActive = (href: string) =>
    href === '/admin/'
      ? pathname === '/admin' || pathname === '/admin/'
      : pathname.startsWith(href.slice(0, -1));

  return (
    <div className="bg-cream-50 min-h-svh md:grid md:grid-cols-[272px_1fr]">
      <aside className="border-line-soft bg-cream-100/60 hidden border-r md:flex md:flex-col">
        <div className="sticky top-0 flex h-svh flex-col px-4 py-6">
          <Link href="/admin/" className="px-3">
            <Logo />
          </Link>
          <p className="eyebrow mt-1 px-3 !text-[0.62rem]">Team-Bereich</p>
          <nav
            aria-label="Team-Bereich"
            className="mt-6 flex-1 space-y-5 overflow-y-auto"
            data-lenis-prevent
          >
            {groups.map((g) => (
              <div key={g.title}>
                <p className="text-muted px-3 pb-1 text-sm">{g.title}</p>
                <ul className="space-y-1">
                  {g.items.map(({ href, label, icon: Icon }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        aria-current={isActive(href) ? 'page' : undefined}
                        className={cn(
                          'flex min-h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors',
                          isActive(href)
                            ? 'bg-honey-950 text-cream-50 font-medium'
                            : 'text-honey-950 hover:bg-cream-50',
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          <div className="border-line-soft space-y-1 border-t pt-4 text-base">
            <p className="text-muted px-3 pb-1 text-sm">Angemeldet: {session.name}</p>
            <Link
              href="/"
              className="text-muted hover:bg-cream-50 flex min-h-12 items-center gap-3 rounded-xl px-3"
            >
              <ExternalLink className="h-5 w-5" strokeWidth={1.5} /> Zur Website
            </Link>
            <button
              onClick={() => getAdapter().logout()}
              className="text-muted hover:bg-cream-50 flex min-h-12 w-full items-center gap-3 rounded-xl px-3"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} /> Abmelden
            </button>
          </div>
        </div>
      </aside>

      {/* Mobil: Kopf + horizontal wischbare Leiste */}
      <div className="border-line-soft bg-cream-50/95 sticky top-0 z-30 border-b backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin/">
            <Logo className="text-2xl" />
          </Link>
          <div className="flex items-center">
            <Link
              href="/"
              className="text-muted grid h-12 w-12 place-items-center"
              aria-label="Zur Website"
            >
              <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => getAdapter().logout()}
              className="text-muted grid h-12 w-12 place-items-center"
              aria-label="Abmelden"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <MobileNav isActive={isActive} />
      </div>

      <div className="min-w-0 px-4 pt-6 pb-24 md:px-10 md:pt-10">{children}</div>
      <AdminToast />
    </div>
  );
}
