import { useEffect, useRef } from "react";
import styled from "styled-components";
import { REDUCED_MOTION_QUERY } from "../../hooks/useMediaQuery";
import { isLowPowerDevice } from "../../utils/gpu";

// India's geographic centre (the Zero Mile Stone in Nagpur).
const HOME = [21.15, 79.08];
// cobe spins the globe by `phi`; this angle brings HOME to the front.
const HOME_PHI = Math.PI - ((HOME[1] * Math.PI) / 180 - Math.PI / 2);
const THETA = 0.3;
const SWAY = 0.45;
const SWAY_PERIOD = 16000;
const RETURN_DURATION = 1500;
const MAX_DPR = 2;
// If the map texture can't be watched, keep drawing briefly so it appears once decoded.
const SETTLE_FRAMES = 90;

/**
 * cobe decodes its map texture from an `Image` and only shows it on the next draw. Catching the
 * images it creates lets the globe be redrawn once they load instead of drawing blindly.
 */
function createGlobeWatchingImages(createGlobe, canvas, options) {
  const NativeImage = window.Image;
  const images = [];
  window.Image = function WatchedImage(...args) {
    const image = new NativeImage(...args);
    images.push(image);
    return image;
  };
  try {
    return { instance: createGlobe(canvas, options), images };
  } finally {
    window.Image = NativeImage;
  }
}

const Host = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  contain: layout paint;
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
  -webkit-user-select: none;

  &::before {
    content: "";
    position: absolute;
    inset: 10%;
    border-radius: 50%;
    background: radial-gradient(circle, rgb(var(--accent-rgb) / 0.12) 0%, rgb(var(--accent-rgb) / 0.04) 45%, transparent 70%);
    pointer-events: none;
  }

  &[data-dragging] {
    cursor: grabbing;
  }

  canvas {
    display: block;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 1.2s ease;
  }

  &[data-ready] canvas {
    opacity: 1;
  }
`;

/**
 * A slowly swaying WebGL globe centred on India; drag it sideways to spin it. It holds still
 * when reduced motion is requested and without a GPU, where every frame of it is costly.
 */
export default function Globe({ className }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const lowPower = isLowPowerDevice();
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let globe = null;
    let resizeObserver = null;
    let disposed = false;
    let initStarted = false;
    let visible = false;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;
    let pendingFrames = 0;
    let framesDrawn = 0;
    let size = 0;
    let dragOffset = 0;
    let drag = null;

    const tick = (now) => {
      frame = 0;
      if (!globe || !visible) return;
      const delta = Math.min(now - lastTime, 50);
      lastTime = now;
      const animated = !lowPower && !motionQuery.matches;
      if (animated && !drag) {
        elapsed += delta;
        dragOffset *= Math.exp(-delta / RETURN_DURATION);
      }
      const sway = animated ? Math.sin((elapsed / SWAY_PERIOD) * Math.PI * 2) * SWAY : 0;
      globe.update({ phi: HOME_PHI + sway + dragOffset, theta: THETA });

      framesDrawn += 1;
      if (framesDrawn === 2) host.dataset.ready = "";
      pendingFrames = Math.max(0, pendingFrames - 1);
      if (animated || drag || pendingFrames > 0) frame = requestAnimationFrame(tick);
    };

    const requestFrames = (count) => {
      pendingFrames = Math.max(pendingFrames, count);
      if (frame || !globe || !visible) return;
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const next = Math.round(host.clientWidth);
      if (!globe || !next || next === size) return;
      size = next;
      globe.update({ width: size, height: size });
      requestFrames(2);
    };

    const init = async () => {
      let createGlobe;
      try {
        ({ default: createGlobe } = await import("cobe"));
      } catch {
        // Offline or blocked: the soft glow behind the globe remains as a fallback.
        return;
      }
      if (disposed) return;

      const canvas = document.createElement("canvas");
      host.append(canvas);
      size = Math.round(host.clientWidth) || 320;
      const headBefore = new Set(document.head.children);
      const { instance, images } = createGlobeWatchingImages(createGlobe, canvas, {
        devicePixelRatio: Math.min(window.devicePixelRatio || 1, lowPower ? 1 : MAX_DPR),
        width: size,
        height: size,
        phi: HOME_PHI,
        theta: THETA,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 5,
        baseColor: [0.36, 0.36, 0.4],
        markerColor: [0.75, 0.95, 0.4],
        glowColor: [0.2, 0.24, 0.13],
        markers: [{ location: HOME, size: 0.07 }],
      });
      // cobe keeps a <style> in <head> for CSS anchor positioning and rewrites it on every
      // frame. No marker has an id, so it is always empty: detaching it avoids a
      // document-wide style recalculation per frame.
      for (const element of [...document.head.children]) {
        if (!headBefore.has(element) && element.tagName === "STYLE") element.remove();
      }

      // Without WebGL cobe returns a no-op globe and leaves the canvas unwrapped.
      if (canvas.parentElement === host) {
        canvas.remove();
        return;
      }

      globe = instance;
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);
      for (const image of images) image.addEventListener("load", () => requestFrames(1), { once: true });
      requestFrames(images.length ? 2 : SETTLE_FRAMES);
    };

    const startInit = () => {
      if (initStarted) return;
      initStarted = true;
      init();
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) {
          cancelAnimationFrame(frame);
          frame = 0;
          return;
        }
        startInit();
        requestFrames(2);
      },
      { rootMargin: "300px 0px" },
    );
    visibilityObserver.observe(host);
    // Creating the globe compiles its shaders, which stalls a frame (by ~0.1 s without a GPU), so
    // it is done once the browser is idle rather than while the section scrolls into view.
    const idleCallback = window.requestIdleCallback?.(startInit);

    const onPointerDown = (event) => {
      if (!globe || drag || (event.pointerType === "mouse" && event.button !== 0)) return;
      drag = { pointerId: event.pointerId, startX: event.clientX, startOffset: dragOffset };
      host.setPointerCapture(event.pointerId);
      host.dataset.dragging = "";
      requestFrames(1);
    };

    const onPointerMove = (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      // Dragging across the full width spins the globe half a turn.
      dragOffset = drag.startOffset + ((event.clientX - drag.startX) / Math.max(size, 1)) * Math.PI;
    };

    const endDrag = (event) => {
      if (drag?.pointerId !== event.pointerId) return;
      drag = null;
      delete host.dataset.dragging;
      requestFrames(1);
    };

    const onMotionPreferenceChange = () => requestFrames(2);

    host.addEventListener("pointerdown", onPointerDown);
    host.addEventListener("pointermove", onPointerMove);
    host.addEventListener("pointerup", endDrag);
    host.addEventListener("pointercancel", endDrag);
    host.addEventListener("lostpointercapture", endDrag);
    motionQuery.addEventListener("change", onMotionPreferenceChange);

    return () => {
      disposed = true;
      if (idleCallback !== undefined) window.cancelIdleCallback(idleCallback);
      cancelAnimationFrame(frame);
      visibilityObserver.disconnect();
      resizeObserver?.disconnect();
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointercancel", endDrag);
      host.removeEventListener("lostpointercapture", endDrag);
      motionQuery.removeEventListener("change", onMotionPreferenceChange);
      globe?.destroy();
      globe = null;
      host.replaceChildren();
      delete host.dataset.ready;
      delete host.dataset.dragging;
    };
  }, []);

  return <Host ref={hostRef} className={className} aria-hidden="true" data-interactive />;
}
