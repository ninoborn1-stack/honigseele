'use client';
// Hero: Annas Einstiegsfoto öffnet sich aus einer Blüte zum Vollbild, "seele" steigt Buchstabe für Buchstabe auf.
// Beim Scrollen zieht der Schriftzug weg, "So schön, dass Du da bist." erscheint, das Bild rahmt sich ein.
// Regel: Jede Eigenschaft wird von genau EINER Animation bewegt (Intro: media/img, Scroll: frame/zoom).
// Grundzustand im CSS = fertiger Zustand.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, MapPin, Phone, Star } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Placeholder } from '@/components/ui/badge';
import { SubtleHoneycomb } from '@/components/ui/honeycomb';
import { block, site } from '@/content';
import { useBlock } from '@/lib/use-data';
import { withBase } from '@/lib/config';

const FULL = 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)';
const MASK = `url('${withBase('/images/bloom-mask.svg')}')`;

function BloomLines() {
  return (
    <svg viewBox="0 0 100 100" className="h-[38vmin] w-[38vmin]" fill="none" stroke="currentColor" strokeWidth="0.35" aria-hidden>
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={`o${k}`} className="bloom-path" cx="50" cy="24" rx="15.5" ry="24" transform={`rotate(${k * 72} 50 50)`} pathLength={1} />
      ))}
      {[0, 1, 2, 3, 4].map((k) => (
        <ellipse key={`i${k}`} className="bloom-path" cx="50" cy="31" rx="11" ry="19" transform={`rotate(${k * 72 + 36} 50 50)`} pathLength={1} />
      ))}
      <circle className="bloom-path" cx="50" cy="50" r="6" pathLength={1} />
    </svg>
  );
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useBlock('home.hero.eyebrow', block('home.hero.eyebrow'));
  const lead = useBlock('home.hero.lead', block('home.hero.lead'));
  const second = useBlock('home.hero.second', block('home.hero.second'));
  const image = useBlock('home.hero.image', block('home.hero.image'));
  const [secondA, secondB] = second.includes(',') ? [second.split(',')[0] + ',', second.split(',').slice(1).join(',').trim()] : ['', second];

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.remove('hero-intro');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const small = innerWidth < 761;
    const q = gsap.utils.selector(el);
    const media = q('.hero__media')[0] as HTMLElement;
    let intro: gsap.core.Timeline | null = null;

    const ctx = gsap.context(() => {
      if (!location.hash && html.classList.contains('hero-intro')) {
        scrollTo(0, 0);
        const mask = { size: 0 };
        const setMask = () => {
          media.style.setProperty('-webkit-mask-size', `${mask.size}vmax`);
          media.style.setProperty('mask-size', `${mask.size}vmax`);
        };
        media.style.setProperty('-webkit-mask-image', MASK);
        media.style.setProperty('mask-image', MASK);
        setMask();
        html.classList.remove('hero-intro');
        const header = document.querySelector('[data-site-header]');

        intro = gsap
          .timeline({ defaults: { ease: 'expo.inOut' } })
          // Goldene Blüte zeichnet sich auf Creme
          .fromTo('.hero__bloom', { opacity: 0, rotate: -24, scale: 0.86 }, { opacity: 1, rotate: 0, scale: 1, duration: 1.4, ease: 'expo.out' }, 0)
          .fromTo('.bloom-path', { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, stagger: 0.04, ease: 'power2.inOut' }, 0.05)
          // Das Foto blüht aus der Mitte auf
          .to(mask, { size: small ? 340 : 300, duration: 2.1, onUpdate: setMask }, 0.75)
          .to('.hero__bloom', { scale: small ? 7 : 5, opacity: 0, rotate: 18, duration: 1.6, ease: 'expo.in' }, 0.85)
          .fromTo('.hero__media img', { scale: 1.45 }, { scale: 1.12, duration: 2.6, ease: 'expo.out' }, 0.75)
          .fromTo('.hero__shade', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, 1.8)
          .fromTo('.lockup .ch', { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.06, ease: 'expo.out' }, 1.95)
          .fromTo('.hero__eyebrow > *, .hero__foot > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, ease: 'power3.out' }, 2.2)
          .fromTo('.hero__bar', { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' }, 2.6)
          .eventCallback('onComplete', () => {
            gsap.set(['.hero__bloom', '.bloom-path', '.hero__media img', '.hero__shade', '.ch', '.hero__eyebrow > *', '.hero__foot > *', '.hero__bar'], { clearProps: 'all' });
            ['-webkit-mask-image', 'mask-image', '-webkit-mask-size', 'mask-size'].forEach((p) => media.style.removeProperty(p));
            if (header) gsap.set(header, { clearProps: 'opacity,transform' });
          });
        if (header) intro.fromTo(header, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 2.3);
      } else {
        html.classList.remove('hero-intro');
      }

      // Scroll: nur fromTo mit festen Werten, damit jede Position eindeutig ist
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: el,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
            onUpdate: (s) => s.progress > 0.02 && finishIntro(),
          },
        })
        .fromTo('.hero__zoom', { scale: 1 }, { scale: 0.88, duration: 1 }, 0)
        .fromTo('.hero__content', { yPercent: 0, opacity: 1 }, { yPercent: -14, opacity: 0, duration: 0.38, ease: 'power1.in' }, 0)
        .fromTo('.hero__bar', { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0)
        .fromTo('.hero__second', { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.38)
        .fromTo(
          '.hero__frame',
          { clipPath: FULL },
          {
            clipPath: small ? 'inset(2vh 3vw 2vh 3vw round 6vw 6vw 6vw 6vw)' : 'inset(4vh 3vw 4vh 3vw round 2vw 2vw 2vw 2vw)',
            duration: 0.3,
            ease: 'power2.inOut',
          },
          0.7,
        );
    }, el);

    // Wer während des Intros scrollt oder tippt, bekommt es schnell zu Ende gespielt
    function finishIntro() {
      if (intro && intro.progress() < 1) intro.timeScale(6);
    }
    addEventListener('wheel', finishIntro, { once: true, passive: true });
    addEventListener('touchmove', finishIntro, { once: true, passive: true });
    addEventListener('keydown', finishIntro, { once: true });

    return () => {
      removeEventListener('wheel', finishIntro);
      removeEventListener('touchmove', finishIntro);
      removeEventListener('keydown', finishIntro);
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} className="hero" aria-label="Willkommen">
      <div className="hero__stage">
        <div className="hero__frame">
          <div className="hero__media">
            <div className="hero__zoom">
              <img src={withBase(image)} alt="Ruhiger, sonniger Raum in der Honigseele" fetchPriority="high" />
            </div>
            <div className="hero__shade" />
            <SubtleHoneycomb />
          </div>
        </div>
        <div className="hero__bloom">
          <BloomLines />
        </div>

        <div className="hero__content">
          <p className="hero__eyebrow eyebrow flex flex-wrap items-center justify-center gap-3 text-center !text-cream-50 [text-shadow:0_1px_12px_rgb(28_21_15/0.6)]">
            <span>{eyebrow}</span>
            <i className="hidden h-px w-10 bg-cream-100/50 sm:block" />
            <span>Berlin-Kreuzberg</span>
          </p>
          <h1 className="lockup" aria-label="Honigseele">
            <span className="lockup__honig" aria-hidden>
              {'Honig'.split('').map((c, i) => (
                <span key={i} className="ch">
                  {c}
                </span>
              ))}
            </span>
            <span className="lockup__seele" aria-hidden>
              {'seele'.split('').map((c, i) => (
                <span key={i} className="ch">
                  {c}
                </span>
              ))}
            </span>
          </h1>
          <div className="hero__foot flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <p className="max-w-md text-[1.02rem] leading-relaxed text-cream-50 [text-shadow:0_1px_14px_rgb(28_21_15/0.7)]">{lead}</p>
            <div className="flex gap-3">
              <ButtonLink href="/buchen/" variant="honey" size="lg" data-label="Buchen">
                Termin buchen
              </ButtonLink>
              <span className="hidden sm:block">
                <ButtonLink href="/behandlungen/" variant="light" size="lg">
                  Behandlungen
                </ButtonLink>
              </span>
            </div>
          </div>
        </div>

        <div className="hero__second">
          <p className="font-serif text-[clamp(3rem,9vw,8.5rem)] leading-[0.95] text-cream-50">
            {secondA && <span className="block italic text-honey-300">{secondA}</span>}
            {secondB}
          </p>
        </div>

        <div className="hero__bar hidden border-t border-cream-50/15 text-[0.8rem] text-cream-100/85 md:block">
          <div className="wrap flex items-center justify-between gap-6 py-4">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" strokeWidth={1.5} />{site.location.street} · {site.location.zip} {site.location.city}</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-honey-300 text-honey-300" strokeWidth={1.5} />{site.brand.rating.value.toLocaleString('de-DE')} aus ca. {site.brand.rating.count.toLocaleString('de-DE')} Bewertungen</span>
            <a href={`tel:${site.settings.contact.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-cream-50"><Phone className="h-4 w-4" strokeWidth={1.5} />{site.settings.contact.phone}</a>
            <span className="flex items-center gap-2">Scrollen <ArrowDown className="h-4 w-4 animate-bounce" strokeWidth={1.5} /></span>
          </div>
        </div>
        <Placeholder label="Hier kommt Annas Einstiegsfoto" className="absolute bottom-4 left-4 z-[4] md:bottom-16" />
      </div>
    </section>
  );
}
