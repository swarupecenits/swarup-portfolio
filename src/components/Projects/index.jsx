import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronDown, FiChevronUp, FiSearch, FiX } from "react-icons/fi";
import { useLenis } from "lenis/react";
import { projectCategories, projects } from "../../data/constants";
import { useIsMobile, prefersReducedMotion } from "../../hooks/useMediaQuery";
import { OPEN_PROJECT_EVENT, countByCategory, filterProjects, findProjectBySlug, projectSlug } from "../../utils/projects";
import { usePreloader } from "../Preloader/context";
import ProjectDetails from "../ProjectDetails";
import { Container, Section, SectionHeading } from "../ui/Section";
import SnapCarousel from "../ui/SnapCarousel";
import { ghostButton, monoLabel } from "../ui/styles";
import ProjectCard from "./ProjectCard";

const INITIAL_COUNT = 6;
const EASE_OUT = [0.22, 1, 0.36, 1];
const CATEGORY_LABELS = Object.fromEntries(projectCategories.map(({ id, label }) => [id, label]));

// Shared links look like https://swarupchanda.co.in/?project=space-rover
const readLinkedProject = () => {
  if (typeof window === "undefined") return null;
  const slug = new URLSearchParams(window.location.search).get("project");
  return findProjectBySlug(projects, slug)?.id ?? null;
};

const Toolbar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
  scroll-margin-top: 16px;
`;

const Filters = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    margin-inline: -16px;
    padding: 2px 40px 6px 16px;
    overflow-x: auto;
    scrollbar-width: none;
    /* Fade the edges so the row reads as swipeable. */
    -webkit-mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 40px), transparent);
    mask-image: linear-gradient(90deg, transparent, #000 16px, #000 calc(100% - 40px), transparent);

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const FilterButton = styled.button`
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 8px 0 16px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--text-muted);
  font-size: 14.5px;
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    color 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    border-color: var(--line-strong);
    color: var(--text);
  }

  &[aria-pressed="true"] {
    border-color: transparent;
    color: var(--accent-ink);
    font-weight: 600;
  }

  &[data-empty="true"]:not([aria-pressed="true"]) {
    opacity: 0.5;
  }
`;

const ActivePill = styled(motion.span)`
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: var(--accent);
  box-shadow: 0 10px 26px -14px rgb(var(--accent-rgb) / 0.8);
`;

const FilterLabel = styled.span`
  position: relative;
`;

const Count = styled.span`
  position: relative;
  min-width: 26px;
  padding: 2px 7px;
  border-radius: 999px;
  background: rgb(255 255 255 / 0.07);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  text-align: center;

  [aria-pressed="true"] > & {
    background: rgb(0 0 0 / 0.12);
  }
`;

const SearchRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 16px;
`;

const SearchField = styled.div`
  position: relative;
  flex: 1 1 320px;
  max-width: 460px;

  > svg {
    position: absolute;
    top: 50%;
    left: 18px;
    color: var(--text-dim);
    font-size: 17px;
    translate: 0 -50%;
    pointer-events: none;
  }

  input {
    width: 100%;
    min-height: 48px;
    padding: 0 50px 0 46px;
    border: 1px solid var(--line);
    border-radius: 999px;
    outline: none;
    background: var(--surface);
    color: var(--text);
    font-size: 16px;
    appearance: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &::placeholder {
      color: var(--text-dim);
    }

    &::-webkit-search-cancel-button {
      display: none;
    }

    &:hover {
      border-color: var(--line-strong);
    }

    &:focus-visible {
      border-color: rgb(var(--accent-rgb) / 0.6);
      box-shadow: 0 0 0 4px rgb(var(--accent-rgb) / 0.14);
    }
  }

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: 7px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font-size: 17px;
  cursor: pointer;
  translate: 0 -50%;

  &:hover {
    background: rgb(255 255 255 / 0.08);
    color: var(--text);
  }
`;

const Status = styled.p`
  ${monoLabel}
  color: var(--text-dim);
`;

const Grid = styled.ul`
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 24px;
  list-style: none;
`;

const GridItem = styled(motion.li)`
  min-width: 0;
`;

const MoreButton = styled.button`
  ${ghostButton}
  display: flex;
  margin: 40px auto 0;
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
  padding: 40px 24px;
  border: 1px dashed var(--line-strong);
  border-radius: var(--radius-lg);
  background: var(--surface);
  text-align: center;

  > svg {
    color: var(--accent);
    font-size: 30px;
  }

  h3 {
    color: var(--text);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  p {
    color: var(--text-muted);
    line-height: 1.6;
  }

  button {
    ${ghostButton}
    margin-top: 6px;
  }
`;

