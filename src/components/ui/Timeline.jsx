import { useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useScroll } from "framer-motion";
import { FiCalendar } from "react-icons/fi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { optimizeImage } from "../../utils/image";
import { cardSurface, cardSurfaceHover, monoLabel, spotlight } from "./styles";

const STACKED_QUERY = "(max-width: 899px)";
const MARKER_SIZE = 52;

// An expanding ring around the current entry; transform and opacity keep it off the main thread.
const ripple = keyframes`
  from {
    transform: scale(1);
    opacity: 0.7;
  }
  to {
    transform: scale(1.45);
    opacity: 0;
  }
`;

const Wrapper = styled.div`
  position: relative;
`;

const List = styled.ol`
  position: relative;
  list-style: none;
`;

const Rail = styled.div`
  position: absolute;
  top: ${MARKER_SIZE / 2}px;
  bottom: ${MARKER_SIZE / 2}px;
  left: 50%;
  width: 2px;
  translate: -50% 0;
  border-radius: 2px;
  background: var(--line);

  @media (max-width: 899px) {
    left: ${MARKER_SIZE / 2}px;
  }
`;

const Progress = styled(motion.div)`
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgb(var(--accent-rgb) / 0.15), var(--accent));
  box-shadow: 0 0 14px rgb(var(--accent-rgb) / 0.35);
  transform-origin: top;
`;

const Item = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 88px minmax(0, 1fr);
  align-items: start;

  & + & {
    margin-top: 40px;
  }

  @media (max-width: 899px) {
    grid-template-columns: ${MARKER_SIZE}px minmax(0, 1fr);
    column-gap: 14px;

    & + & {
      margin-top: 28px;
    }
  }
`;

const Marker = styled.div`
  position: relative;
  z-index: 1;
  grid-row: 1;
  grid-column: 2;
  justify-self: center;
  width: ${MARKER_SIZE}px;
  height: ${MARKER_SIZE}px;
  border: 2px solid var(--line-strong);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 0 6px var(--bg);

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  &[data-current="true"] {
    border-color: var(--accent);

    &::after {
      content: "";
      position: absolute;
      inset: -2px;
      border: 2px solid var(--accent);
      border-radius: 50%;
      animation: ${ripple} 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
      pointer-events: none;

      @media (prefers-reduced-motion: reduce) {
        display: none;
      }
    }
  }

  @media (max-width: 899px) {
    grid-column: 1;
  }
`;

const DateTag = styled.p`
  ${monoLabel}
  grid-row: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 6px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(var(--bg-rgb) / 0.88);
  color: var(--text-muted);
  white-space: nowrap;

  ${Item}[data-side="left"] & {
    grid-column: 3;
    justify-self: start;
  }

  ${Item}[data-side="right"] & {
    grid-column: 1;
    justify-self: end;
  }

  @media (max-width: 899px) {
    display: none;
  }
`;

const CardSlot = styled(motion.div)`
  grid-row: 1;

  ${Item}[data-side="left"] & {
    grid-column: 1;
  }

  ${Item}[data-side="right"] & {
    grid-column: 3;
  }

  @media (max-width: 899px) {
    ${Item}[data-side] & {
      grid-column: 2;
    }
  }
`;

const CardShell = styled.article`
  ${cardSurface}
  ${spotlight}
  padding: 24px 26px;
  transition: border-color 0.3s ease;

  &:hover {
    ${cardSurfaceHover}
  }

  @media (max-width: 899px) {
    padding: 20px;
  }
`;

/** The shared card look for timeline entries, with the pointer spotlight. */
export function TimelineCard(props) {
  return <CardShell data-spotlight="" {...props} />;
}

const CardDateText = styled.p`
  ${monoLabel}
  display: none;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);

  @media (max-width: 899px) {
    display: inline-flex;
  }
`;

/** The date inside a card; only shown when the timeline collapses to a single column. */
export function TimelineCardDate({ children, className }) {
  return (
    <CardDateText className={className}>
      <FiCalendar aria-hidden="true" />
      {children}
    </CardDateText>
  );
}

/**
 * A vertical timeline. On wide screens entries alternate around a central rail with the
 * date opposite each card; on narrow screens the rail moves to the left.
 * Each entry is `{ id, date, logo, logoAlt, current, content }`.
 */
export default function Timeline({ entries, label }) {
  const wrapperRef = useRef(null);
  const stacked = useMediaQuery(STACKED_QUERY);
  const { scrollYProgress } = useScroll({ target: wrapperRef, offset: ["start 75%", "end 55%"] });

  return (
    <Wrapper ref={wrapperRef}>
      <Rail aria-hidden="true">
        <Progress style={{ scaleY: scrollYProgress }} />
      </Rail>
      <List aria-label={label}>
        {entries.map((entry, index) => {
          const side = index % 2 === 0 ? "left" : "right";
          const offset = stacked || side === "right" ? 36 : -36;
          return (
            <Item key={entry.id} data-side={side}>
              <Marker data-current={Boolean(entry.current)}>
                <img src={optimizeImage(entry.logo, 112)} alt={entry.logoAlt} width="48" height="48" loading="lazy" decoding="async" />
              </Marker>
              <DateTag>{entry.date}</DateTag>
              <CardSlot
                data-interactive
                initial={{ opacity: 0, x: offset }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -60px 0px" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {entry.content}
              </CardSlot>
            </Item>
          );
        })}
      </List>
    </Wrapper>
  );
}
