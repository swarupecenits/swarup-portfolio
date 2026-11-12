import { Fragment, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";

const slide = keyframes`
  to {
    transform: translate3d(-50%, 0, 0);
  }
`;

const Viewport = styled.div`
  overflow: hidden;
`;

const Track = styled.div`
  display: flex;
  width: max-content;
  animation: ${slide} var(--marquee-duration) linear infinite;
  animation-direction: ${({ $reverse }) => ($reverse ? "reverse" : "normal")};

  [data-paused="true"] > & {
    animation-play-state: paused;
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Group = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
`;

/**
 * Endless horizontal ticker. The content is rendered twice and the track slides by exactly
 * half its width, so the loop is seamless. `repeat` copies the children inside each half so
 * short content still spans wide screens. It pauses while off screen. Decorative only.
 */
export default function Marquee({ children, duration = 40, reverse = false, repeat = 2, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      node.dataset.paused = String(!entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const half = Array.from({ length: repeat }, (_, index) => <Fragment key={index}>{children}</Fragment>);

  return (
    <Viewport ref={ref} className={className} aria-hidden="true" style={{ "--marquee-duration": `${duration}s` }}>
      <Track $reverse={reverse}>
        <Group>{half}</Group>
        <Group>{half}</Group>
      </Track>
    </Viewport>
  );
}
