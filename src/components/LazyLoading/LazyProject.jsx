import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";

const StyledLazyProject = styled.img`
  width: 38px;
    height: 38px;
    border-radius: 50%;
    margin-left: -10px;
    background-color: ${({ theme }) => theme.white};
    box-shadow: 0 0 10px rgba(0,0,0,0.2);
    border: 3px solid ${({ theme }) => theme.card};
`;

const LazyProject = ({ src, alt }) => {
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

  return <StyledLazyProject ref={imageRef} src={imageSrc} alt={alt} />;
};

export default LazyProject;
