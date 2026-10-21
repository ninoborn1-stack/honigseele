'use client';
// Team als Porträt-Galerie: Bogen-Kacheln (später echte Fotos), Filter nach Leistung.
import { useState } from 'react';
import { Placeholder } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import type { Staff, Tone } from '@/domain/types';
import { cn } from '@/lib/cn';
import { withBase } from '@/lib/config';
import { useData } from '@/lib/use-data';

const tiles: Record<Tone, string> = {
  honey: 'bg-[radial-gradient(80%_70%_at_50%_30%,#f1d49c,#d9a54a)] text-honey-950/80',
  cream: 'bg-[radial-gradient(80%_70%_at_50%_30%,#fbf7f0,#e6d6bc)] text-honey-950/70',
  amber: 'bg-[radial-gradient(80%_70%_at_50%_30%,#d9a54a,#8a5a12)] text-cream-50/90',
  sand: 'bg-[radial-gradient(80%_70%_at_50%_30%,#efe4d2,#cdb894)] text-honey-950/70',
  sage: 'bg-[radial-gradient(80%_70%_at_50%_30%,#e5e7d6,#c9cdb4)] text-honey-950/70',
};

export function TeamGrid({ initialStaff }: { initialStaff: Staff[] }) {
  const { data: staff = initialStaff } = useData((db) => db.listStaff(), [], initialStaff);
  const visible = staff.filter((s) => s.visible);
  const skills = ['Alle', ...new Set(visible.flatMap((s) => s.skills))];
  const [skill, setSkill] = useState('Alle');
  const list = visible.filter((s) => skill === 'Alle' || s.skills.includes(skill));
  return (
    <div>
      <div role="tablist" className="no-scrollbar -mx-[clamp(1.25rem,3.5vw,4rem)] flex gap-2 overflow-x-auto px-[clamp(1.25rem,3.5vw,4rem)] md:mx-0 md:flex-wrap md:justify-center md:px-0">
        {skills.map((s) => (
          <button
            key={s}
            role="tab"
            aria-selected={skill === s}
            onClick={() => setSkill(s)}
            className={cn('min-h-11 shrink-0 rounded-full border px-5 text-sm transition-colors', skill === s ? 'border-honey-950 bg-honey-950 text-cream-50' : 'border-line text-muted hover:border-honey-950 hover:text-honey-950')}
          >
            {s}
          </button>
        ))}
      </div>
      <ul key={skill} className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-3 md:gap-x-8 lg:grid-cols-4 lg:gap-x-10 lg:gap-y-20">
        {list.map((s, i) => (
          <Reveal as="li" key={s.id} delay={(i % 4) * 90} className="group">
            <div className={cn('relative aspect-[3/4] overflow-hidden rounded-t-full', tiles[s.avatarTone])}>
              {s.photo ? (
                <img src={withBase(s.photo)} alt={s.name} className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105" />
              ) : (
                <span aria-hidden className="absolute inset-0 grid place-items-center pt-[12%] font-serif text-[clamp(4rem,9vw,8rem)] italic transition-transform duration-[1.4s] ease-[var(--ease-soft)] group-hover:scale-105">
                  {s.name[0]}
                </span>
              )}
            </div>
            <p className="mt-5 font-serif text-[clamp(1.6rem,2.2vw,2.3rem)] leading-none">{s.name}</p>
            {s.title && <p className="mt-1.5 font-serif text-lg italic text-amber-600">{s.title}</p>}
            <p className="mt-3 text-xs font-medium uppercase leading-relaxed tracking-[0.14em] text-muted">{s.role}</p>
            {s.bioPlaceholder ? (
              <p className="mt-3 hidden text-sm text-muted md:block">
                Porträt folgt <Placeholder className="ml-1" />
              </p>
            ) : (
              <p className="mt-3 hidden text-sm text-muted md:block">{s.bio}</p>
            )}
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
