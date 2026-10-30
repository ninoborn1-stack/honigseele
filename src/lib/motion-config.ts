// Zentrale Animationswerte – hier anpassen, nicht in den Komponenten.
// Nach der nächsten Review-Runde mit Anna und Jamilah nur diese Zahlen ändern.
export const MOTION = {
  /** Intro beim ersten Aufruf pro Sitzung (Blume zeichnet sich, blüht auf, blendet aus) */
  intro: { drawMs: 1100, bloomMs: 350, fadeMs: 350, maxMs: 1800, sessionKey: 'honigseele-intro' },
  /** Seitenwechsel */
  page: { outMs: 200, inMs: 300, offsetPx: 10, reducedMs: 150, veilDelayMs: 350 },
  /** Ladezustand: eine Umdrehung, Atmen */
  pulse: { rotateS: 6, breatheS: 2.4 },
} as const;
