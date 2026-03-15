import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { opacity, slideUp } from "./anim";
import styled from "styled-components";

// Converts style.module.scss to a styled component
const LoaderContainer = styled(motion.div)`
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding-inline: 60px;
  padding-bottom: 30px;
  position: fixed;
  z-index: 9999;
  background-color: #050505; /* using a dark background matching the theme */
  top: 0;
  left: 0;

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100% + 300px);
    pointer-events: none;
    path {
      fill: #050505;
    }
  }

  p {
    display: flex;
    color: #ffffff;
    font-size: 72px;
    font-weight: bold;
    align-items: center;
    position: absolute;
    z-index: 1;
    margin: 0;
    padding: 0;
    /* To prevent double % sign, make sure it looks identical to original */
  }
  
  @media (max-width: 768px) {
    padding-inline: 30px;
    padding-bottom: 20px;
    p {
      font-size: 48px;
    }
  }
`;

export default function Loader({ loadingPercent }) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const initialPath = `M0 0 L${window.innerWidth || dimension.width} 0 L${window.innerWidth || dimension.width} ${
    window.innerHeight || dimension.height
  } Q${(window.innerWidth || dimension.width) / 2} ${(window.innerHeight || dimension.height) + 300} 0 ${
    window.innerHeight || dimension.height
  }  L0 0`;
  
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
    dimension.height
  } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve = {
    initial: {
      d: `M0 0 L${dimension.width || window.innerWidth} 0 L${dimension.width || window.innerWidth} ${dimension.height || window.innerHeight} Q${(dimension.width || window.innerWidth) / 2} ${(dimension.height || window.innerHeight) + 300} 0 ${dimension.height || window.innerHeight}  L0 0`,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <LoaderContainer
      variants={slideUp}
      initial="initial"
      exit="exit"
    >
      {dimension.width > 0 && (
        <>
          <motion.p variants={opacity} initial="initial" animate="enter">
            {loadingPercent ? (loadingPercent - (loadingPercent % 5)).toFixed(0) : "0"} %
          </motion.p>
          <svg>
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
            ></motion.path>
          </svg>
        </>
      )}
    </LoaderContainer>
  );
}