import { useEffect } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

/**
 * One document-wide, frame-throttled pointer listener that writes the pointer position
 * (relative to the element) to `--mx` / `--my` on the hovered `[data-spotlight]` element.
 * Cards use these variables for a soft light that follows the mouse.
 */
export function useSpotlight() {
  useEffect(() => {
    if (!window.matchMedia(FINE_POINTER_QUERY).matches) return undefined;

    let frame = 0;
    let latest = null;

    const update = () => {
      frame = 0;
      const target = latest?.target;
      const element = target instanceof Element ? target.closest("[data-spotlight]") : null;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      element.style.setProperty("--mx", `${latest.clientX - rect.left}px`);
      element.style.setProperty("--my", `${latest.clientY - rect.top}px`);
    };

    const onPointerMove = (event) => {
      if (event.pointerType !== "mouse") return;
      latest = event;
      if (!frame) frame = requestAnimationFrame(update);
    };

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      cancelAnimationFrame(frame);
    };
  }, []);
}
