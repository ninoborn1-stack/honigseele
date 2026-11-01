'use client';
// Intro beim ersten Aufruf pro Sitzung:
// 1. Die Blume des Lebens zeichnet sich wie eine Konstruktion (Mitte → Ringe → Umkreis), schwingt in Position
// 2. Warmer Goldschein, der Schriftzug steigt ein
// 3. Durchgang: Die Blume wächst über den Bildschirm, der dunkle Grund verschwindet.
// Alles läuft per CSS ab Seitenbeginn (Klasse „intro-show“ setzt ein Skript im <head>) – auch wenn
// JavaScript am Handy spät kommt, bleibt der Ablauf gleich. JavaScript macht nur Überspringen und Aufräumen.
// Der Hero richtet sich nach derselben Uhr (window.__honigIntro) und startet zum Durchgang.
import { useEffect } from 'react';
import { Logo } from '@/components/layout/logo';
import { MOTION } from '@/lib/motion-config';
import { FlowerOfLife } from './flower-of-life';

const I = MOTION.intro;
const EXIT_AT = I.drawMs + I.holdMs;

declare global {
  interface Window {
    /** Startzeit des Intros (performance.now) – gesetzt im <head> */
    __honigIntro?: number;
  }
}

/** Zeitpunkt (performance.now), an dem der Durchgang beginnt; null, wenn kein Intro läuft */
export function introExitAt(): number | null {
  if (!document.documentElement.classList.contains('intro-show')) return null;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return (window.__honigIntro ?? 0) + (reduced ? 500 : EXIT_AT);
}

/** Inline-Skript für den <head>: Intro nur beim ersten Aufruf der Sitzung (mit Sicherheitsnetz) */
export const introHeadScript = `try{var k="${I.sessionKey}";if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");window.__honigIntro=performance.now();var h=document.documentElement;h.classList.add("intro-show","intro-handoff");setTimeout(function(){h.classList.remove("intro-show","intro-skip")},${EXIT_AT + I.exitMs + 1500})}}catch(e){}`;

export function Intro() {
  useEffect(() => {
    const html = document.documentElement;
    const exitAt = introExitAt();
    if (exitAt === null) return;
    let cleanup = 0;
    const end = () => {
      html.classList.remove('intro-show', 'intro-skip');
      if (!document.querySelector('.hero')) html.classList.remove('intro-handoff');
    };
    // Aufräumen, wenn der Durchgang vorbei ist (gleiche Uhr wie das CSS)
    cleanup = window.setTimeout(end, Math.max(0, exitAt + I.exitMs - performance.now()));
    const skip = () => {
      if (performance.now() >= exitAt) return;
      html.classList.add('intro-skip');
      dispatchEvent(new Event('honig:intro-skip'));
      window.clearTimeout(cleanup);
      cleanup = window.setTimeout(end, 400);
    };
    addEventListener('pointerdown', skip, { once: true });
    addEventListener('keydown', skip, { once: true });
    return () => {
      window.clearTimeout(cleanup);
      removeEventListener('pointerdown', skip);
      removeEventListener('keydown', skip);
    };
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__bg" />
      <div className="intro__glow" />
      <div className="intro__inner">
        <div className="intro__stage">
          <FlowerOfLife size="min(58vw, 300px)" variant="dark" animate="draw" strokeWidth={0.32} />
        </div>
        <Logo light className="intro__logo text-4xl md:text-5xl" />
      </div>
      <p className="intro__skip">Tippen zum Überspringen</p>
    </div>
  );
}
