import { cn } from '@/lib/cn';

/** Die Blüte aus der Hero-Animation als Grafik – gefüllt oder nur als Linie */
export function Bloom({ outline, className }: { outline?: boolean; className?: string }) {
  const paint = outline ? { fill: 'none', stroke: 'currentColor', strokeWidth: 0.5 } : { fill: 'currentColor' };
  return (
    <svg viewBox="0 0 100 100" className={cn('shrink-0', className)} aria-hidden {...paint}>
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={`o${k}`} cx="50" cy="24" rx="15.5" ry="24" transform={`rotate(${k * 72} 50 50)`} />
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={`i${k}`} cx="50" cy="31" rx="11" ry="19" transform={`rotate(${k * 72 + 36} 50 50)`} opacity={outline ? 1 : 0.6} />
      ))}
      <circle cx="50" cy="50" r={outline ? 6 : 7} />
    </svg>
  );
}
