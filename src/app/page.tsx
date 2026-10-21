import { Hero } from '@/components/home/hero';
import { AreaMarquee, Areas, CoursePreview, Intro, NewsletterSection, Packages, TeamTeaser, Trust } from '@/components/home/sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <AreaMarquee />
      <Areas />
      <Packages />
      <Trust />
      <TeamTeaser />
      <CoursePreview />
      <NewsletterSection />
    </>
  );
}
