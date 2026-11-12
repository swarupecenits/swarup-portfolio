import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion, useIsPresent } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { FiAlertCircle, FiCalendar, FiCheck, FiChevronLeft, FiChevronRight, FiShare2, FiX } from "react-icons/fi";
import { projectCategories } from "../../data/constants";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { useModalLock } from "../../hooks/useModalLock";
import { toISOMonth } from "../../utils/dates";
import { imageSrcSet, optimizeImage } from "../../utils/image";
import { getDemoLink, projectSlug } from "../../utils/projects";
import { DemoIcon } from "../Projects/ProjectCard";
import { chip, ghostButton, monoLabel, primaryButton } from "../ui/styles";

const EASE_OUT = [0.22, 1, 0.36, 1];
const SWIPE_DISTANCE = 60;
const SHARE_FEEDBACK_MS = 2000;
const IMAGE_WIDTHS = [640, 960];
const IMAGE_SIZES = "(max-width: 920px) 100vw, 840px";
const COARSE_POINTER_QUERY = "(pointer: coarse)";
const BADGES = Object.fromEntries(projectCategories.map(({ id, badge }) => [id, badge]));

const PANEL_MOTION = {
  desktop: {
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: EASE_OUT } },
    exit: { opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.2, ease: "easeIn" } },
  },
  mobile: {
    initial: { y: "100%" },
    animate: { y: 0, transition: { type: "spring", stiffness: 380, damping: 38 } },
    exit: { y: "100%", transition: { duration: 0.25, ease: "easeIn" } },
  },
};

const isEditable = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

