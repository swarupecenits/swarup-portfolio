import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";

const LINK_STYLE = {
  display: "block",
  width: "fit-content",
  minHeight: 46,
  padding: 5,
  border: "1.5px solid rgb(255 255 255 / 0.28)",
  borderRadius: 9999,
};

const DOT_STYLE = {
  display: "block",
  width: 10,
  height: 10,
  borderRadius: "50%",
  backgroundColor: "var(--accent)",
};

const BOUNCE = { y: [0, 25], opacity: [1, 0] };
const BOUNCE_TRANSITION = { duration: 1, ease: "easeOut", repeat: Infinity, repeatDelay: 1 };
const REST = { y: 0, opacity: 1 };
const INSTANT = { duration: 0 };

const isAtTop = () => window.scrollY <= 10;

export default function ScrollDownIcon({ href = "#skills" }) {
  const [visible, setVisible] = useState(isAtTop);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(isAtTop());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          key="scroll-down"
          href={href}
          aria-label="Scroll to the next section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          style={LINK_STYLE}
        >
          <motion.span
            animate={reducedMotion ? REST : BOUNCE}
            transition={reducedMotion ? INSTANT : BOUNCE_TRANSITION}
            style={DOT_STYLE}
          />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
