import { useCallback, useSyncExternalStore } from "react";

const subscribeToViewport = (onChange) => {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
  };
};

const getServerSnapshot = () => null;

/**
 * Returns the id of the section currently being read: the last one whose top edge has
 * passed `offset` (a fraction of the viewport height). The last section wins once the
 * page is scrolled to the bottom, even if it is too short to reach that line.
 * `ids` must be a stable (module level or memoised) array.
 */
export function useActiveSection(ids, offset = 0.35) {
  const getSnapshot = useCallback(() => {
    const { scrollHeight } = document.documentElement;
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= scrollHeight - 2) {
      return ids[ids.length - 1] ?? null;
    }
    const line = window.innerHeight * offset;
    let active = null;
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section && section.getBoundingClientRect().top <= line) active = id;
    }
    return active;
  }, [ids, offset]);

  return useSyncExternalStore(subscribeToViewport, getSnapshot, getServerSnapshot);
}

/** True once the page has been scrolled further than `threshold` pixels. */
export function useScrolled(threshold = 8) {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold]);
  return useSyncExternalStore(subscribeToViewport, getSnapshot, () => false);
}
