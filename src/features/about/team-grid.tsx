'use client';
import { useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Placeholder } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import type { Staff } from '@/domain/types';
import { useData } from '@/lib/use-data';

export function TeamGrid({ initialStaff }: { initialStaff: Staff[] }) {
  const { data: staff = initialStaff } = useData((db) => db.listStaff(), [], initialStaff);
  const visible = staff.filter((s) => s.visible);
  const skills = ['Alle', ...new Set(visible.flatMap((s) => s.skills))];
  const [skill, setSkill] = useState('Alle');
  const list = visible.filter((s) => skill === 'Alle' || s.skills.includes(skill));
  return (
    <div>
      <Tabs value={skill} onChange={setSkill} options={skills.map((s) => ({ value: s, label: s }))} />
      <ul className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((s) => (
          <li key={s.id} className="border-t border-line pt-6">
            <div className="flex items-center gap-5">
              <Avatar name={s.name} tone={s.avatarTone} size="lg" className="!h-24 !w-24" />
              <div>
                <p className="font-serif text-3xl leading-tight">{s.name}</p>
                {s.title && <p className="font-serif text-lg italic text-amber-600">{s.title}</p>}
              </div>
            </div>
            <p className="mt-4 text-sm font-medium">{s.role}</p>
            <p className="mt-2 text-sm text-muted">
              {s.bio} {s.bioPlaceholder && <Placeholder className="ml-1" />}
            </p>
            <p className="mt-3 text-xs tracking-widest text-muted">{s.languages.join(' · ')}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
