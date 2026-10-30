'use client';
// Intro beim ersten Aufruf pro Sitzung: Blume zeichnet sich, blüht auf, blendet in die Seite über.
// Ob es gezeigt wird, entscheidet ein Skript im <head> (Klasse „intro-show“) – so blitzt nichts auf.
// Überspringbar per Klick, Tipp oder Taste. Danach Ereignis „honig:intro-done“ (Hero startet dann).
import { useEffect } from 'react';
import { Logo } from '@/components/layout/logo';
import { MOTION } from '@/lib/motion-config';
import { FlowerOfLife } from './flower-of-life';

/** Inline-Skript für den <head>: Intro nur beim ersten Aufruf der Sitzung */
export const introHeadScript = `try{var k="${MOTION.intro.sessionKey}";if(!sessionStorage.getItem(k)){sessionStorage.setItem(k,"1");var h=document.documentElement;h.classList.add("intro-show");setTimeout(function(){h.classList.remove("intro-show")},${MOTION.intro.maxMs + 1500})}}catch(e){}`;

export function Intro() {
  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains('intro-show')) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      html.classList.add('intro-out');
      window.setTimeout(
        () => {
          html.classList.remove('intro-show', 'intro-out');
          dispatchEvent(new Event('honig:intro-done'));
        },
        reduced ? MOTION.page.reducedMs : MOTION.intro.fadeMs,
      );
    };
    const timer = window.setTimeout(finish, reduced ? 400 : MOTION.intro.maxMs - MOTION.intro.fadeMs);
    addEventListener('pointerdown', finish, { once: true });
    addEventListener('keydown', finish, { once: true });
    return () => {
      window.clearTimeout(timer);
      removeEventListener('pointerdown', finish);
      removeEventListener('keydown', finish);
    };
  }, []);

  return (
    <div className="intro" aria-hidden="true">
      <div className="intro__inner">
        <FlowerOfLife size="min(46vw, 220px)" variant="dark" animate="draw" />
        <Logo light className="intro__logo text-4xl md:text-5xl" />
        <p className="intro__skip">Tippen zum Überspringen</p>
      </div>
    </div>
  );
}
