import { normalizeText as normalize } from "./text";

/** Window event that asks the projects section to open a project's details. */
export const OPEN_PROJECT_EVENT = "portfolio:open-project";

export const requestProjectOpen = (id) => window.dispatchEvent(new CustomEvent(OPEN_PROJECT_EVENT, { detail: { id } }));

/**
 * Projects in `category` ("all" for every category) whose title, description, category or
 * tags contain every word of `query`.
 */
export function filterProjects(projects, { category = "all", query = "" } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return projects.filter((project) => {
    if (category !== "all" && project.category !== category) return false;
    if (terms.length === 0) return true;
    const haystack = normalize([project.title, project.description, project.category, ...(project.tags ?? [])].join(" "));
    return terms.every((term) => haystack.includes(term));
  });
}

/** `{ all: n, [category]: n }` project counts. */
export function countByCategory(projects) {
  const counts = { all: projects.length };
  for (const { category } of projects) {
    if (category) counts[category] = (counts[category] ?? 0) + 1;
  }
  return counts;
}

/** URL-friendly id for a project, e.g. "17-DOF Humanoid Robot" → "17-dof-humanoid-robot". */
export const projectSlug = (project) =>
  normalize(project?.title)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const findProjectBySlug = (projects, slug) =>
  (slug && projects.find((project) => projectSlug(project) === slug)) || null;

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

/** Describes a project's demo link so it can be labelled by what it actually opens. */
export function getDemoLink(url) {
  const host = url ? hostOf(url) : null;
  if (!host) return null;
  if (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com")) {
    return { kind: "video", label: "Watch demo" };
  }
  if (host.endsWith("researchgate.net")) return { kind: "paper", label: "Read paper" };
  if (host === "drive.google.com" || host === "docs.google.com") return { kind: "download", label: "Download app" };
  return { kind: "live", label: "Live demo" };
}
