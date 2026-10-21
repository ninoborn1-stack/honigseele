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
    <footer className="honey-glow on-dark pb-28 text-cream-100 md:pb-0">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-20 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo light className="text-4xl" />
            <p className="mt-4 max-w-sm text-cream-100/75">{site.brand.claim}. Seit sieben Jahren in Kreuzberg.</p>
            <p className="eyebrow mt-10">Post aus der Honigseele</p>
            <p className="mb-4 mt-2 text-sm text-cream-100/70">Neue Kurse, Pflege-Tipps und kleine Überraschungen. Etwa einmal im Monat.</p>
            <NewsletterForm dark />
          </div>
          <div>
            <p className="eyebrow">Besuch uns</p>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.5} />{site.location.street}, {site.location.zip} {site.location.city}</li>
              <li><a className="flex min-h-8 items-center gap-3 hover:text-cream-50" href={`tel:${c.phone.replace(/\s/g, '')}`}><Phone className="h-4 w-4" strokeWidth={1.5} />{c.phone}</a></li>
              <li><a className="flex min-h-8 items-center gap-3 hover:text-cream-50" href={`mailto:${c.email}`}><Mail className="h-4 w-4" strokeWidth={1.5} />{c.email}</a></li>
              <li><a className="flex min-h-8 items-center gap-3 hover:text-cream-50" href={c.whatsapp} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" strokeWidth={1.5} />WhatsApp</a></li>
            </ul>
            <div className="mt-5 flex gap-2">
              <a href={c.instagram} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-cream-50/20 hover:border-honey-300"><Instagram className="h-4 w-4" strokeWidth={1.5} /></a>
              <a href={c.facebook} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full border border-cream-50/20 hover:border-honey-300"><Facebook className="h-4 w-4" strokeWidth={1.5} /></a>
            </div>
          </div>
          <div>
            <p className="eyebrow">Öffnungszeiten {settings.openingHoursPlaceholder && <Placeholder className="ml-1" />}</p>
            <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              {settings.openingHours.map((h) => (
                <div key={h.weekday} className="contents">
                  <dt className="text-cream-100/70">{h.label}</dt>
                  <dd>{h.open ? `${h.open} – ${h.close}` : 'geschlossen'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-6 border-t border-cream-50/15 pt-8 text-sm md:flex-row md:items-center md:justify-between">
          <nav aria-label="Seiten" className="flex flex-wrap gap-x-6 gap-y-2">
            {mainNav.slice(1).map((n) => (
              <Link key={n.href} href={n.href} className="text-cream-100/80 hover:text-cream-50">{n.label}</Link>
            ))}
            <Link href="/kontakt/" className="text-cream-100/80 hover:text-cream-50">Kontakt</Link>
          </nav>
          <nav aria-label="Rechtliches" className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-cream-100/60">
            {legalNav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-cream-50">{n.label}</Link>
            ))}
            <Link href="/widerruf/#widerrufen" className="hover:text-cream-50">Vertrag widerrufen</Link>
          </nav>
        </div>
        <p className="mt-6 text-xs text-cream-100/40">© {new Date().getFullYear()} Honigseele · Anna Kaiser · Stockfotos: Unsplash</p>
      </div>
    </footer>
  );
}
