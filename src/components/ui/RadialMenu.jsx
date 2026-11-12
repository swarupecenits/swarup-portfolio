import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MENU_ITEMS = [
  { id: "love", emoji: "❤️", label: "Love", color: "#ef4444" },
  { id: "laugh", emoji: "😂", label: "Haha", color: "#fbbf24" },
  { id: "wow", emoji: "😮", label: "Wow", color: "#38bdf8" },
  { id: "smile", emoji: "😊", label: "Smile", color: "#bef264" },
  { id: "angry", emoji: "😡", label: "Angry", color: "#f97316" },
  { id: "fire", emoji: "🔥", label: "Lit", color: "#f59e0b" },
];

const RADIUS = 100;
const BUTTON_SIZE = 56;
const DEAD_ZONE = 30;
const EDGE_MARGIN = RADIUS + BUTTON_SIZE / 2 + 8;
const BURST_SIZE = 12;
const BURST_LIFETIME = 4000;
const SLICE = 360 / MENU_ITEMS.length;
// Right-clicking these keeps the browser's own context menu (copy link, paste, save image...).
// Dialogs are included so the playful menu never pops up over a modal.
const NATIVE_MENU_SELECTOR =
  'a[href], input, textarea, select, img, video, [contenteditable="true"], [contenteditable=""], [aria-modal="true"], [data-modal-root]';
const CENTERED = { translate: "-50% -50%" };

const ITEM_OFFSETS = MENU_ITEMS.map((_, index) => {
  const angle = ((index * SLICE - 90) * Math.PI) / 180;
  return { x: Math.cos(angle) * RADIUS, y: Math.sin(angle) * RADIUS };
});

const HUB_STYLE = {
  ...CENTERED,
  position: "absolute",
  left: 0,
  top: 0,
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  background: "var(--surface-strong)",
  border: "1px solid var(--line-strong)",
  boxShadow: "0 20px 40px -12px rgb(0 0 0 / 0.8)",
};

const HUB_DOT_STYLE = {
  width: 8,
  height: 8,
  borderRadius: 9999,
  background: "var(--accent)",
  boxShadow: "0 0 12px rgb(var(--accent-rgb) / 0.6)",
};

const LABEL_STYLE = {
  position: "absolute",
  top: 64,
  padding: "4px 10px",
  border: "1px solid var(--line-strong)",
  borderRadius: 9999,
  background: "var(--surface-strong)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  fontWeight: 500,
  letterSpacing: "0.08em",
  lineHeight: "16px",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const BURST_STYLE = {
  ...CENTERED,
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 100001,
  fontSize: 28,
  pointerEvents: "none",
};

const shouldUseNativeMenu = (event) => {
  if (event.shiftKey) return true;
  if (event.target instanceof Element && event.target.closest(NATIVE_MENU_SELECTOR)) return true;
  const selection = window.getSelection();
  return !!selection && !selection.isCollapsed && selection.toString().trim() !== "";
};

// The slice whose centre is closest to the pointer direction (0 = straight up, clockwise).
const indexFromVector = (dx, dy) => {
  const degrees = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  const normalized = ((degrees % 360) + 360) % 360;
  return Math.round(normalized / SLICE) % MENU_ITEMS.length;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), Math.max(min, max));

const createBurst = (id, emoji, origin) => ({
  id,
  particles: Array.from({ length: BURST_SIZE }, (_, index) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 40;
    const startX = origin.x + Math.cos(angle) * distance;
    const startY = origin.y + Math.sin(angle) * distance;
    const sway = (30 + Math.random() * 40) * (Math.random() > 0.5 ? 1 : -1);
    const scale = 1 + Math.random() * 1.5;
    return {
      id: index,
      emoji,
      x: [origin.x, startX, startX + sway, startX - sway * 0.5],
      y: [origin.y, startY, startY - 80, origin.y - 200 - Math.random() * 150],
      scale: [0, scale, scale * 1.1, scale * 0.8],
      duration: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 0.15,
    };
  }),
});

/**
 * Right-click (or right-drag) anywhere to open a radial emoji menu; picking one fires a
 * Google Meet style burst of floating reactions. Shift + right-click, links, images,
 * text fields and selected text keep the native context menu.
 */
