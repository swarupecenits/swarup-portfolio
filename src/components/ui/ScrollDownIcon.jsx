import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const ScrollDownIcon = () => {
  const [show, setShow] = useState(true);
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (window.scrollY > 10) {
        setShow(false);
      } else {
        setShow(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          style={{
            width: 'fit-content',
            minHeight: '50px',
            padding: '4px',
            border: '2px solid #a855f7', // Primary color
            borderRadius: '9999px'
          }}
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, 25], opacity: [1, 0] }}
            transition={{
              duration: 1,
              ease: "easeOut",
              repeat: Infinity,
              repeatDelay: 1,
            }}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#a855f7'
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScrollDownIcon;