import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { NavigationSection } from "@/components/home/NavigationSection";
import { DealsAndUpdatesHeroSection } from "@/components/home/DealsAndUpdatesHeroSection";
import { CourseSearchAndFiltersSection } from "@/components/home/CourseSearchAndFiltersSection";
import { CourseCatalogSection } from "@/components/home/CourseCatalogSection";
import { academyQuery } from "@/lib/lms-query";
import {
  LearningPlatformFeaturesSection,
  LearningProcessStepsSection,
  MarketingJourneyCallToActionSection,
} from "@/components/home/LowerSections";

const description =
  "Practical AI marketing courses: AI Marketing Strategy and AI Content Creation. Self-paced recorded lessons with limited-term access.";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(academyQuery),
  head: () => ({
    meta: [
      { title: "AI Marketing Academy" },
      { name: "description", content: description },
      { property: "og:title", content: "AI Marketing Academy" },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const eyebrow = "text-[13px] leading-[19.5px] text-muted-foreground";

function Home() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All courses");
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background px-6 py-6 md:px-11 md:py-11">
      <div className="flex w-full max-w-[1352px] flex-col items-stretch">
        <header className="mb-6 w-full"><NavigationSection /></header>
        <section aria-label="Deals and updates" className="mb-4"><DealsAndUpdatesHeroSection /></section>
        <section id="courses" aria-labelledby="courses-heading" className="flex w-full scroll-mt-6 flex-col items-start gap-2">
          <p className={eyebrow}>BROWSE COURSES</p>
          <h2 id="courses-heading" className="text-3xl font-semibold leading-[43px] text-ink md:text-4xl md:leading-[48.6px]">
            Courses built for real-world skills
          </h2>
          <p className="text-sm leading-[21px] text-muted-foreground">Two courses are planned for launch. Choose the skills you want to build.</p>
        </section>
        <section aria-label="Course search and filters" className="mb-3 mt-2">
          <CourseSearchAndFiltersSection query={query} onQueryChange={setQuery} selectedFilter={filter} onFilterChange={setFilter} />
        </section>
        <section aria-label="Course catalog" className="mb-4">
          <CourseCatalogSection query={query} selectedFilter={filter} onReset={() => { setQuery(""); setFilter("All courses"); }} />
        </section>
        <section id="how-it-works" aria-labelledby="learning-heading" className="flex w-full scroll-mt-6 flex-col items-start gap-2">
          <p className={eyebrow}>HOW LEARNING WORKS</p>
          <h2 id="learning-heading" className="text-[28px] font-semibold leading-[38px] text-ink md:text-[32px] md:leading-[43.2px]">
            A simple path to better skills.
          </h2>
          <p className="text-sm leading-[21px] text-muted-foreground">Pay manually, receive approval and redeem your code to unlock your course.</p>
        </section>
        <section aria-label="Learning process steps" className="mb-3 mt-2"><LearningProcessStepsSection /></section>
        <section aria-label="Learning platform features" className="mb-3"><LearningPlatformFeaturesSection /></section>
        <section aria-label="Call to action" className="mb-4"><MarketingJourneyCallToActionSection /></section>
        <footer id="about" className="text-[13px] leading-[19.5px] text-subtle">
          AI MARKETING ACADEMY&nbsp;&nbsp;·&nbsp;&nbsp;onlinelearning.ccone.app
        </footer>
      </div>
    </main>
  );
}
