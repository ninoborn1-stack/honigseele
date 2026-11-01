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
import { block, site } from '@/content';
import { useBlock } from '@/lib/use-data';
import { withBase } from '@/lib/config';
import { imageUrl, srcSetOf } from '@/components/ui/photo';
import { resolveImage } from '@/content/images';
import { preload } from 'react-dom';
import { FlowerOfLife } from '@/components/brand/flower-of-life';
import { introExitAt } from '@/components/brand/intro';

const FULL = 'inset(0% 0% 0% 0% round 0vw 0vw 0vw 0vw)';
// Maske aus den 19 Kreisen der Blume des Lebens – das Foto öffnet sich aus der Blume
const MASK = `url('${withBase('/images/flower-mask.svg')}')`;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const eyebrow = useBlock('home.hero.eyebrow', block('home.hero.eyebrow'));
  const lead = useBlock('home.hero.lead', block('home.hero.lead'));
  const second = useBlock('home.hero.second', block('home.hero.second'));
  const image = useBlock('home.hero.image', block('home.hero.image'));
  // Beim ersten Scroll blendet das Ladenbild weich ins Massage-Bild über (Massagen = Number One)
  const image2 = useBlock('home.hero.image2', block('home.hero.image2'));
  // Großes Bild sofort laden (wichtigstes Bild der Seite), in passender Größe
  const heroEntry = resolveImage(image);
  preload(imageUrl(image), { as: 'image', imageSrcSet: srcSetOf(heroEntry), imageSizes: '100vw', fetchPriority: 'high' });
  const [secondA, secondB] = second.includes(',')
    ? [second.split(',')[0] + ',', second.split(',').slice(1).join(',').trim()]
    : ['', second];

  useEffect(() => {
    const el = root.current;
    const html = document.documentElement;
    if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.classList.remove('hero-intro', 'intro-handoff');
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    // Ein- und Ausblenden der Adressleiste (iOS/Android) löst keine Neuberechnung aus – sonst springt der Hero
    ScrollTrigger.config({ ignoreMobileResize: true });
    const small = innerWidth < 761;
    const q = gsap.utils.selector(el);
    const media = q('.hero__media')[0] as HTMLElement;
    let intro: gsap.core.Timeline | null = null;
    let handoffTimer = 0;
    let onSkip: (() => void) | null = null;

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
          .fromTo(
            '.hero__bloom',
            { opacity: 0, rotate: -24, scale: 0.86 },
            { opacity: 1, rotate: 0, scale: 1, duration: 1.4, ease: 'expo.out' },
            0,
          )
          .fromTo(
            '.hero__bloom .fol__c',
            { strokeDasharray: 1, strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              duration: 0.55,
              // gleiche Reihenfolge wie im Intro: Mitte → Ringe → Umkreis (Verzögerung aus MOTION.flower)
              stagger: (_i: number, el: Element) => parseFloat((el as HTMLElement).style.getPropertyValue('--d')) * 0.75,
              ease: 'power2.inOut',
            },
            0.05,
          )
          // Das Foto blüht aus der Mitte auf
          .to(mask, { size: small ? 340 : 300, duration: 2.1, onUpdate: setMask }, 0.75)
          .to(
            '.hero__bloom',
            { scale: small ? 7 : 5, opacity: 0, rotate: 18, duration: 1.6, ease: 'expo.in' },
            0.85,
          )
          .fromTo(
            '.hero__media img',
            { scale: 1.45 },
            { scale: 1.12, duration: 2.6, ease: 'expo.out' },
            0.75,
          )
          .fromTo(
            '.hero__shade',
            { opacity: 0 },
            { opacity: 1, duration: 1.2, ease: 'power2.out' },
            1.8,
          )
          .fromTo(
            '.lockup .ch',
            { yPercent: 115 },
            { yPercent: 0, duration: 1.4, stagger: 0.06, ease: 'expo.out' },
            1.95,
          )
          .fromTo(
            '.hero__eyebrow > *, .hero__foot > *',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 1.1, ease: 'power3.out' },
            2.2,
          )
          .fromTo(
            '.hero__bar',
            { opacity: 0 },
            { opacity: 1, duration: 1, ease: 'power2.out' },
            2.6,
          )
          .eventCallback('onComplete', () => {
            html.classList.remove('intro-handoff');
            gsap.set(
              [
                '.hero__bloom',
                '.hero__bloom .fol__c',
                '.hero__media img',
                '.hero__shade',
                '.ch',
                '.hero__eyebrow > *',
                '.hero__foot > *',
                '.hero__bar',
              ],
              { clearProps: 'all' },
            );
            ['-webkit-mask-image', 'mask-image', '-webkit-mask-size', 'mask-size'].forEach((p) =>
              media.style.removeProperty(p),
            );
            if (header) gsap.set(header, { clearProps: 'opacity,transform' });
          });
        if (header)
          intro.fromTo(
            header,
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' },
            2.3,
          );
        // Läuft gerade das Blumen-Intro (erster Besuch): Hero startet genau zum Durchgang –
        // nach derselben Uhr wie das Intro, nicht nach einem Signal (das am Handy verpasst werden könnte).
        const exitAt = introExitAt();
        if (exitAt !== null) {
          const timeline = intro;
          timeline.pause();
          // Foto öffnet sich aus der Größe der Intro-Blume (Durchmesser min(58vw, 300px))
          mask.size = (Math.min(innerWidth * 0.58, 300) / Math.max(innerWidth, innerHeight)) * 100;
          setMask();
          const go = () => {
            window.clearTimeout(handoffTimer);
            if (onSkip) removeEventListener('honig:intro-skip', onSkip);
            timeline.play(0.75);
          };
          onSkip = go;
          handoffTimer = window.setTimeout(go, Math.max(0, exitAt - performance.now()));
          addEventListener('honig:intro-skip', go, { once: true });
        }
      } else {
        html.classList.remove('hero-intro', 'intro-handoff');
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
        .fromTo('.hero__img2', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.inOut' }, 0.12)
        .fromTo(
          '.hero__content',
          { yPercent: 0, opacity: 1 },
          { yPercent: -14, opacity: 0, duration: 0.38, ease: 'power1.in' },
          0,
        )
        .fromTo('.hero__bar', { opacity: 1 }, { opacity: 0, duration: 0.2 }, 0)
        .fromTo(
          '.hero__second',
          { autoAlpha: 0, y: 70 },
          { autoAlpha: 1, y: 0, duration: 0.25, ease: 'power2.out' },
          0.38,
        )
        .fromTo(
          '.hero__frame',
          { clipPath: FULL },
          {
            clipPath: small
              ? 'inset(2vh 3vw 2vh 3vw round 6vw 6vw 6vw 6vw)'
              : 'inset(4vh 3vw 4vh 3vw round 2vw 2vw 2vw 2vw)',
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
      window.clearTimeout(handoffTimer);
      if (onSkip) removeEventListener('honig:intro-skip', onSkip);
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
              <img
                src={imageUrl(image)}
                srcSet={srcSetOf(heroEntry)}
                sizes="100vw"
                width={heroEntry.width}
                height={heroEntry.height}
                alt="Ruhiger, sonniger Raum in der Honigseele"
                fetchPriority="high"
              />
              <img
                className="hero__img2"
                src={imageUrl(image2)}
                srcSet={srcSetOf(resolveImage(image2))}
                sizes="100vw"
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="hero__shade" />
          </div>
        </div>
        <div className="hero__bloom">
          <FlowerOfLife size="38vmin" variant="light" />
        </div>

        <div className="hero__content">
          {/* oben bleibt frei: der Markenname steht für sich */}
          <div aria-hidden />
          <div className="flex flex-col items-center">
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
            {/* Unterzeile unter dem Markennamen */}
            <p className="hero__eyebrow eyebrow !text-cream-50 mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center [text-shadow:0_1px_12px_rgb(28_21_15/0.6)] md:mt-7">
              <span>{eyebrow}</span>
              <i className="bg-cream-100/50 hidden h-px w-10 sm:block" />
              <span>Berlin-Kreuzberg</span>
            </p>
          </div>
          <div className="hero__foot flex flex-col items-center gap-6 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <p className="text-cream-50 max-w-md text-[1.02rem] leading-relaxed [text-shadow:0_1px_14px_rgb(28_21_15/0.7)]">
              {lead}
            </p>
            <div className="flex gap-3">
              <ButtonLink href="/buchen/" variant="honey" size="lg">
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
          <p className="text-cream-50 font-serif text-[clamp(3rem,9vw,8.5rem)] leading-[0.95]">
            {secondA && <span className="text-honey-300 block italic">{secondA}</span>}
            {secondB}
          </p>
        </div>

        <div className="hero__bar border-cream-50/15 text-cream-100/85 hidden border-t text-[0.8rem] md:block">
          <div className="wrap flex items-center justify-between gap-6 py-4">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
              {site.location.street} · {site.location.zip} {site.location.city}
            </span>
            <span className="flex items-center gap-2">
              <Star className="fill-honey-300 text-honey-300 h-4 w-4" strokeWidth={1.5} />
              {site.brand.rating.value.toLocaleString('de-DE')} aus ca.{' '}
              {site.brand.rating.count.toLocaleString('de-DE')} Bewertungen
            </span>
            <a
              href={`tel:${site.settings.contact.phone.replace(/\s/g, '')}`}
              className="hover:text-cream-50 flex items-center gap-2"
            >
              <Phone className="h-4 w-4" strokeWidth={1.5} />
              {site.settings.contact.phone}
            </a>
            <span className="flex items-center gap-2">
              Scrollen <ArrowDown className="h-4 w-4 animate-bounce" strokeWidth={1.5} />
            </span>
          </div>
        </div>
        <Placeholder
          label="Hier kommt das große Bild aus dem Laden"
          className="absolute bottom-4 left-4 z-[4] md:bottom-16"
        />
      </div>
    </section>
  );
}
