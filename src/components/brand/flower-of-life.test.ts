import { describe, expect, it } from 'vitest';
import { FLOWER_CENTERS } from './flower-of-life';

describe('Blume des Lebens', () => {
  it('hat 19 Kreise: 1 Mitte, 6 im ersten Ring, 12 im zweiten', () => {
    expect(FLOWER_CENTERS).toHaveLength(19);
    expect(FLOWER_CENTERS.filter((c) => c.ring === 0)).toHaveLength(1);
    expect(FLOWER_CENTERS.filter((c) => c.ring === 1)).toHaveLength(6);
    expect(FLOWER_CENTERS.filter((c) => c.ring === 2)).toHaveLength(12);
  });

  it('liegt auf dem Dreiecksgitter: jeder Mittelpunkt hat einen Nachbarn im Abstand r, keiner ist näher', () => {
    const d = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);
    for (const a of FLOWER_CENTERS) {
      const others = FLOWER_CENTERS.filter((b) => b !== a).map((b) => d(a, b));
      expect(Math.min(...others)).toBeCloseTo(10, 3);
    }
  });

  it('passt in den umschließenden Kreis mit Radius 3r', () => {
    for (const c of FLOWER_CENTERS) expect(Math.hypot(c.x, c.y) + 10).toBeLessThanOrEqual(30.0001);
  });
});
