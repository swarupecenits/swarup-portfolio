import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { scrollToTarget } from "../utils/scroll";

gsap.registerPlugin(ScrollTrigger);

// Lenis is driven by the GSAP ticker so ScrollTrigger and smooth scrolling share one frame loop.
const LENIS_OPTIONS = { autoRaf: false, lerp: 0.1, anchors: false };

function LenisBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return undefined;
    const update = (time) => lenis.raf(time * 1000);
    const unsubscribe = lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
      unsubscribe();
    };
  }, [lenis]);

  // In-page links (#section) scroll smoothly, keep the URL shareable and move focus.
  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!anchor) return;
      const hash = anchor.getAttribute("href");
      const isTop = hash === "#" || hash === "#top";
      if (!isTop && !document.getElementById(decodeURIComponent(hash.slice(1)))) return;

      event.preventDefault();
      scrollToTarget(lenis, hash, { focus: !isTop });
      const url = isTop ? window.location.pathname + window.location.search : hash;
      window.history.replaceState(window.history.state, "", url);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return null;
}

export default function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={LENIS_OPTIONS}>
      <LenisBridge />
      {children}
    </ReactLenis>
  );
}
