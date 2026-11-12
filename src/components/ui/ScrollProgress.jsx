import { motion, useScroll, useSpring } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

const BAR_STYLE = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  height: 2,
  transformOrigin: "0%",
  background: "var(--accent)",
  boxShadow: "0 0 10px rgb(var(--accent-rgb) / 0.55)",
  zIndex: 9999,
  pointerEvents: "none",
};

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const reducedMotion = usePrefersReducedMotion();

  return <motion.div aria-hidden="true" style={{ ...BAR_STYLE, scaleX: reducedMotion ? scrollYProgress : smoothProgress }} />;
}
