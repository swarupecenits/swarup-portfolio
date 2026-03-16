import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { id: 'love', emoji: '❤️', label: 'Love', color: '#ef4444' },
  { id: 'laugh', emoji: '😂', label: 'Haha', color: '#fbbf24' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: '#3b82f6' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: '#60a5fa' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: '#f97316' },
  { id: 'fire', emoji: '🔥', label: 'Lit', color: '#f59e0b' },
];

const DEAD_ZONE = 20;
const HOLD_DELAY = 0;

export default function RadialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(null);

  const isOpenRef = useRef(false);
  const menuPosRef = useRef({ x: 0, y: 0 });
  const activeIndexRef = useRef(null);
  const timerRef = useRef(null);
  const suppressMenuRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
    menuPosRef.current = menuPos;
    activeIndexRef.current = activeIndex;
  }, [isOpen, menuPos, activeIndex]);

  const fireConfetti = useCallback((pageX, pageY, emoji) => {
    const normalizedX = (pageX - window.scrollX) / window.innerWidth;
    const normalizedY = (pageY - window.scrollY) / window.innerHeight;
    const count = 5;

    for (let i = 0; i < count; i++) {
      const scalar = 1.5 + Math.random() * 5;
      const emojiShape = confetti.shapeFromText({ text: emoji, scalar });

      confetti({
        particleCount: 15,
        spread: 60 + Math.random() * 20,
        origin: { x: normalizedX, y: normalizedY },
        shapes: [emojiShape],
        scalar,
        disableForReducedMotion: true,
        zIndex: 9999,
        startVelocity: 25 + Math.random() * 10,
        gravity: 0.6 + Math.random() * 0.4,
        drift: (Math.random() - 0.5) * 0.5,
      });
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 2) {
      const pos = { x: e.clientX, y: e.clientY };
      timerRef.current = setTimeout(() => {
        setMenuPos(pos);
        setIsOpen(true);
        setActiveIndex(null);
        suppressMenuRef.current = true;
      }, HOLD_DELAY);
    }
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isOpenRef.current) return;
    const currentPos = { x: e.clientX, y: e.clientY };
    const origin = menuPosRef.current;
    
    // Mathematical distance between cursor and center
    const dist = Math.sqrt(Math.pow(currentPos.x - origin.x, 2) + Math.pow(currentPos.y - origin.y, 2));

    if (dist < DEAD_ZONE) {
      if (activeIndexRef.current !== null) setActiveIndex(null);
      return;
    }

    let theta = Math.atan2(currentPos.y - origin.y, currentPos.x - origin.x);
    let angle = theta * 180 / Math.PI;

    const count = MENU_ITEMS.length;
    const normalizedAngle = (angle + 90) % 360;
    const positiveAngle = normalizedAngle < 0 ? normalizedAngle + 360 : normalizedAngle;
    const index = Math.floor(positiveAngle / (360 / count));

    if (activeIndexRef.current !== index) {
      setActiveIndex(index);
    }
  }, []);

  const handleMouseUp = useCallback((e) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isOpenRef.current) {
      if (activeIndexRef.current !== null) {
        const item = MENU_ITEMS[activeIndexRef.current];
        fireConfetti(e.pageX, e.pageY, item.emoji);
      }
      setIsOpen(false);
      setActiveIndex(null);
    }
  }, [fireConfetti]);

  const handleContextMenu = useCallback((e) => {
    if (suppressMenuRef.current) {
      e.preventDefault();
      suppressMenuRef.current = false;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu]);

  const radius = 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            zIndex: 100000,
            left: menuPos.x,
            top: menuPos.y,
            pointerEvents: 'none',
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{
              position: 'absolute',
              borderRadius: '9999px',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(23, 23, 23, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              left: 0,
              top: 0
            }}
          >
            <div style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.5)', borderRadius: '9999px' }} />
          </motion.div>

          {MENU_ITEMS.map((item, index) => {
            const count = MENU_ITEMS.length;
            const slice = 360 / count;
            const angleDeg = (index * slice) - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            const isActive = activeIndex === index;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1.2 : 1,
                  x,
                  y,
                }}
                exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'translate(-50%, -50%)',
                  left: 0, // Animate uses x, y relative to left/top 0
                  top: 0
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '9999px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    backgroundColor: isActive ? item.color : '#262626',
                    borderColor: isActive ? item.color : '#404040',
                    color: isActive ? '#fff' : '#fff'
                  }}
                >
                  <span style={{ fontSize: '24px', lineHeight: '32px' }}>{item.emoji}</span>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        position: 'absolute',
                        top: '64px',
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        fontSize: '12px',
                        lineHeight: '16px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backdropFilter: 'blur(12px)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.label}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}