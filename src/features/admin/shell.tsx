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
import type { ReactNode } from 'react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { getAdapter } from '@/data';
import { cn } from '@/lib/cn';
import { useSession } from '@/lib/use-data';

const nav = [
  { href: '/admin/', label: 'Übersicht', icon: LayoutDashboard },
  { href: '/admin/kalender/', label: 'Kalender', icon: CalendarDays },
  { href: '/admin/leistungen/', label: 'Leistungen & Preise', icon: Scissors },
  { href: '/admin/team/', label: 'Team', icon: Users },
  { href: '/admin/kurse/', label: 'Kurse & Termine', icon: GraduationCap },
  { href: '/admin/produkte/', label: 'Produkte', icon: Package },
  { href: '/admin/bestellungen/', label: 'Bestellungen', icon: Receipt },
  { href: '/admin/gutscheine/', label: 'Gutscheine', icon: Gift },
  { href: '/admin/inhalte/', label: 'Texte & Seiten', icon: SquarePen },
  { href: '/admin/einstellungen/', label: 'Einstellungen', icon: Settings },
];

function TeamLogin() {
  return (
    <div className="honey-light grid min-h-[80svh] place-items-center px-5">
      <div className="w-full max-w-sm rounded-[2rem] border border-line bg-card p-8 text-center">
        <Logo />
        <p className="eyebrow mt-8">Team-Bereich</p>
        <h1 className="mt-3 text-4xl">
          Schön, dass <em>Du</em> da bist.
        </h1>
        <p className="mt-4 text-sm text-muted">Hier pflegt das Team Kalender, Leistungen, Preise, Produkte und Texte.</p>
        <Button className="mt-8 w-full" size="lg" onClick={() => getAdapter().loginAs('team')}>
          Als Team anmelden (Demo)
        </Button>
        <Link href="/" className="mt-4 inline-block text-sm text-muted underline underline-offset-4">
          Zurück zur Website
        </Link>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { session, loading } = useSession();
  if (loading) return <div className="min-h-svh" />;
  if (session?.role !== 'team') return <TeamLogin />;
  const isActive = (href: string) => (href === '/admin/' ? pathname === '/admin' || pathname === '/admin/' : pathname.startsWith(href.slice(0, -1)));

  return (
    <div className="min-h-svh bg-cream-50 md:grid md:grid-cols-[250px_1fr]">
      <aside className="hidden border-r border-line-soft bg-cream-100/60 md:flex md:flex-col">
        <div className="sticky top-0 flex h-svh flex-col px-4 py-6">
          <Link href="/admin/" className="px-3">
            <Logo />
          </Link>
          <p className="eyebrow mt-1 px-3 !text-[0.62rem]">Team-Bereich</p>
          <nav aria-label="Admin" className="mt-8 flex-1 overflow-y-auto" data-lenis-prevent>
            <ul className="space-y-0.5">
              {nav.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors',
                      isActive(href) ? 'bg-honey-950 text-cream-50' : 'text-muted hover:bg-cream-50 hover:text-honey-950',
                    )}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-1 border-t border-line-soft pt-4 text-sm">
            <p className="px-3 pb-2 text-xs text-muted">Angemeldet: {session.name}</p>
            <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-muted hover:bg-cream-50">
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Zur Website
            </Link>
            <button onClick={() => getAdapter().logout()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-muted hover:bg-cream-50">
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> Abmelden
            </button>
          </div>
        </div>
      </aside>

      {/* Mobil: Kopf + Tab-Leiste */}
      <div className="sticky top-0 z-30 border-b border-line-soft bg-cream-50/95 backdrop-blur-md md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Link href="/admin/">
            <Logo className="text-2xl" />
          </Link>
          <div className="flex items-center">
            <Link href="/" className="grid h-11 w-11 place-items-center text-muted" aria-label="Zur Website">
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
            </Link>
            <button onClick={() => getAdapter().logout()} className="grid h-11 w-11 place-items-center text-muted" aria-label="Abmelden">
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <nav aria-label="Admin" className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn('flex min-h-10 shrink-0 items-center rounded-full px-4 text-sm', isActive(href) ? 'bg-honey-950 text-cream-50' : 'text-muted')}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="min-w-0 px-4 pb-24 pt-6 md:px-10 md:pt-10">{children}</div>
    </div>
  );
}
