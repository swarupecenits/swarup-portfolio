import { prefersReducedMotion } from "../hooks/useMediaQuery";

const resolveTarget = (target) => {
  if (typeof target !== "string") return target ?? null;
  if (target === "#" || target === "#top") return null;
  return target.startsWith("#")
    ? document.getElementById(decodeURIComponent(target.slice(1)))
    : document.querySelector(target);
};

/**
 * Scrolls to an element, selector, hash or the top of the page using Lenis
 * when available and the native smooth scroll otherwise.
 * With `focus: true` keyboard focus is moved to the target for accessibility.
 */
export function scrollToTarget(lenis, target, { focus = false, ...options } = {}) {
  const element = resolveTarget(target);

  if (lenis) {
    lenis.scrollTo(element ?? 0, { force: true, ...options });
  } else {
    const behavior = options.immediate || prefersReducedMotion() ? "auto" : "smooth";
    if (element) element.scrollIntoView({ behavior, block: "start" });
    else window.scrollTo({ top: 0, behavior });
  }

  if (focus && element) {
    if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "-1");
    element.focus({ preventScroll: true });
  }
  return element;
}
