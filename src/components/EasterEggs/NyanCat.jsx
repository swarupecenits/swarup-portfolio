import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

const getRandomHeight = () => {
  return `${Math.random() * 100}vh`;
};

const Container = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: -1; /* Placed completely behind the Spline keyboard (0) */
  pointer-events: none; /* Make sure it doesn't block clicks on main app */
`;

const NyanImage = styled.img`
  position: fixed;
  height: 110px;
  width: auto;
  pointer-events: auto; /* Let users click the cat */
  cursor: pointer;
  z-index: -1;
`;

const NyanCat = () => {
  const [divs, setDivs] = useState([]);

  const spawnDiv = () => {
    const newDiv = {
      id: (Math.random() * 100000).toFixed(),
    };
    setDivs((prevDivs) => [...prevDivs, newDiv]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key.toLowerCase() === "n") spawnDiv();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Container>
      <AnimatePresence>
        {/* Counter removed */}
      </AnimatePresence>
      {divs &&
        divs.map((div) => (
          <AnimatedDiv
            key={div.id}
            id={div.id}
            onClick={() => console.log("Meow!")}
            onCompleted={() => {
              setDivs((prev) => prev.filter((d) => d.id !== div.id));
            }}
          />
        ))}
    </Container>
  );
};

const AnimatedDiv = ({ id, onClick, onCompleted }) => {
  // Use a ref so randY doesn't recalculate on re-renders, causing jitter
  const randY = React.useRef(getRandomHeight()).current;
  const controls = useAnimationControls();

  React.useEffect(() => {
    controls.start({
      x: "100vw",
      y: randY,
      transition: { duration: 5, ease: "linear" },
    });
  }, [controls, randY]);

  return (
    <motion.div
      key={id}
      initial={{ x: "-20vw", y: randY }}
      animate={controls}
      onAnimationComplete={onCompleted}
      onClick={onClick}
    >
      <NyanImage
        // Using a reliable external link for the Nyan Cat GIF since you might not have it locally
        src="/assets/pikachu-running.gif"
        alt="Nyan Cat"
      />
    </motion.div>
  );
};

export default NyanCat;
