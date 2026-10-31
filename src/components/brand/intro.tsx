'use client';
// Intro beim ersten Aufruf pro Sitzung:
// 1. Die Blume des Lebens zeichnet sich wie eine Konstruktion (Mitte → Ringe → Umkreis), schwingt in Position
// 2. Warmer Goldschein, der Schriftzug steigt ein
// 3. Durchgang: Die Blume wächst über den Bildschirm, der dunkle Grund verschwindet.
//    Auf der Startseite öffnet sich im selben Moment das Foto aus der Blume (Ereignis „honig:intro-done“).
// Ob es gezeigt wird, entscheidet ein Skript im <head> (Klasse „intro-show“) – so blitzt nichts auf.
// Überspringbar per Klick, Tipp oder Taste. Alle Zeiten in src/lib/motion-config.ts.
import { useEffect } from 'react';
import { Logo } from '@/components/layout/logo';
import { MOTION } from '@/lib/motion-config';
import { FlowerOfLife } from './flower-of-life';

const I = MOTION.intro;

/** Inline-Skript für den <head>: Intro nur beim ersten Aufruf der Sitzung (mit Sicherheitsnetz) */
export const introHeadScript = `try{var k="${I.sessionKey}";if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");var h=document.documentElement;h.classList.add("intro-show","intro-handoff");setTimeout(function(){h.classList.remove("intro-show","intro-out")},${I.maxMs + 1500})}}catch(e){}`;

export function Intro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('intro-show')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    let cleanup = 0;
    const finish = () => {
      if (done) return;
      done = true;
      html.classList.add('intro-out');
      // Hero (falls vorhanden) startet sofort – das Foto öffnet sich, während die Blume hindurchführt
      dispatchEvent(new Event('honig:intro-done'));
      if (!document.querySelector('.hero')) html.classList.remove('intro-handoff');
      cleanup = window.setTimeout(() => html.classList.remove('intro-show', 'intro-out'), reduced ? MOTION.page.reducedMs : I.exitMs);
    };
    const timer = window.setTimeout(finish, reduced ? 400 : I.drawMs + I.holdMs);
    addEventListener('pointerdown', finish, { once: true });
    addEventListener('keydown', finish, { once: true });
    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(cleanup);
      removeEventListener('pointerdown', finish);
      removeEventListener('keydown', finish);
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
