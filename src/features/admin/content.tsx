'use client';
// Texte & Seiten: Admin-editierbare Blöcke, gruppiert nach Seite.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/form';
import { getAdapter } from '@/data';
import type { ContentBlock } from '@/domain/types';
import { useData } from '@/lib/use-data';
import { Loading } from '@/components/ui/loading';
import { AdminTitle, ImageUpload, Notice, Panel, SavedHint } from './ui';

function BlockEditor({ block }: { block: ContentBlock }) {
  const [value, setValue] = useState(block.value);
  const [saved, setSaved] = useState(false);
  const dirty = value !== block.value;
  const save = async (v = value) => {
    await getAdapter().saveBlock({ ...block, value: v });
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };
  return (
    <div className="border-line-soft border-b py-5 last:border-0">
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
          {block.kind === 'richtext' || block.value.length > 70 ? (
            <Textarea
              rows={block.kind === 'richtext' ? 4 : 2}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Input value={value} onChange={(e) => setValue(e.target.value)} />
          )}
        </Field>
      )}
      {(dirty || saved) && (
        <div className="mt-3 flex min-h-14 flex-wrap items-center gap-3">
          {block.kind !== 'image' && dirty && (
            <>
              <Button size="lg" onClick={() => save()}>
                Speichern
              </Button>
              <button
                className="text-muted min-h-12 px-2 text-base underline underline-offset-4"
                onClick={() => setValue(block.value)}
              >
                Rückgängig
              </button>
            </>
          )}
          <SavedHint show={saved && !dirty} />
        </div>
      )}
    </div>
  );
}

export function AdminContent() {
  const { data: blocks } = useData((db) => db.listBlocks(), []);
  if (!blocks) return <Loading label="Texte werden geladen …" />;
  const pages = [...new Set(blocks.map((b) => b.page))];
  return (
    <div>
      <AdminTitle eyebrow="Texte & Seiten" title="Inhalte bearbeiten" />
      <Notice>
        Text ändern, dann „Speichern“ tippen. Die Änderung ist sofort auf der Website zu sehen
        (Demo: nur in diesem Browser). Neue Seiten oder ein anderes Aussehen baut ihr mit Claude.
      </Notice>
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
