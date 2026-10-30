import { Hero } from '@/components/home/hero';
import { InstagramFeed } from '@/components/home/social';
import { StickyBook } from '@/features/treatments/sticky-book';
import { AreaMarquee, Areas, CoursePreview, Intro, Manufaktur, NewsletterSection, Packages, TeamTeaser, Trust } from '@/components/home/sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <AreaMarquee />
      <Areas />
      <Packages />
      <Trust />
      <Manufaktur />
      <TeamTeaser />
      <CoursePreview />
      <InstagramFeed />
      <NewsletterSection />
      <StickyBook href="/buchen/" label="Termin buchen" />
    </>
  );
}
