'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/ui/drawer';
import type { Inquiry } from '@/data/adapter';
import { InquiryForm } from './inquiry-form';

/** Button öffnet das Anfrage-Formular als Schublade */
export function InquiryButton({ kind, label, title, placeholder, variant = 'primary' }: { kind: Inquiry['kind']; label: string; title: string; placeholder?: string; variant?: 'primary' | 'honey' }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={variant} size="lg" arrow onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={title}>
        <InquiryForm kind={kind} cta="Absenden" placeholder={placeholder} />
      </Drawer>
    </>
  );
}
