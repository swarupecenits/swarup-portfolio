import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import gsap from "gsap";
import Loader from "./Loader";
import { PreloaderContext } from "./context";
import { prefersReducedMotion } from "../../hooks/useMediaQuery";
import { scrollToTarget } from "../../utils/scroll";

const VISITED_KEY = "portfolio:visited";

// Full intro on the first visit, a quicker one on reloads within the same session.
function getLoadingTime() {
  if (prefersReducedMotion()) return 0.6;
  try {
    return sessionStorage.getItem(VISITED_KEY) ? 1.2 : 2.5;
  } catch {
    return 2.5;
  }
}

export default function Preloader({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const counterRef = useRef(null);
  const lenis = useLenis();

  useEffect(() => {
    const progress = { value: 0 };
    const tween = gsap.to(progress, {
      value: 100,
      duration: getLoadingTime(),
      ease: "power2.inOut",
      onUpdate: () => {
        if (counterRef.current) counterRef.current.textContent = `${Math.floor(progress.value / 5) * 5} %`;
      },
      onComplete: () => {
        try {
          sessionStorage.setItem(VISITED_KEY, "1");
        } catch {
          // Storage can be unavailable (e.g. privacy mode); the full intro is fine then.
        }
        setIsLoading(false);
      },
    });
    return () => tween.kill();
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (isLoading) lenis.stop();
    else lenis.start();
  }, [lenis, isLoading]);

  // Honour deep links such as /#projects once the content is visible.
  useEffect(() => {
    if (isLoading || !window.location.hash) return undefined;
    const frame = requestAnimationFrame(() => scrollToTarget(lenis, window.location.hash, { immediate: true }));
    return () => cancelAnimationFrame(frame);
  }, [isLoading, lenis]);

  const value = useMemo(() => ({ isLoading }), [isLoading]);

  return (
    <PreloaderContext value={value}>
      <AnimatePresence mode="wait">{isLoading && <Loader counterRef={counterRef} />}</AnimatePresence>
      {children}
    </PreloaderContext>
  );
}
