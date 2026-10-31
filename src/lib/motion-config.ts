// Zentrale Animationswerte – hier anpassen, nicht in den Komponenten.
// Nach der nächsten Review-Runde mit Anna und Jamilah nur diese Zahlen ändern.
export const MOTION = {
  /** Intro beim ersten Aufruf pro Sitzung (Blume zeichnet sich, blüht auf, blendet aus) */
  intro: { drawMs: 1650, holdMs: 450, exitMs: 1000, maxMs: 3100, sessionKey: 'honigseele-intro' },
  /** Zeichnen der Blume (Sekunden): Mitte → erster Ring nacheinander → zweiter Ring → Umkreis */
  flower: { center: 0.05, ring1: 0.25, ring1Step: 0.06, ring2: 0.6, ring2Step: 0.035, outer: 0.95, circle: 0.6, outerDur: 0.7 },
  /** Seitenwechsel */
  page: { outMs: 200, inMs: 300, offsetPx: 10, reducedMs: 150, veilDelayMs: 350 },
  /** Ladezustand: eine Umdrehung, Atmen */
  pulse: { rotateS: 6, breatheS: 2.4 },
} as const;
