import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Field({ label, error, hint, children, className }: { label: string; error?: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-sm font-medium text-honey-950">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger">{error}</span>}
    </label>
  );
}

const inputBase =
  'w-full min-h-12 rounded-xl border border-line bg-card px-4 text-base text-honey-950 placeholder:text-muted/60 transition-colors focus:border-amber-600 focus:outline-none';

export const Input = forwardRef<HTMLInputElement, ComponentProps<'input'>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(inputBase, className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(inputBase, 'min-h-28 py-3', className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<'select'>>(function Select({ className, ...props }, ref) {
  return <select ref={ref} className={cn(inputBase, 'appearance-none pr-10', className)} {...props} />;
});

export function Checkbox({ label, className, ...props }: ComponentProps<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('flex min-h-11 cursor-pointer items-start gap-3 py-2 text-sm', className)}>
      <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-amber-600" {...props} />
      <span>{label}</span>
    </label>
  );
}
