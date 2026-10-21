'use client';
// Texte & Seiten: Admin-editierbare Blöcke, gruppiert nach Seite.
import { Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { ContentBlock } from '@/domain/types';
import { useData } from '@/lib/use-data';
import { AdminTitle, ImageUpload, Notice, Panel } from './ui';

function BlockEditor({ block }: { block: ContentBlock }) {
  const [value, setValue] = useState(block.value);
  const [saved, setSaved] = useState(false);
  const dirty = value !== block.value;
  const save = async (v = value) => {
    await getAdapter().saveBlock({ ...block, value: v });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };
  return (
    <div className="border-b border-line-soft py-5 last:border-0">
      {block.kind === 'image' ? (
        <Field label={block.label}>
          <ImageUpload
            value={value}
            onChange={(v) => {
              setValue(v);
              void save(v);
            }}
          />
        </Field>
      ) : (
        <Field label={block.label}>
          {block.kind === 'richtext' || block.value.length > 70 ? <Textarea rows={block.kind === 'richtext' ? 4 : 2} value={value} onChange={(e) => setValue(e.target.value)} /> : <Input value={value} onChange={(e) => setValue(e.target.value)} />}
        </Field>
      )}
      <div className="mt-2 flex h-10 items-center gap-3">
        {block.kind !== 'image' && (
          <Button size="sm" variant={dirty ? 'primary' : 'ghost'} disabled={!dirty} onClick={() => save()}>
            Speichern
          </Button>
        )}
        {dirty && block.kind !== 'image' && (
          <button className="text-xs text-muted underline" onClick={() => setValue(block.value)}>
            Verwerfen
          </button>
        )}
        {saved && (
          <span className="flex items-center gap-1 text-xs text-success">
            <Check className="h-3.5 w-3.5" /> Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}

export function AdminContent() {
  const { data: blocks } = useData((db) => db.listBlocks(), []);
  if (!blocks) return null;
  const pages = [...new Set(blocks.map((b) => b.page))];
  return (
    <div>
      <AdminTitle eyebrow="Texte & Seiten" title="Inhalte bearbeiten" />
      <Notice>Änderungen sind sofort auf der Website sichtbar (Demo: nur in diesem Browser). Struktur und Design ändert ihr mit Claude im Code.</Notice>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {pages.map((page) => (
          <Panel key={page} title={page}>
            {blocks
              .filter((b) => b.page === page)
              .map((b) => (
                <BlockEditor key={b.id} block={b} />
              ))}
          </Panel>
        ))}
      </div>
    </div>
  );
}
