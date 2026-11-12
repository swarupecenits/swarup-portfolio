import { useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import {
  FiArrowUp,
  FiArrowUpRight,
  FiCornerDownLeft,
  FiEdit3,
  FiFileText,
  FiFolder,
  FiHash,
  FiLink,
  FiSearch,
} from "react-icons/fi";
import { Bio, projectCategories, projects } from "../../data/constants";
import { NAV_LINKS, SOCIAL_LINKS } from "../../data/socials";
import { useModalLock } from "../../hooks/useModalLock";
import { rankCommands } from "../../utils/commands";
import { requestProjectOpen } from "../../utils/projects";
import { scrollToTarget } from "../../utils/scroll";
import { normalizeText } from "../../utils/text";
import { monoLabel } from "../ui/styles";
import Toast from "../ui/Toast";

const SUGGESTED_PROJECTS = 6;
const EASE_OUT = [0.22, 1, 0.36, 1];
const BADGES = Object.fromEntries(projectCategories.map(({ id, badge }) => [id, badge]));

const openInNewTab = (url) => window.open(url, "_blank", "noopener,noreferrer");

const goToSection = (lenis, id) => {
  scrollToTarget(lenis, `#${id}`, { focus: true });
  window.history.replaceState(window.history.state, "", `#${id}`);
};

async function copySiteLink(notify) {
  const url = `${window.location.origin}/`;
  try {
    await navigator.clipboard.writeText(url);
    notify("success", "Link copied to your clipboard.");
  } catch {
    notify("error", `Couldn't copy the link automatically. It's ${url}`);
  }
}

// `external` and `immediate` commands run inside the click or key press, so browsers allow the
// new tab or clipboard write. The rest run once the palette has closed and the page is no
// longer inert, because they move focus into it.
const COMMANDS = [
  ...NAV_LINKS.map(({ id, label }) => ({
    id: `section-${id}`,
    group: "Navigate",
    label,
    keywords: ["section", "go to", "jump"],
    hint: "Section",
    Icon: FiHash,
    run: ({ lenis }) => goToSection(lenis, id),
  })),
  ...projects.map((project) => ({
    id: `project-${project.id}`,
    group: "Projects",
    label: project.title,
    keywords: [BADGES[project.category], ...(project.tags ?? []), "project"],
    hint: BADGES[project.category],
    Icon: FiFolder,
    run: () => requestProjectOpen(project.id),
  })),
  {
    id: "link-resume",
    group: "Links",
    label: "Resume",
    keywords: ["cv", "download", "pdf"],
    Icon: FiFileText,
    external: true,
    run: () => openInNewTab(Bio.resume),
  },
  ...SOCIAL_LINKS.map(({ id, label, href, Icon }) => ({
    id: `link-${id}`,
    group: "Links",
    label,
    keywords: ["social", "profile"],
    Icon,
    external: true,
    run: () => openInNewTab(href),
  })),
  {
    id: "action-message",
    group: "Actions",
    label: "Send me a message",
    keywords: ["contact", "email", "hire", "write"],
    Icon: FiEdit3,
    run: ({ lenis }) => {
      scrollToTarget(lenis, "#contact");
      document.querySelector("#contact form :is(input, textarea)")?.focus({ preventScroll: true });
    },
  },
  {
    id: "action-copy",
    group: "Actions",
    label: "Copy link to this site",
    keywords: ["share", "url", "clipboard"],
    Icon: FiLink,
    immediate: true,
    run: ({ notify }) => copySiteLink(notify),
  },
  {
    id: "action-top",
    group: "Actions",
    label: "Back to top",
    keywords: ["scroll", "home", "start"],
    Icon: FiArrowUp,
    run: ({ lenis }) => scrollToTarget(lenis, "#top"),
  },
];

const SUGGESTED_IDS = new Set(projects.slice(0, SUGGESTED_PROJECTS).map(({ id }) => `project-${id}`));
// With an empty search only a few projects are listed; typing searches all of them.
const SUGGESTIONS = COMMANDS.filter(({ group, id }) => group !== "Projects" || SUGGESTED_IDS.has(id));

function groupCommands(commands) {
  const groups = new Map();
  for (const command of commands) {
    const group = groups.get(command.group);
    if (group) group.push(command);
    else groups.set(command.group, [command]);
  }
  return [...groups];
}

function Highlight({ text, query }) {
  const needle = normalizeText(query).trim();
  const haystack = normalizeText(text);
  const start = needle ? haystack.indexOf(needle) : -1;
  // Normalising can change the length (e.g. ligatures); then the positions no longer line up.
  if (start === -1 || haystack.length !== text.length) return text;
  return (
    <>
      {text.slice(0, start)}
      <mark>{text.slice(start, start + needle.length)}</mark>
      {text.slice(start + needle.length)}
    </>
  );
}

const Overlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(12px, 12vh, 128px) 12px 12px;
  background: rgb(0 0 0 / 0.7);
`;

const Panel = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: min(620px, 100%);
  max-height: 100%;
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: 18px;
  background: rgb(17 17 20 / 0.98);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 40px 120px -24px rgb(0 0 0 / 0.95);
`;

const SearchRow = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 12px;
  padding: 0 12px 0 18px;
  border-bottom: 1px solid var(--line);

  > svg {
    flex-shrink: 0;
    color: var(--text-dim);
    font-size: 18px;
  }

  input {
    flex: 1;
    min-width: 0;
    height: 58px;
    border: 0;
    outline: none;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-size: 16.5px;
    letter-spacing: -0.01em;

    &::placeholder {
      color: var(--text-dim);
    }
  }
`;

const Kbd = styled.kbd`
  display: inline-grid;
  place-items: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  border: 1px solid var(--line-strong);
  border-radius: 6px;
  background: rgb(255 255 255 / 0.04);
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;

  &:hover kbd {
    border-color: rgb(255 255 255 / 0.3);
    color: var(--text);
  }
`;

const List = styled.div`
  max-height: min(400px, 52vh);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 8px 8px;
  scroll-padding-block: 8px;
`;

const GroupLabel = styled.div`
  ${monoLabel}
  padding: 14px 10px 6px;
  color: var(--text-dim);
  font-size: 11px;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 7px 10px;
  border-radius: 10px;
  color: var(--text-soft);
  cursor: pointer;
  -webkit-user-select: none;
  user-select: none;

  mark {
    background: none;
    color: var(--accent);
  }

  &[aria-selected="true"] {
    background: rgb(255 255 255 / 0.06);
    color: var(--text);
  }
`;

const OptionIcon = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--line);
  border-radius: 9px;
  background: rgb(255 255 255 / 0.03);
  color: var(--text-muted);
  font-size: 15px;
  transition:
    color 0.15s ease,
    border-color 0.15s ease;

  [aria-selected="true"] > & {
    border-color: rgb(var(--accent-rgb) / 0.35);
    color: var(--accent);
  }
`;

const OptionLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const OptionHint = styled.span`
  ${monoLabel}
  flex-shrink: 0;
  color: var(--text-dim);
  font-size: 10.5px;
  letter-spacing: 0.06em;
`;

const OptionEnd = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 22px;
  color: var(--text-dim);
  font-size: 15px;

  &[data-reveal="true"] {
    opacity: 0;
  }

  [aria-selected="true"] > & {
    color: var(--text-muted);
    opacity: 1;
  }
`;

const Empty = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 40px 24px 44px;
  color: var(--text-muted);
  font-size: 14.5px;
  text-align: center;

  strong {
    color: var(--text);
    font-size: 15.5px;
    font-weight: 600;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 18px;
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  color: var(--text-dim);
  font-size: 12.5px;

  > span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  > span:last-child {
    ${monoLabel}
    margin-left: auto;
    font-size: 10.5px;
  }

  @media (hover: none) {
    display: none;
  }
`;

function Palette({ onSelect, onClose }) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (command) => `${baseId}-${command.id}`;
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const trimmed = query.trim();

  const groups = useMemo(() => groupCommands(trimmed ? rankCommands(COMMANDS, trimmed) : SUGGESTIONS), [trimmed]);
  // Keyboard order follows the on-screen order, group by group.
  const options = useMemo(() => groups.flatMap(([, commands]) => commands), [groups]);
  const active = options[Math.min(activeIndex, options.length - 1)] ?? null;

  const moveBy = (step) => {
    if (options.length === 0) return;
    const next = (options.indexOf(active) + step + options.length) % options.length;
    setActiveIndex(next);
    document.getElementById(optionId(options[next]))?.scrollIntoView({ block: "nearest" });
  };

  const onKeyDown = (event) => {
    if (event.nativeEvent.isComposing) return;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        moveBy(event.key === "ArrowDown" ? 1 : -1);
        break;
      case "Enter":
        event.preventDefault();
        if (active) onSelect(active);
        break;
      case "Escape":
        event.preventDefault();
        onClose();
        break;
      case "Tab":
        // The search field is the only stop; results are picked with the arrow keys.
        event.preventDefault();
        break;
      default:
    }
  };

  // Clicking a result must not move focus away from the search field.
  const keepFocus = (event) => {
    if (!(event.target instanceof Element && event.target.closest("input"))) event.preventDefault();
  };

  return (
    <Panel
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onKeyDown}
      onMouseDown={keepFocus}
      initial={{ opacity: 0, y: -14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.2, ease: EASE_OUT }}
    >
      <SearchRow>
        <FiSearch aria-hidden="true" />
        <input
          data-autofocus
          type="text"
          role="combobox"
          aria-label="Search sections, projects and links"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active ? optionId(active) : undefined}
          placeholder="Search sections, projects, links…"
          value={query}
          maxLength={60}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
        />
        <CloseButton type="button" tabIndex={-1} aria-label="Close" onClick={onClose}>
          <Kbd aria-hidden="true">esc</Kbd>
        </CloseButton>
      </SearchRow>

      <List id={listId} role="listbox" aria-label="Results" data-lenis-prevent>
        {groups.map(([name, commands]) => (
          <div key={name} role="group" aria-labelledby={`${baseId}-${name}`}>
            <GroupLabel id={`${baseId}-${name}`} role="presentation">
              {name}
              {name === "Projects" && !trimmed && ` · type to search all ${projects.length}`}
            </GroupLabel>
            {commands.map((command) => {
              const { Icon } = command;
              const selected = command === active;
              return (
                <Option
                  key={command.id}
                  id={optionId(command)}
                  role="option"
                  aria-selected={selected}
                  onPointerMove={() => {
                    if (!selected) setActiveIndex(options.indexOf(command));
                  }}
                  onClick={() => onSelect(command)}
                >
                  <OptionIcon aria-hidden="true">
                    <Icon />
                  </OptionIcon>
                  <OptionLabel>
                    <Highlight text={command.label} query={trimmed} />
                    {command.external && <span className="sr-only"> (opens in a new tab)</span>}
                  </OptionLabel>
                  {command.hint && <OptionHint aria-hidden="true">{command.hint}</OptionHint>}
                  <OptionEnd aria-hidden="true" data-reveal={!command.external}>
                    {command.external ? <FiArrowUpRight /> : <FiCornerDownLeft />}
                  </OptionEnd>
                </Option>
              );
            })}
          </div>
        ))}
      </List>

      {options.length === 0 && (
        <Empty>
          <strong>No results for “{trimmed}”</strong>
          <span>Try a section, a project or a technology such as React.</span>
        </Empty>
      )}

      <p className="sr-only" role="status">
        {trimmed && `${options.length} ${options.length === 1 ? "result" : "results"}`}
      </p>

      <Footer aria-hidden="true">
        <span>
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd>
          to navigate
        </span>
        <span>
          <Kbd>↵</Kbd>
          to select
        </span>
        <span>
          <Kbd>esc</Kbd>
          to close
        </span>
        <span>{Bio.name}</span>
      </Footer>
    </Panel>
  );
}

/** ⌘K / Ctrl K palette for jumping to sections, opening projects and links, and quick actions. */
export default function CommandPalette({ open, onClose }) {
  const lenis = useLenis();
  const overlayRef = useRef(null);
  const [toast, setToast] = useState(null);

  useModalLock(open, overlayRef);

  const select = (command) => {
    onClose();
    const context = { lenis, notify: (type, message) => setToast({ id: Date.now(), type, message }) };
    if (command.external || command.immediate) command.run(context);
    else window.setTimeout(() => command.run(context), 0);
  };

  return (
    <>
      {createPortal(
        <AnimatePresence>
          {open && (
            <Overlay
              key="command-palette"
              ref={overlayRef}
              data-command-palette
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) onClose();
              }}
            >
              <Palette onSelect={select} onClose={onClose} />
            </Overlay>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <Toast toast={toast} onClose={() => setToast(null)} duration={4000} />
    </>
  );
}