export default function RadialMenu() {
  const [menu, setMenu] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    let origin = null;
    let active = null;
    let dragging = false;
    let suppressContextMenu = false;
    let swallowClick = false;
    let nextBurstId = 0;
    const timers = new Set();

    const setActive = (index) => {
      if (active === index) return;
      active = index;
      setActiveIndex(index);
    };

    const open = (x, y) => {
      origin = {
        x: clamp(x, EDGE_MARGIN, window.innerWidth - EDGE_MARGIN),
        y: clamp(y, EDGE_MARGIN, window.innerHeight - EDGE_MARGIN),
      };
      dragging = false;
      setActive(null);
      setMenu(origin);
    };

    const close = () => {
      if (!origin) return;
      origin = null;
      dragging = false;
      setActive(null);
      setMenu(null);
    };

    const select = () => {
      if (active !== null && origin) {
        const burst = createBurst(nextBurstId++, MENU_ITEMS[active].emoji, origin);
        setBursts((current) => [...current, burst]);
        const timer = setTimeout(() => {
          timers.delete(timer);
          setBursts((current) => current.filter((item) => item !== burst));
        }, BURST_LIFETIME);
        timers.add(timer);
      }
      close();
    };

    const onMouseDown = (event) => {
      if (event.button === 2) {
        if (shouldUseNativeMenu(event)) {
          close();
          return;
        }
        suppressContextMenu = true;
        open(event.clientX, event.clientY);
      } else if (event.button === 0 && origin) {
        // This click belongs to the menu: don't let it reach links or buttons underneath.
        event.preventDefault();
        event.stopPropagation();
        swallowClick = true;
        if (active !== null) select();
        else close();
      }
    };

    const onMouseMove = (event) => {
      if (!origin) return;
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;
      if (Math.hypot(dx, dy) <= DEAD_ZONE) {
        setActive(null);
        return;
      }
      if (event.buttons & 2) dragging = true;
      setActive(indexFromVector(dx, dy));
    };

    const onMouseUp = (event) => {
      if (event.button === 0 && swallowClick) {
        event.stopPropagation();
        // The click event follows this mouseup within the same task.
        setTimeout(() => {
          swallowClick = false;
        }, 0);
      }
      // A quick right-click keeps the menu open for a left-click pick; a right-drag picks on release.
      if (event.button === 2 && origin && dragging) select();
    };

    const onClick = (event) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    const onContextMenu = (event) => {
      if (!suppressContextMenu) return;
      suppressContextMenu = false;
      event.preventDefault();
    };

    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("mousedown", onMouseDown, true);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseup", onMouseUp, true);
    window.addEventListener("click", onClick, true);
    window.addEventListener("contextmenu", onContextMenu, true);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", close);
    window.addEventListener("resize", close);

    return () => {
      window.removeEventListener("mousedown", onMouseDown, true);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp, true);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("contextmenu", onContextMenu, true);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", close);
      window.removeEventListener("resize", close);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {menu && (
          <div
            key="radial-menu"
            aria-hidden="true"
            style={{ position: "fixed", left: menu.x, top: menu.y, zIndex: 100000, pointerEvents: "none" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={HUB_STYLE}
            >
              <span style={HUB_DOT_STYLE} />
            </motion.div>

            {MENU_ITEMS.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: isActive ? 1.2 : 1, ...ITEM_OFFSETS[index] }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  style={{
                    ...CENTERED,
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 9999,
                    border: `1px solid ${isActive ? item.color : "rgb(255 255 255 / 0.14)"}`,
                    backgroundColor: isActive ? item.color : "rgb(20 20 24)",
                    boxShadow: isActive ? `0 0 24px ${item.color}80` : "0 12px 24px -10px rgb(0 0 0 / 0.7)",
                    transition: "background-color 0.2s, border-color 0.2s, box-shadow 0.2s",
                  }}
                >
                  <span style={{ fontSize: 24, lineHeight: "32px" }}>{item.emoji}</span>
                  {isActive && (
                    <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={LABEL_STYLE}>
                      {item.label}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {bursts.map((burst) =>
        burst.particles.map((particle) => (
          <motion.span
            key={`${burst.id}-${particle.id}`}
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0, x: particle.x[0], y: particle.y[0] }}
            animate={{ opacity: [0, 1, 1, 0], scale: particle.scale, x: particle.x, y: particle.y }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
              times: [0, 0.15, 0.6, 1],
            }}
            style={BURST_STYLE}
          >
            {particle.emoji}
          </motion.span>
        )),
      )}
    </>
  );
}