const shareUrl = (project) => {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set("project", projectSlug(project));
  return url.href;
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 24px;

  @media (max-width: 768px) {
    align-items: end;
    padding: 0;
  }
`;

const Backdrop = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgb(0 0 0 / 0.72);
  touch-action: none;
`;

const Panel = styled(motion.div)`
  position: relative;
  display: flex;
  flex-direction: column;
  width: min(880px, 100%);
  max-height: calc(100vh - 48px);
  max-height: min(920px, calc(100dvh - 48px));
  overflow: hidden;
  border: 1px solid var(--line-strong);
  border-radius: 24px;
  background: linear-gradient(180deg, rgb(255 255 255 / 0.03), transparent 28%), #0e0e11;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.06),
    0 40px 80px -24px rgb(0 0 0 / 0.85);

  @media (max-width: 768px) {
    max-height: calc(100vh - 24px);
    max-height: calc(100dvh - 24px);
    border-bottom: 0;
    border-radius: 22px 22px 0 0;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px 12px 22px;
  border-bottom: 1px solid var(--line);
`;

const Counter = styled.p`
  ${monoLabel}
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;

  strong {
    color: var(--text);
    font-weight: 500;
  }
`;

const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 40px;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.04);
  color: var(--text-soft);
  font-size: 18px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover:not(:disabled) {
    border-color: var(--line-strong);
    background: rgb(255 255 255 / 0.09);
    color: var(--text);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
`;

const ShareButton = styled(IconButton)`
  padding: 0 15px;
  font-size: 14px;
  font-weight: 600;

  svg {
    font-size: 16px;
  }

  &[data-state="copied"] {
    border-color: rgb(var(--accent-rgb) / 0.5);
    color: var(--accent);
  }

  &[data-state="failed"] {
    border-color: rgb(248 113 113 / 0.5);
    color: var(--danger);
  }
`;

const ScrollArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: rgb(255 255 255 / 0.18) transparent;
  scrollbar-width: thin;
`;

const Content = styled(motion.div)`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 28px;

  @media (max-width: 768px) {
    padding: 16px 16px calc(24px + env(safe-area-inset-bottom));
  }
`;

const Media = styled(motion.div)`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 16px;
  background: linear-gradient(135deg, #18181b, #27272a);
  touch-action: pan-y;
  user-select: none;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    -webkit-user-drag: none;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
`;

const Badge = styled.span`
  ${chip}
  border-color: rgb(var(--accent-rgb) / 0.35);
  background: rgb(var(--accent-rgb) / 0.1);
  color: var(--accent);
`;

const DateText = styled.p`
  ${monoLabel}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
`;

const Title = styled.h2`
  color: var(--text);
  font-size: clamp(1.6rem, 3.4vw, 2.3rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.15;
  text-wrap: balance;
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;

  li {
    ${chip}
  }
`;

const Description = styled.p`
  color: var(--text-soft);
  font-size: 16px;
  line-height: 1.8;
  white-space: pre-line;
  text-wrap: pretty;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 4px;
`;

const ActionLink = styled.a`
  ${({ $primary }) => ($primary ? primaryButton : ghostButton)}
`;

function Dialog({ overlayRef, project, position, total, onClose, onBrowse, isMobile }) {
  const titleId = useId();
  const scrollRef = useRef(null);
  const isPresent = useIsPresent();
  const [direction, setDirection] = useState(0);
  const [shareState, setShareState] = useState(null);

  const { id, title, date, description, image, tags = [], category, github, webapp } = project;
  const demo = getDemoLink(webapp);
  const badge = BADGES[category];
  const canBrowse = total > 1;
  const shareStatus = shareState?.id === id ? shareState.status : null;
  const panelMotion = PANEL_MOTION[isMobile ? "mobile" : "desktop"];

  const browse = (step) => {
    if (!canBrowse) return;
    setDirection(step);
    onBrowse(step);
  };

  const handleKeyDown = useEffectEvent((event) => {
    if (!isPresent || event.defaultPrevented) return;
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isEditable(event.target)) return;
    event.preventDefault();
    browse(event.key === "ArrowLeft" ? -1 : 1);
  });

  useEffect(() => {
    const onKeyDown = (event) => handleKeyDown(event);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Every project starts at the top of the dialog.
  useLayoutEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [id]);

  useEffect(() => {
    if (!shareState) return undefined;
    const timer = setTimeout(() => setShareState(null), SHARE_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [shareState]);

  const share = async () => {
    const url = shareUrl(project);
    // Phones get the native share sheet; desktops copy the link.
    if (navigator.share && window.matchMedia(COARSE_POINTER_QUERY).matches) {
      try {
        await navigator.share({ title: `${title} | Swarup Chanda`, url });
      } catch {
        // Closing the share sheet rejects with an AbortError: nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareState({ id, status: "copied" });
    } catch {
      setShareState({ id, status: "failed" });
    }
  };

  const onPanEnd = (_, { offset }) => {
    if (Math.abs(offset.x) < SWIPE_DISTANCE || Math.abs(offset.x) < Math.abs(offset.y) * 1.5) return;
    browse(offset.x < 0 ? 1 : -1);
  };

  const shareLabel = shareStatus === "copied" ? "Copied" : shareStatus === "failed" ? "Copy failed" : "Share";
  const ShareIcon = shareStatus === "copied" ? FiCheck : shareStatus === "failed" ? FiAlertCircle : FiShare2;

  return (
    <Overlay ref={overlayRef} data-modal-root data-lenis-prevent>
      <Backdrop
        aria-hidden="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      />

      <Panel role="dialog" aria-modal="true" aria-labelledby={titleId} {...panelMotion}>
        <Toolbar>
          <Counter>
            <span aria-hidden="true">
              <strong>{String(position).padStart(2, "0")}</strong> / {String(total).padStart(2, "0")}
            </span>
            <span className="sr-only">
              Project {position} of {total}
            </span>
          </Counter>

          <ToolbarActions>
            <IconButton type="button" aria-label="Previous project" title="Previous (←)" disabled={!canBrowse} onClick={() => browse(-1)}>
              <FiChevronLeft aria-hidden="true" />
            </IconButton>
            <IconButton type="button" aria-label="Next project" title="Next (→)" disabled={!canBrowse} onClick={() => browse(1)}>
              <FiChevronRight aria-hidden="true" />
            </IconButton>
            <ShareButton type="button" data-state={shareStatus ?? undefined} title="Share a link to this project" onClick={share}>
              <ShareIcon aria-hidden="true" />
              {shareLabel}
            </ShareButton>
            <IconButton type="button" aria-label="Close project details" title="Close (Esc)" data-autofocus onClick={onClose}>
              <FiX aria-hidden="true" />
            </IconButton>
          </ToolbarActions>
        </Toolbar>

        <ScrollArea ref={scrollRef}>
          <Content
            key={id}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <Media onPanEnd={onPanEnd}>
              <img
                src={optimizeImage(image, 960)}
                srcSet={imageSrcSet(image, IMAGE_WIDTHS)}
                sizes={IMAGE_SIZES}
                alt={`${title} preview`}
                width="960"
                height="540"
                decoding="async"
                draggable={false}
              />
            </Media>

            <Meta>
              {badge && <Badge>{badge}</Badge>}
              <DateText>
                <FiCalendar aria-hidden="true" />
                <time dateTime={toISOMonth(date)}>{date}</time>
              </DateText>
            </Meta>

            <Title id={titleId}>{title}</Title>

            {tags.length > 0 && (
              <Tags aria-label="Technologies">
                {tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </Tags>
            )}

            <Description>{description}</Description>

            {(demo || github) && (
              <Actions>
                {demo && (
                  <ActionLink $primary href={webapp} target="_blank" rel="noopener noreferrer">
                    <DemoIcon kind={demo.kind} />
                    {demo.label}
                  </ActionLink>
                )}
                {github && (
                  <ActionLink $primary={!demo} href={github} target="_blank" rel="noopener noreferrer">
                    <FaGithub aria-hidden="true" />
                    View code
                  </ActionLink>
                )}
              </Actions>
            )}
          </Content>
        </ScrollArea>

        <p className="sr-only" aria-live="polite">
          {direction !== 0 ? `${title}, project ${position} of ${total}` : ""}
        </p>
        <p className="sr-only" role="status">
          {shareStatus === "copied" ? "Link copied to clipboard" : shareStatus === "failed" ? "Could not copy the link" : ""}
        </p>
      </Panel>
    </Overlay>
  );
}

/**
 * Modal with everything about one project. Arrow keys (or swiping the image) step through
 * the list it was opened from, and Share copies a deep link (`?project=slug`).
 */
export default function ProjectDetails({ project, position, total, onClose, onBrowse }) {
  const isMobile = useIsMobile();
  const overlayRef = useRef(null);
  const open = Boolean(project);

  // While open: the rest of the page is inert and can't scroll; focus returns to the opener afterwards.
  useModalLock(open, overlayRef);

  return createPortal(
    <AnimatePresence>
      {open && (
        <Dialog
          key="project-dialog"
          overlayRef={overlayRef}
          project={project}
          position={position}
          total={total}
          onClose={onClose}
          onBrowse={onBrowse}
          isMobile={isMobile}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
