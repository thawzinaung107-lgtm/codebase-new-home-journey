import strategy from "@/assets/myanmar-strategy-home-desktop.png.asset.json";
import creation from "@/assets/myanmar-creation-home-desktop.png.asset.json";

export const courses = [
  {
    number: "COURSE 01",
    category: "AI Marketing",
    topics: "marketing strategy campaign planning audience research workflows",
    title: "AI Marketing Strategy",
    image: strategy.url,
    description: "Learn campaign planning, audience research and practical AI workflows.",
    titleClassName: "text-[28px] leading-[37.8px]",
  },
  {
    number: "COURSE 02",
    category: "AI Content",
    topics: "content creation marketing assets tools",
    title: "AI Content Creation",
    image: creation.url,
    description: "Create content and marketing assets with practical AI tools.",
    titleClassName: "text-2xl leading-[32.4px]",
  },
];

export function filterCourses(query: string, filter: string) {
  const q = query.trim().toLowerCase();
  return courses.filter(
    (c) =>
      (filter === "All courses" || c.category === filter) &&
      (!q || [c.title, c.description, c.category, c.topics].join(" ").toLowerCase().includes(q)),
  );
}
