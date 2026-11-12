import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { prefersReducedMotion } from "../../hooks/useMediaQuery";

const MAX_DOTS = 8;

// Bleeds to the viewport edges so neighbouring slides peek in from the sides.
const Region = styled.div`
  margin-inline: calc(50% - 50vw);
`;

const Track = styled.div`
  position: relative;
  display: flex;
  gap: 14px;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 7%;
  padding: 6px 7% 18px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Slide = styled.div`
  flex: 0 0 ${({ $width }) => $width};
  min-width: 0;
  scroll-snap-align: center;
  scroll-snap-stop: always;
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;

  &[data-active="false"] {
    opacity: 0.55;
    transform: scale(0.96);
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 6px;
`;

const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

const Dot = styled.button`
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: 0;
  background: transparent;
  cursor: pointer;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: rgb(255 255 255 / 0.22);
    transition:
      width 0.3s var(--ease-out),
      background-color 0.3s ease;
  }

  &[aria-current="true"]::before {
    width: 22px;
    background: var(--accent);
  }
`;

const Arrow = styled.button`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--line-strong);
  border-radius: 50%;
  background: var(--surface-strong);
  color: var(--text-soft);
  font-size: 20px;
  cursor: pointer;
  transition:
    opacity 0.2s ease,
    color 0.2s ease;

  &:hover:not(:disabled) {
    color: var(--accent);
  }

  &:disabled {
    cursor: default;
    opacity: 0.35;
  }
`;

const Counter = styled.p`
  min-width: 64px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  font-weight: 500;
  text-align: center;
`;

/**
 * A lightweight, swipeable carousel built on native CSS scroll snapping.
 * Remount it (via `key`) when the item list changes to start from the first slide.
 */
export default function SnapCarousel({ items, getKey, renderItem, label, slideWidth = "86%" }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);
  const count = items.length;
  const hasItems = count > 0;
  const current = Math.min(active, Math.max(count - 1, 0));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let closestDistance = Infinity;
      Array.from(track.children).forEach((slide, index) => {
        const distance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - center);
        if (distance < closestDistance) {
          closestDistance = distance;
          closest = index;
        }
      });
      setActive(closest);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [hasItems]);

  const goTo = (index) => {
    const track = trackRef.current;
    const slide = track?.children[index];
    if (!slide) return;
    track.scrollTo({
      left: slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  if (!hasItems) return null;

  return (
    <Region role="region" aria-roledescription="carousel" aria-label={label}>
      <Track ref={trackRef} data-interactive>
        {items.map((item, index) => (
          <Slide
            key={getKey(item)}
            $width={slideWidth}
            data-active={index === current}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
          >
            {renderItem(item, index)}
          </Slide>
        ))}
      </Track>

      {count > 1 && (
        <Controls>
          {count <= MAX_DOTS ? (
            <Dots>
              {items.map((item, index) => (
                <Dot
                  key={getKey(item)}
                  type="button"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === current}
                  onClick={() => goTo(index)}
                />
              ))}
            </Dots>
          ) : (
            <>
              <Arrow type="button" aria-label="Previous slide" disabled={current === 0} onClick={() => goTo(current - 1)}>
                <FiChevronLeft aria-hidden="true" />
              </Arrow>
              <Counter aria-live="polite">
                {current + 1} / {count}
              </Counter>
              <Arrow type="button" aria-label="Next slide" disabled={current === count - 1} onClick={() => goTo(current + 1)}>
                <FiChevronRight aria-hidden="true" />
              </Arrow>
            </>
          )}
        </Controls>
      )}
    </Region>
  );
}
