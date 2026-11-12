import { motion } from "framer-motion";
import { isLowPowerDevice } from "../../utils/gpu";

const BLUR_VARIANTS = {
  hidden: { filter: "blur(10px)", opacity: 0 },
  // Drop the filter afterwards so the text doesn't stay on its own compositing layer.
  visible: { filter: "blur(0px)", opacity: 1, transitionEnd: { filter: "none" } },
};
const FADE_VARIANTS = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

/** Fades its children in from a blur once `when` becomes true; without a GPU it only fades. */
export function BlurIn({ children, className, delay = 0, duration = 1, when = true }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={when ? "visible" : "hidden"}
      variants={isLowPowerDevice() ? FADE_VARIANTS : BLUR_VARIANTS}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