export default function Projects() {
  const isMobile = useIsMobile();
  const lenis = useLenis();
  const { isLoading } = usePreloader();
  const searchId = useId();
  const gridId = useId();
  const toolbarRef = useRef(null);
  const gridRef = useRef(null);
  const searchRef = useRef(null);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState(readLinkedProject);

  const deferredQuery = useDeferredValue(query);
  const trimmedQuery = deferredQuery.trim();
  const matches = useMemo(() => filterProjects(projects, { query: deferredQuery }), [deferredQuery]);
  const counts = useMemo(() => countByCategory(matches), [matches]);
  const results = useMemo(() => filterProjects(matches, { category }), [matches, category]);

  const collapsible = !isMobile && !trimmedQuery && results.length > INITIAL_COUNT;
  const visible = collapsible && !expanded ? results.slice(0, INITIAL_COUNT) : results;

  const selected = projects.find((project) => project.id === selectedId) ?? null;
  // The details dialog steps through the projects currently listed.
  const browseList = results.some((project) => project.id === selectedId) ? results : projects;
  const selectedIndex = browseList.findIndex((project) => project.id === selectedId);

  // Keep the address bar shareable while a project is open.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (selected) url.searchParams.set("project", projectSlug(selected));
    else url.searchParams.delete("project");
    if (url.href !== window.location.href) window.history.replaceState(window.history.state, "", url);
  }, [selected]);

  // Other parts of the page (the command palette) can open a project too.
  useEffect(() => {
    const onOpenProject = (event) => {
      const id = event.detail?.id;
      if (projects.some((project) => project.id === id)) setSelectedId(id);
    };
    window.addEventListener(OPEN_PROJECT_EVENT, onOpenProject);
    return () => window.removeEventListener(OPEN_PROJECT_EVENT, onOpenProject);
  }, []);

  const changeCategory = (id, button) => {
    setCategory(id);
    setExpanded(false);
    // On phones the filter row scrolls sideways: bring the chosen filter to the middle.
    const row = button.parentElement;
    if (row.scrollWidth > row.clientWidth) {
      row.scrollTo({
        left: button.offsetLeft - (row.clientWidth - button.offsetWidth) / 2,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }
  };

  const clearFilters = () => {
    setCategory("all");
    setQuery("");
    setExpanded(false);
    searchRef.current?.focus();
  };

  const expand = () => {
    setExpanded(true);
    // Move keyboard focus to the first newly revealed project.
    requestAnimationFrame(() => {
      gridRef.current?.querySelectorAll("[data-project-id]")[INITIAL_COUNT]?.focus({ preventScroll: true });
    });
  };

  // Scroll back up first so the grid collapses out of sight instead of under the reader.
  const collapse = () => {
    const toolbar = toolbarRef.current;
    if (lenis && toolbar) lenis.scrollTo(toolbar, { force: true, onComplete: () => setExpanded(false) });
    else {
      setExpanded(false);
      toolbar?.scrollIntoView({ block: "start" });
    }
  };

  const browse = (step) => {
    if (selectedIndex === -1) return;
    const next = browseList[(selectedIndex + step + browseList.length) % browseList.length];
    setSelectedId(next.id);
  };

  const status = trimmedQuery
    ? `${results.length} ${results.length === 1 ? "project matches" : "projects match"} “${trimmedQuery}”`
    : `Showing ${visible.length} of ${results.length} projects`;

  return (
    <Section id="projects" aria-labelledby="projects-title">
      <Container>
        <SectionHeading
          id="projects-title"
          index="03"
          eyebrow="Projects"
          title="Selected work"
          accent="work"
          description="Robots, web and mobile apps, machine learning models and research. Search or filter to explore everything I have built."
        />

        <Toolbar ref={toolbarRef}>
          <Filters role="group" aria-label="Filter projects by category" data-interactive>
            {projectCategories.map(({ id, label }) => {
              const active = id === category;
              const count = counts[id] ?? 0;
              return (
                <FilterButton
                  key={id}
                  type="button"
                  aria-pressed={active}
                  data-empty={count === 0}
                  onClick={(event) => changeCategory(id, event.currentTarget)}
                >
                  {active && <ActivePill layoutId="project-filter-pill" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
                  <FilterLabel>{label}</FilterLabel>
                  <Count>{count}</Count>
                </FilterButton>
              );
            })}
          </Filters>

          <SearchRow>
            <SearchField>
              <FiSearch aria-hidden="true" />
              <label htmlFor={searchId} className="sr-only">
                Search projects
              </label>
              <input
                ref={searchRef}
                id={searchId}
                type="search"
                value={query}
                maxLength={60}
                autoComplete="off"
                spellCheck={false}
                enterKeyHint="search"
                placeholder="Search by name or tech, e.g. React"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && query) {
                    event.preventDefault();
                    setQuery("");
                  }
                }}
              />
              {query && (
                <ClearButton
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                >
                  <FiX aria-hidden="true" />
                </ClearButton>
              )}
            </SearchField>
            <Status role="status">{status}</Status>
          </SearchRow>
        </Toolbar>

        {results.length === 0 ? (
          <Empty data-interactive>
            <FiSearch aria-hidden="true" />
            <h3>No projects found</h3>
            <p>
              Nothing matches {trimmedQuery ? `“${trimmedQuery}”` : "this filter"}
              {category !== "all" && ` in ${CATEGORY_LABELS[category]}`}. Try another search or category.
            </p>
            <button type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </Empty>
        ) : isMobile ? (
          <SnapCarousel
            key={`${category}|${trimmedQuery}`}
            label="Projects"
            items={results}
            getKey={(project) => project.id}
            renderItem={(project) => <ProjectCard project={project} onOpen={setSelectedId} animate={false} />}
          />
        ) : (
          <Grid ref={gridRef} id={gridId}>
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((project, index) => (
                <GridItem
                  key={project.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <ProjectCard project={project} index={index} onOpen={setSelectedId} />
                </GridItem>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {collapsible && (
          <MoreButton type="button" aria-expanded={expanded} aria-controls={gridId} onClick={expanded ? collapse : expand}>
            {expanded ? "Show fewer" : `Show all ${results.length} projects`}
            {expanded ? <FiChevronUp aria-hidden="true" /> : <FiChevronDown aria-hidden="true" />}
          </MoreButton>
        )}
      </Container>

      <ProjectDetails
        project={isLoading ? null : selected}
        position={selectedIndex + 1}
        total={browseList.length}
        onClose={() => setSelectedId(null)}
        onBrowse={browse}
      />
    </Section>
  );
}
