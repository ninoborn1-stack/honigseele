'use client';
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { site } from '@/content';
import { getAdapter } from '@/data';
import { legalNav, mainNav } from '@/lib/nav';
import { useData } from '@/lib/use-data';
import { Placeholder } from '../ui/badge';
import { Logo } from './logo';

export function NewsletterForm({ dark }: { dark?: boolean }) {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  if (done) return <p className="font-serif text-xl italic">Danke! Du bekommst bald Post von uns.</p>;
  return (
    <form
      className="flex max-w-md gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await getAdapter().subscribeNewsletter(email);
        setDone(true);
      }}
    >
      <label className="sr-only" htmlFor={`nl-${dark}`}>E-Mail</label>
      <input
        id={`nl-${dark}`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Deine E-Mail"
        className={`min-h-12 flex-1 rounded-full border bg-transparent px-5 text-base focus:outline-none ${dark ? 'border-cream-50/30 placeholder:text-cream-100/50 focus:border-honey-300' : 'border-line placeholder:text-muted/60 focus:border-amber-600'}`}
      />
      <button className={`min-h-12 rounded-full px-5 text-sm font-medium ${dark ? 'bg-honey-400 text-honey-950' : 'bg-honey-950 text-cream-50'}`}>Anmelden</button>
    </form>
  );
}

export function Footer() {
  const pathname = usePathname();
  const { data: settings = site.settings } = useData((db) => db.getSettings(), [], site.settings);
  if (pathname.startsWith('/admin') || pathname.startsWith('/buchen')) return null;
  const c = settings.contact;
  return (
    <footer className="border-t border-line-soft bg-cream-50 pb-28 text-honey-950 md:pb-0">
      <div className="wrap pb-10 pt-24 md:pt-32">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="text-[clamp(3rem,6vw,5.5rem)]" />
            <p className="mt-4 max-w-sm text-muted">{site.brand.claim}. Seit sieben Jahren in Kreuzberg.</p>
            <p className="eyebrow mt-10">Post aus der Honigseele</p>
            <p className="mb-4 mt-2 text-sm text-muted">Neue Kurse, Pflege-Tipps und kleine Überraschungen. Etwa einmal im Monat.</p>
            <NewsletterForm />
          </div>
          <div>
            <p className="eyebrow">Besuch uns</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" strokeWidth={1.5} />{site.location.street}, {site.location.zip} {site.location.city}</li>
              <li><a className="flex min-h-8 items-center gap-3 transition-colors hover:text-amber-600" href={`tel:${c.phone.replace(/\s/g, '')}`}><Phone className="h-4 w-4 text-amber-800" strokeWidth={1.5} />{c.phone}</a></li>
              <li><a className="flex min-h-8 items-center gap-3 transition-colors hover:text-amber-600" href={`mailto:${c.email}`}><Mail className="h-4 w-4 text-amber-800" strokeWidth={1.5} />{c.email}</a></li>
              <li><a className="flex min-h-8 items-center gap-3 transition-colors hover:text-amber-600" href={c.whatsapp} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4 text-amber-800" strokeWidth={1.5} />WhatsApp</a></li>
            </ul>
            <div className="mt-5 flex gap-2">
              <a href={c.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-honey-950/20 transition-colors hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50"><Instagram className="h-4 w-4" strokeWidth={1.5} /></a>
              <a href={c.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full border border-honey-950/20 transition-colors hover:border-honey-950 hover:bg-honey-950 hover:text-cream-50"><Facebook className="h-4 w-4" strokeWidth={1.5} /></a>
            </div>
          </div>
          <div>
            <p className="eyebrow">Öffnungszeiten {settings.openingHoursPlaceholder && <Placeholder className="ml-1" />}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              {settings.openingHours.map((h) => (
                <div key={h.weekday} className="contents">
                  <dt className="text-muted">{h.label}</dt>
                  <dd>{h.open ? `${h.open} – ${h.close}` : 'geschlossen'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-6 border-t border-line-soft pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <nav aria-label="Seiten" className="flex flex-wrap gap-x-6 gap-y-2">
            {mainNav.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="text-honey-950/80 transition-colors hover:text-amber-600">{n.label}</Link>
            ))}
            <Link href="/kontakt/" className="text-honey-950/80 transition-colors hover:text-amber-600">Kontakt</Link>
          </nav>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {legalNav.map((n) => (
              <Link key={n.href} href={n.href} className="transition-colors hover:text-honey-950">{n.label}</Link>
            ))}
            <Link href="/widerruf/#widerrufen" className="transition-colors hover:text-honey-950">Vertrag widerrufen</Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-muted/70">© {new Date().getFullYear()} Honigseele · Anna Kaiser · Stockfotos: Unsplash</p>
      </div>
    </footer>
  );
}
