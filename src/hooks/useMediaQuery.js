import { useCallback, useSyncExternalStore } from "react";

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (onChange) => {
      const mediaQuery = window.matchMedia(query);
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const MOBILE_QUERY = "(max-width: 768px)";
export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_MOTION_QUERY);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION_QUERY).matches;
