import { HONEYCOMB } from '@/lib/config';

/**
 * Optionales, kaum sichtbares Wabenmuster. Standard: aus (NEXT_PUBLIC_HONEYCOMB=false).
 * Einzige erlaubte Verwendung von Waben auf der Website.
 */
export function SubtleHoneycomb({ force }: { force?: boolean }) {
  if (!HONEYCOMB && !force) return null;
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.06] [mask-image:radial-gradient(70%_60%_at_50%_40%,black,transparent)]"
    >
      <defs>
        <pattern id="hc" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(0.9)">
          <path d="M28 0 56 16v32L28 64 0 48V16zM28 64v33" fill="none" stroke="#f1d49c" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hc)" />
    </svg>
  );
}
