import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PIKACHU_SRC = `${import.meta.env.BASE_URL}assets/pikachu-running.gif`;
const RUNNER_HEIGHT = 110;
const MAX_RUNNERS = 20;

// Behind the 3D keyboard and the page content, above the star field.
const CONTAINER_STYLE = {
  position: "fixed",
  inset: 0,
  overflow: "hidden",
  zIndex: -1,
  pointerEvents: "none",
};

const isEditable = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

function Runner({ onDone }) {
  const [top] = useState(() => `calc((100% - ${RUNNER_HEIGHT}px) * ${Math.random().toFixed(3)})`);
  return (
    <motion.img
      src={PIKACHU_SRC}
      alt=""
      draggable={false}
      initial={{ x: "-20vw" }}
      animate={{ x: "100vw" }}
      transition={{ duration: 5, ease: "linear" }}
      onAnimationComplete={onDone}
      style={{ position: "absolute", left: 0, top, height: RUNNER_HEIGHT, width: "auto" }}
    />
  );
}

/** Press "n" anywhere (outside form fields) and a Pikachu runs across the screen. */
export default function NyanCat() {
  const [runners, setRunners] = useState([]);

  useEffect(() => {
    let nextId = 0;
    const onKeyDown = (event) => {
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      // Autofill can dispatch keydown events without a key.
      if (event.key?.toLowerCase() !== "n" || isEditable(event.target)) return;
      const id = nextId++;
      setRunners((current) => (current.length >= MAX_RUNNERS ? current : [...current, id]));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (runners.length === 0) return null;

  return (
    <div aria-hidden="true" style={CONTAINER_STYLE}>
      {runners.map((id) => (
        <Runner key={id} onDone={() => setRunners((current) => current.filter((runner) => runner !== id))} />
      ))}
    </div>
  );
}
