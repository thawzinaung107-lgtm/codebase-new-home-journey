import { describe, expect, it } from "vitest";
import { filterCourses } from "./courses";

describe("course filters", () => {
  it("shows both launch courses by default", () => {
    expect(filterCourses("", "All courses").map((c) => c.title)).toEqual(["AI Marketing Strategy", "AI Content Creation"]);
  });
  it("filters by category", () => {
    expect(filterCourses("", "AI Content").map((c) => c.title)).toEqual(["AI Content Creation"]);
  });
  it("searches topics", () => {
    expect(filterCourses("audience", "All courses").map((c) => c.title)).toEqual(["AI Marketing Strategy"]);
  });
});
