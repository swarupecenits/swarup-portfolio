import React, { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import animationData from './animation.json';

const HeroBgAnimation = ({ width, height }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: animationData,
      });
    }
  }, []);

  return <div ref={containerRef} style={{ width, height }} />;
};

export default HeroBgAnimation;
