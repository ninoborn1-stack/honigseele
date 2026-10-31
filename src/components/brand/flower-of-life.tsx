// Blume des Lebens – Markenzeichen für Intro, Seitenwechsel und Laden.
// 19 gleich große Kreise (Mitte, 6 im ersten Ring, 12 im zweiten) auf dem Dreiecksgitter mit Abstand r,
// dazu ein umschließender Kreis. Reine Strichzeichnung, wiegt fast nichts, läuft offline.
import { cn } from '@/lib/cn';
import { MOTION } from '@/lib/motion-config';

const R = 10;

/** Mittelpunkte: Ring 0 (1), Ring 1 (6, Abstand r), Ring 2 (6 bei 2r + 6 bei r·√3) */
export const FLOWER_CENTERS: { x: number; y: number; ring: 0 | 1 | 2 }[] = (() => {
  const pts: { x: number; y: number; ring: 0 | 1 | 2 }[] = [{ x: 0, y: 0, ring: 0 }];
  const at = (dist: number, deg: number) => ({ x: +(dist * Math.cos((deg * Math.PI) / 180)).toFixed(4), y: +(dist * Math.sin((deg * Math.PI) / 180)).toFixed(4) });
  for (let k = 0; k < 6; k++) pts.push({ ...at(R, k * 60 - 90), ring: 1 });
  for (let k = 0; k < 6; k++) {
    pts.push({ ...at(2 * R, k * 60 - 90), ring: 2 });
    pts.push({ ...at(R * Math.sqrt(3), k * 60 - 60), ring: 2 });
  }
  return pts;
})();

const F = MOTION.flower;

/** Startwinkel des Strichs: zur Mitte hin (Mittelkreis: oben) */
function startAngle(x: number, y: number): number {
  if (x === 0 && y === 0) return -90;
  return (Math.atan2(y, x) * 180) / Math.PI + 180;
}

/** Verzögerung je Kreis: Mitte, erster Ring nacheinander, zweiter Ring nacheinander */
export function drawDelay(i: number): number {
  const c = FLOWER_CENTERS[i];
  if (c.ring === 0) return F.center;
  if (c.ring === 1) return +(F.ring1 + (i - 1) * F.ring1Step).toFixed(3);
  return +(F.ring2 + (i - 7) * F.ring2Step).toFixed(3);
}

export type FlowerAnimation = 'draw' | 'bloom' | 'pulse' | 'none';

export function FlowerOfLife({
  size = 120,
  variant = 'light',
  animate = 'none',
  label,
  filled,
  current,
  strokeWidth = 0.3,
  className,
}: {
  size?: number | string;
  /** light = auf hellem Grund (Bernstein), dark = auf dunklem Grund (Honiggold) */
  variant?: 'light' | 'dark';
  animate?: FlowerAnimation;
  /** Für Screenreader; ohne Label ist die Grafik dekorativ */
  label?: string;
  /** Kreise zart gefüllt (Überlagerungen werden dichter) */
  filled?: boolean;
  /** Farbe aus currentColor statt aus der Variante */
  current?: boolean;
  /** Strichstärke in Zeichnungseinheiten (Standard 0,3) */
  strokeWidth?: number;
  className?: string;
}) {
  const color = current ? 'currentColor' : variant === 'dark' ? '#D9A54A' : '#B87A1E';
  return (
    <svg
      viewBox={`${-3 * R - 1} ${-3 * R - 1} ${6 * R + 2} ${6 * R + 2}`}
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('fol', `fol--${animate}`, className)}
      fill={filled ? color : 'none'}
      fillOpacity={filled ? 0.16 : undefined}
      stroke={color}
      // In Zeichnungseinheiten (viewBox 62): 0,3 ≈ 1,5 px bei 300 px Größe. Kein non-scaling-stroke –
      // das verfälscht in Chrome zusammen mit pathLength die Strichlänge (Lücken beim Zeichnen).
      strokeWidth={strokeWidth}
    >
      <g className="fol__g">
        {FLOWER_CENTERS.map((c, i) => (
          <circle
            key={i}
            className="fol__c"
            cx={c.x}
            cy={c.y}
            r={R}
            pathLength={1}
            // Strich beginnt am Punkt, der zur Mitte zeigt – so wächst jeder Kreis von innen nach außen
            transform={`rotate(${startAngle(c.x, c.y)} ${c.x} ${c.y})`}
            style={{ ['--ring' as string]: c.ring, ['--i' as string]: i, ['--d' as string]: `${drawDelay(i)}s`, ['--dur' as string]: `${F.circle}s` }}
          />
        ))}
        <circle
          className="fol__c fol__outer"
          cx={0}
          cy={0}
          r={3 * R}
          pathLength={1}
          transform="rotate(-90 0 0)"
          style={{ ['--ring' as string]: 3, ['--i' as string]: 19, ['--d' as string]: `${F.outer}s`, ['--dur' as string]: `${F.outerDur}s` }}
        />
      </g>
    </svg>
  );
}
