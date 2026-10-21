'use client';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Placeholder } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import type { Staff } from '@/domain/types';
import { cn } from '@/lib/cn';
import { useData } from '@/lib/use-data';

export function TeamGrid({ initialStaff }: { initialStaff: Staff[] }) {
  const { data: staff = initialStaff } = useData((db) => db.listStaff(), [], initialStaff);
  const visible = staff.filter((s) => s.visible);
  const skills = ['Alle', ...new Set(visible.flatMap((s) => s.skills))];
  const [skill, setSkill] = useState('Alle');
  const list = visible.filter((s) => skill === 'Alle' || s.skills.includes(skill));
  return (
    <div>
      <div role="tablist" className="no-scrollbar -mx-[clamp(1.25rem,3.5vw,4rem)] flex gap-2 overflow-x-auto px-[clamp(1.25rem,3.5vw,4rem)] md:mx-0 md:flex-wrap md:px-0">
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
      <ul key={skill} className="mt-14 grid gap-x-10 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {list.map((s, i) => (
          <Reveal as="li" key={s.id} delay={(i % 4) * 80} className="group border-t border-honey-950/20 pt-8">
            <div className="flex items-center gap-6">
              <Avatar name={s.name} tone={s.avatarTone} size="lg" className="!h-28 !w-28 text-5xl transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-105" />
              <div>
                <p className="font-serif text-4xl leading-none">{s.name}</p>
                {s.title && <p className="mt-2 font-serif text-xl italic text-amber-600">{s.title}</p>}
              </div>
            </div>
            <p className="mt-6 text-sm font-medium uppercase tracking-[0.12em]">{s.role}</p>
            <p className="mt-3 text-muted">
              {s.bio} {s.bioPlaceholder && <Placeholder className="ml-1" />}
            </p>
            <p className="mt-4 text-xs tracking-[0.2em] text-muted">{s.languages.join(' · ')}</p>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
