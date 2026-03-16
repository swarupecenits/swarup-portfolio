import React from "react";
import styled from "styled-components";
import HeroSection from "../HeroSection";

const HeroContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  z-index: 1;
`;

const VideoHero = () => {
  return (
    <HeroContainer>
      <HeroSection />
    </HeroContainer>
  );
};

export default VideoHero;
