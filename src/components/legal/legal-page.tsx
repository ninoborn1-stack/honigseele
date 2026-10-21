import type { ReactNode } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Eyebrow, Section } from '@/components/ui/typography';
import { site } from '@/content';

/** Rechtstext-Platzhalter. Echte Texte kommen von Anna bzw. aus einem Rechtstext-Dienst. */
export function LegalPage({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Section tone="light">
      <div className="max-w-4xl">
        <Eyebrow>Rechtliches</Eyebrow>
        <h1 className="mt-8 text-[clamp(3rem,7vw,7.5rem)] leading-[0.95]">{title}</h1>
        <div className="mt-8 rounded-2xl border border-dashed border-amber-600/60 bg-card p-6">
          <Placeholder label="Rechtstext folgt" />
          <p className="mt-3 text-muted">Dieser Text wird vor dem Livegang durch den geprüften Rechtstext ersetzt (z. B. über einen Rechtstext-Dienst mit automatischen Updates).</p>
        </div>
        <div className="mt-10 space-y-5 text-muted [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:text-honey-950">
          {children}
          <p>
            Honigseele · {site.brand.owner} · {site.location.street}, {site.location.zip} {site.location.city} · {site.settings.contact.phone} · {site.settings.contact.email}
          </p>
        </div>
      </div>
    </Section>
  );
}
