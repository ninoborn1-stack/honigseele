import { ButtonLink } from '@/components/ui/button';
import { Eyebrow, Section } from '@/components/ui/typography';

export default function NotFound() {
  return (
    <Section tone="light" className="text-center">
      <Eyebrow>404</Eyebrow>
      <h1 className="mt-8 text-[clamp(3rem,8vw,8rem)] leading-[0.95]">
        Diese Seite gibt es <em>nicht</em>.
      </h1>
      <p className="mx-auto mt-4 max-w-md text-muted">Vielleicht hat sie sich einen Tag Auszeit genommen.</p>
      <ButtonLink href="/" className="mt-8">Zur Startseite</ButtonLink>
    </Section>
  );
}
