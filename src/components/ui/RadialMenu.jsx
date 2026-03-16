import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MENU_ITEMS = [
  { id: 'love', emoji: '❤️', label: 'Love', color: '#ef4444' },
  { id: 'laugh', emoji: '😂', label: 'Haha', color: '#fbbf24' },
  { id: 'wow', emoji: '😮', label: 'Wow', color: '#3b82f6' },
  { id: 'sad', emoji: '😊', label: 'Smile', color: '#60a5fa' },
  { id: 'angry', emoji: '😡', label: 'Angry', color: '#f97316' },
  { id: 'fire', emoji: '🔥', label: 'Lit', color: '#f59e0b' },
];

const DEAD_ZONE = 30; // Increased slighty for smoother interaction center

export default function RadialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [activeIndex, setActiveIndex] = useState(null);
  const [floatingEmojis, setFloatingEmojis] = useState([]);

  const isOpenRef = useRef(false);
  const menuPosRef = useRef({ x: 0, y: 0 });
  const activeIndexRef = useRef(null);
  const isDraggingRef = useRef(false);
  const suppressMenuRef = useRef(false);

  useEffect(() => {
    isOpenRef.current = isOpen;
    menuPosRef.current = menuPos;
    activeIndexRef.current = activeIndex;
  }, [isOpen, menuPos, activeIndex]);

  const fireFloatingEmojis = useCallback((emoji) => {
    const origin = menuPosRef.current;
    const count = 12;

    const newEmojis = Array.from({ length: count }).map((_, i) => {
      // Create a burst effect outwards, then float up
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 40;
      const startX = origin.x + Math.cos(angle) * radius;
      const startY = origin.y + Math.sin(angle) * radius;

      const swayDirection = Math.random() > 0.5 ? 1 : -1;
      const swayAmount = 30 + Math.random() * 40;

      return {
        id: Date.now() + i + Math.random(),
        x: origin.x,
        y: origin.y,
        emoji,
        delay: Math.random() * 0.15,
        duration: 1.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 1.5,
        xOffsets: [
          origin.x, // Start at cursor
          startX, // Burst out
          startX + swayAmount * swayDirection, // Sway
          startX - swayAmount * swayDirection * 0.5 // Sway back
        ],
        yOffsets: [
          origin.y, // Start
          startY, // Burst out
          startY - 80, // Float up
          origin.y - 200 - Math.random() * 150 // Float off screen
        ]
      };
    });

    setFloatingEmojis(prev => [...prev, ...newEmojis]);

    // Clean up emojis from state after animation completes
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => !newEmojis.find(n => n.id === e.id)));
    }, 4000);
  }, []);

  const triggerAction = useCallback(() => {
    if (activeIndexRef.current !== null) {
      const item = MENU_ITEMS[activeIndexRef.current];
      fireFloatingEmojis(item.emoji);
    }
    setIsOpen(false);
    setActiveIndex(null);
  }, [fireFloatingEmojis]);

  const handleMouseDown = useCallback((e) => {
    if (e.button === 2) {
      // Right click opens menu
      setMenuPos({ x: e.clientX, y: e.clientY });
      setIsOpen(true);
      setActiveIndex(null);
      suppressMenuRef.current = true;
      isDraggingRef.current = false;
    } else if (e.button === 0 && isOpenRef.current) {
      // Left click while menu is open
      if (activeIndexRef.current !== null) {
        triggerAction();
      } else {
        setIsOpen(false); // Dismiss menu on clicking outside
      }
    }
  }, [triggerAction]);

  const handleMouseMove = useCallback((e) => {
    if (!isOpenRef.current) return;
    const currentPos = { x: e.clientX, y: e.clientY };
    const origin = menuPosRef.current;
    
    const dist = Math.sqrt(Math.pow(currentPos.x - origin.x, 2) + Math.pow(currentPos.y - origin.y, 2));

    if (dist > DEAD_ZONE) {
      isDraggingRef.current = true;
    } else {
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
    if (!isOpenRef.current) return;

    if (e.button === 2) {
      if (isDraggingRef.current) {
        // Behaved as a drag interaction
        triggerAction();
      }
      // If NOT dragged, it means it was a quick right-click. We KEEP it open so user can left-click to select.
    }
  }, [triggerAction]);

  const handleContextMenu = useCallback((e) => {
    if (suppressMenuRef.current) {
      e.preventDefault();
      suppressMenuRef.current = false;
    }
  }, []);

  // Make sure ESC key dismisses the menu beautifully
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && isOpenRef.current) {
      setIsOpen(false);
      setActiveIndex(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleContextMenu, handleKeyDown]);

  const radius = 100;

  return (
    <>
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
                    left: 0,
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

      {/* Floating Google Meet Emoji Style */}
      {floatingEmojis.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0, x: item.xOffsets[0], y: item.yOffsets[0] }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, item.size, item.size * 1.1, item.size * 0.8],
            x: item.xOffsets,
            y: item.yOffsets
          }}
          transition={{
            duration: item.duration,
            ease: "easeOut",
            delay: item.delay,
            times: [0, 0.15, 0.6, 1] // Dictates the timing for 'burst', 'sway', 'fade'
          }}
          style={{
            position: 'fixed',
            zIndex: 999999,
            pointerEvents: 'none',
            fontSize: '28px',
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform'
          }}
        >
          {item.emoji}
        </motion.div>
      ))}
    </>
  );
}
