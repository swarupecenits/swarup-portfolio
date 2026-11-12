import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { FiArrowUp } from "react-icons/fi";
import { scrollToTarget } from "../../utils/scroll";

const Button = styled(motion.button)`
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border: 1px solid var(--line);
  border-radius: 50%;
  background: var(--surface-strong);
  box-shadow: 0 16px 36px -12px rgb(0 0 0 / 0.8);
  color: var(--text-soft);
  font-size: 20px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease;

  svg:not(.progress) {
    transition: translate 0.25s var(--ease-out);
  }

  &:hover {
    background: var(--surface-hover);
    color: var(--accent);

    svg:not(.progress) {
      translate: 0 -2px;
    }
  }

  .progress {
    position: absolute;
    inset: -1px;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    transform: rotate(-90deg);
    pointer-events: none;
  }

  @media (max-width: 768px) {
    right: 16px;
    bottom: 16px;
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
`;

const isPastFirstScreen = (y) => y > window.innerHeight * 0.8;

/**
 * Floating "back to top" button with a ring that fills up as the page is read. It steps aside
 * once the footer (which has its own "Back to top" link) scrolls into view.
 */
export default function BackToTop() {
  const lenis = useLenis();
  const { scrollY, scrollYProgress } = useScroll();
  const [pastIntro, setPastIntro] = useState(() => isPastFirstScreen(window.scrollY));
  const [footerInView, setFooterInView] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPastIntro(isPastFirstScreen(y)));

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return undefined;
    const observer = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), {
      rootMargin: "0px 0px -25% 0px",
    });
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return createPortal(
    <AnimatePresence>
      {pastIntro && !footerInView && (
        <Button
          key="back-to-top"
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => scrollToTarget(lenis, "#top")}
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          whileTap={{ scale: 0.92 }}
        >
          <svg className="progress" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="24.5" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="2" />
            <motion.circle
              cx="26"
              cy="26"
              r="24.5"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress, stroke: "var(--accent)" }}
            />
          </svg>
          <FiArrowUp aria-hidden="true" />
        </Button>
      )}
    </AnimatePresence>,
    document.body,
  );
}
