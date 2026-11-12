import { describe, expect, it } from "vitest";
import { projectCategories, projects } from "../data/constants";
import { countByCategory, filterProjects, findProjectBySlug, getDemoLink, projectSlug } from "./projects";

const SAMPLE = [
  { title: "Café Finder", description: "Find coffee nearby", category: "web", tags: ["React", "Maps"] },
  { title: "Rover", description: "Autonomous navigation", category: "robotics", tags: ["Arduino"] },
  { title: "Vision Rover", description: "Object detection", category: "ml", tags: ["PyTorch"] },
];

describe("filterProjects", () => {
  it("matches every query word across fields, ignoring case and accents", () => {
    expect(filterProjects(SAMPLE, { query: "CAFE react" }).map((p) => p.title)).toEqual(["Café Finder"]);
    expect(filterProjects(SAMPLE, { query: "rover" })).toHaveLength(2);
    expect(filterProjects(SAMPLE, { query: "rover maps" })).toEqual([]);
  });

  it("combines the category filter with the query", () => {
    expect(filterProjects(SAMPLE, { category: "ml", query: "rover" }).map((p) => p.title)).toEqual(["Vision Rover"]);
    expect(filterProjects(SAMPLE, { category: "all", query: "  " })).toHaveLength(3);
  });
});

describe("project slugs", () => {
  it("builds URL-friendly slugs", () => {
    expect(projectSlug({ title: "17-DOF Humanoid Robot" })).toBe("17-dof-humanoid-robot");
    expect(projectSlug({ title: "  Café — Finder!  " })).toBe("cafe-finder");
  });

  it("finds a project by slug and ignores unknown or empty slugs", () => {
    expect(findProjectBySlug(SAMPLE, "vision-rover")).toBe(SAMPLE[2]);
    expect(findProjectBySlug(SAMPLE, "missing")).toBeNull();
    expect(findProjectBySlug(SAMPLE, "")).toBeNull();
  });
});

describe("getDemoLink", () => {
  it.each([
    ["https://youtu.be/abc", "video"],
    ["https://www.youtube.com/watch?v=abc", "video"],
    ["https://www.researchgate.net/publication/1", "paper"],
    ["https://drive.google.com/file/d/1/view", "download"],
    ["https://example.vercel.app", "live"],
  ])("classifies %s as %s", (url, kind) => {
    expect(getDemoLink(url)?.kind).toBe(kind);
  });

  it("returns null for missing or invalid URLs", () => {
    expect(getDemoLink("")).toBeNull();
    expect(getDemoLink("not a url")).toBeNull();
  });
});

describe("project data", () => {
  it("gives every project a unique slug so deep links resolve to one project", () => {
    const slugs = projects.map(projectSlug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("only uses categories that have a filter tab", () => {
    const known = new Set(projectCategories.map((category) => category.id));
    expect(Object.keys(countByCategory(projects)).filter((id) => !known.has(id))).toEqual([]);
  });
});
