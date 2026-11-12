import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";

/** A number that counts up from zero the first time it scrolls into view (and `when` is true). */
export default function CountUp({ value, decimals = 0, suffix = "", duration = 1.8, delay = 0, when = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => `${latest.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    if (!inView || !when) return undefined;
    const controls = animate(count, value, { duration, delay, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [count, inView, when, value, duration, delay]);

  return (
    <>
      <motion.span ref={ref} aria-hidden="true">
        {display}
      </motion.span>
      <span className="sr-only">{`${value.toFixed(decimals)}${suffix}`}</span>
    </>
  );
}
