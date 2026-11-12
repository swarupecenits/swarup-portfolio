import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * While `open`: every other child of <body> is inert, the page can't scroll, and the
 * `[data-autofocus]` element inside `overlayRef` receives focus. Afterwards focus returns to
 * whatever was focused before, and the overlay itself turns inert while it animates out so a
 * slow exit can never hold on to focus or swallow clicks. `overlayRef` must point at a direct
 * child of <body> (a portal).
 */
export function useModalLock(open, overlayRef) {
  const lenis = useLenis();

  useEffect(() => {
    if (!open) return undefined;
    const overlay = overlayRef.current;
    // The overlay may be re-entering before its exit animation finished.
    if (overlay) overlay.inert = false;
    const opener = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    const inerted = [...document.body.children].filter((element) => element !== overlay && !element.inert);

    inerted.forEach((element) => {
      element.inert = true;
    });
    root.style.overflow = "hidden";
    lenis?.stop();
    overlay?.querySelector("[data-autofocus]")?.focus({ preventScroll: true });

    return () => {
      inerted.forEach((element) => {
        element.inert = false;
      });
      root.style.overflow = previousOverflow;
      lenis?.start();
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
      if (!overlay) return;
      // Focus can't return to <body>, so drop it rather than leave it in the closing overlay.
      if (overlay.contains(document.activeElement)) document.activeElement.blur();
      overlay.inert = true;
    };
  }, [open, lenis, overlayRef]);
}
