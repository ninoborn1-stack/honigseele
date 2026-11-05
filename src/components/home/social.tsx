'use client';
// Google-Bewertungen und Instagram: werden erst nach Klick geladen (Datenschutz, Ladezeit).
// Im Demo-Modus Platzhalter-Daten aus content/site.json; die Live-Anbindung folgt
// (Google Places API bzw. Instagram Graph API über eine Edge Function, nie direkt aus dem Browser).
import { ExternalLink, Instagram, Star } from 'lucide-react';
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { ButtonLink, Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { Photo } from '@/components/ui/photo';
import { Eyebrow, Title } from '@/components/ui/typography';
import { site } from '@/content';

/** Kurze, sichtbare Wartezeit wie bei einem echten Abruf */
const fakeFetch = () => new Promise((r) => setTimeout(r, 700));

export function GoogleReviews() {
  const g = site.google;
  const [state, setState] = useState<'idle' | 'loading' | 'shown'>('idle');
  const load = async () => {
    setState('loading');
    await fakeFetch();
    setState('shown');
  };
  return (
    <div className="mt-20 w-full max-w-5xl" aria-busy={state === 'loading'}>
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-line-soft bg-card px-6 py-10 text-center">
          <p className="font-serif text-2xl">Was Kund*innen bei Google schreiben</p>
          <p className="max-w-md text-sm text-muted">Beim Anzeigen werden Bewertungen von Google geladen. Dabei kann Google Daten wie Deine IP-Adresse erhalten.</p>
          <Button variant="ghost" onClick={load}>
            Google-Bewertungen anzeigen
          </Button>
        </div>
      )}
      {state === 'loading' && <Loading label="Bewertungen werden geladen …" />}
      {state === 'shown' && (
        <div className="animate-fade">
          <ul className="grid gap-4 md:grid-cols-3">
            {g.reviews.map((r) => (
              <li key={r.author} className="flex flex-col rounded-[1.5rem] border border-line-soft bg-card p-6 text-left">
                <span className="flex gap-0.5 text-amber-600" aria-label={`${r.rating} von 5 Sternen`}>
                  {Array.from({ length: r.rating }, (_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" strokeWidth={1} />
                  ))}
                </span>
                <p className="mt-4 flex-1 font-serif text-xl leading-snug">„{r.text}“</p>
                <p className="mt-5 text-sm">
                  <span className="font-medium">{r.author}</span> <span className="text-muted">· {r.date}</span>
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <span>
              Bewertungen von <span className="font-medium text-honey-950">Google</span>
            </span>
            <a href={g.profileUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 underline decoration-line underline-offset-4 hover:text-honey-950">
              Zum Google-Profil <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </a>
            {g.placeholder && <Placeholder label="Beispieldaten · Live-Anbindung folgt" />}
          </div>
        </div>
      )}
    </div>
  );
}

export function InstagramFeed() {
  const ig = site.instagram;
  const [state, setState] = useState<'idle' | 'loading' | 'shown'>('idle');
  const load = async () => {
    setState('loading');
    await fakeFetch();
    setState('shown');
  };
  return (
    <section className="bg-cream-50 py-24 md:py-32" aria-busy={state === 'loading'}>
      <div className="wrap">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Instagram</Eyebrow>
            <Title className="mt-6">Einblicke aus der *Honigseele*.</Title>
          </div>
          <ButtonLink href={ig.url} variant="ghost" arrow>
            <Instagram className="h-4 w-4" strokeWidth={1.5} /> {ig.handle}
          </ButtonLink>
        </div>
        <div className="mt-12">
          {state === 'idle' && (
            <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-line-soft bg-card px-6 py-12 text-center">
              <p className="max-w-md text-sm text-muted">Beim Anzeigen werden Beiträge von Instagram geladen. Dabei kann Meta Daten wie Deine IP-Adresse erhalten.</p>
              <Button variant="ghost" onClick={load}>
                Instagram-Beiträge anzeigen
              </Button>
            </div>
          )}
          {state === 'loading' && <Loading label="Beiträge werden geladen …" />}
          {state === 'shown' && (
            <div className="animate-fade">
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
                {ig.tiles.map((key) => (
                  <li key={key}>
                    <a href={ig.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl" aria-label={`Beitrag auf Instagram ansehen`}>
                      <Photo src={key} sizes="(min-width: 1024px) 16vw, 50vw" className="aspect-square" imgClassName="transition-transform duration-700 group-hover:scale-105" />
                    </a>
                  </li>
                ))}
              </ul>
                          </div>
          )}
        </div>
      </div>
    </section>
  );
}
