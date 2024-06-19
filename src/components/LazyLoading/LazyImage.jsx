import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const StyledLazyImage = styled.img`
  width: 24px;
  height: 24px;
`;

const LazyImage = ({ src, alt }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const imageRef = useRef(null);

  useEffect(() => {
    let observer;
    const { current } = imageRef;

    if (current) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(current);
          }
        });
      });

      observer.observe(current);

      return () => {
        if (observer && current) {
          observer.unobserve(current);
        }
      };
    }
  }, [src]);

  return <StyledLazyImage ref={imageRef} src={imageSrc} alt={alt} />;
};

export default LazyImage;
