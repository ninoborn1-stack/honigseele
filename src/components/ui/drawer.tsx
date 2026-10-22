'use client';
import { X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/cn';

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = 'right',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: 'right' | 'bottom';
}) {
  // Ins <body> rendern, damit Eltern mit backdrop-filter/transform die Schublade nicht einsperren
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!mounted) return null;
  return createPortal(
    <div className={cn('fixed inset-0 z-[120]', open ? 'pointer-events-auto' : 'pointer-events-none')} aria-hidden={!open}>
      <div
        className={cn('absolute inset-0 bg-honey-950/40 backdrop-blur-[2px] transition-opacity duration-500', open ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'absolute flex flex-col bg-cream-50 shadow-2xl transition-transform duration-500 ease-[var(--ease-soft)]',
          side === 'right'
            ? 'inset-y-0 right-0 w-full max-w-md'
            : 'inset-x-0 bottom-0 max-h-[88svh] rounded-t-3xl',
          open ? 'translate-x-0 translate-y-0' : side === 'right' ? 'translate-x-full' : 'translate-y-full',
        )}
      >
        <header className="pt-safe flex items-center justify-between border-b border-line-soft px-6 py-4">
          <h2 className="text-3xl">{title}</h2>
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full hover:bg-cream-100" aria-label="Schließen">
            <X strokeWidth={1.5} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5" data-lenis-prevent>
          {children}
        </div>
        {footer && <footer className="pb-safe border-t border-line-soft px-6 py-4">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}
