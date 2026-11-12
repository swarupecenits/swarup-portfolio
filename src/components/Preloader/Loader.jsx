import { useState } from "react";
import { motion } from "framer-motion";
import styled from "styled-components";
import { prefersReducedMotion } from "../../hooks/useMediaQuery";
import { fadeOut, opacity, slideUp } from "./anim";

const LoaderContainer = styled(motion.div)`
  position: fixed;
  inset: 0 auto auto 0;
  z-index: 9999;
  width: 100vw;
  height: 100dvh;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-inline: 60px;
  padding-bottom: 30px;
  background-color: var(--bg);
  will-change: transform;

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% + 300px);
    pointer-events: none;

    path {
      fill: var(--bg);
    }
  }

  p {
    position: absolute;
    z-index: 1;
    display: flex;
    align-items: center;
    color: var(--text);
    font-size: 72px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.05em;
  }

  @media (max-width: 768px) {
    padding-inline: 20px;
    padding-bottom: 80px;

    p {
      font-size: 48px;
    }
  }
`;

const EASE = [0.76, 0, 0.24, 1];

export default function Loader({ counterRef }) {
  const [{ width, height }] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  const [reducedMotion] = useState(prefersReducedMotion);

  const curve = {
    initial: {
      d: `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height + 300} 0 ${height} L0 0`,
    },
    exit: {
      d: `M0 0 L${width} 0 L${width} ${height} Q${width / 2} ${height} 0 ${height} L0 0`,
      transition: { duration: 0.7, ease: EASE, delay: 0.3 },
    },
  };

  return (
    <LoaderContainer variants={reducedMotion ? fadeOut : slideUp} initial="initial" exit="exit" role="status">
      <span className="sr-only">Loading portfolio</span>
      <motion.p ref={counterRef} variants={opacity} initial="initial" animate="enter" aria-hidden="true">
        0 %
      </motion.p>
      {!reducedMotion && (
        <svg aria-hidden="true">
          <motion.path variants={curve} initial="initial" exit="exit" />
        </svg>
      )}
    </LoaderContainer>
  );
}
