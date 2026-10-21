import { Hero } from '@/components/home/hero';
import { Areas, CoursePreview, Intro, NewsletterSection, Packages, TeamTeaser, Trust } from '@/components/home/sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Intro />
      <Areas />
      <Packages />
      <Trust />
      <TeamTeaser />
      <CoursePreview />
      <NewsletterSection />
    </>
  );
}
