import React from "react";
import './Hero.css'
import HeroBgAnimation from "../HeroBgAnimation";
import {
  HeroContainer,
  HeroBg,
  HeroLeftContainer,
  Img,
  HeroRightContainer,
  HeroInnerContainer,
  TextLoop,
  Title,
  Span,
  SubTitle,
} from "./HeroStyle";
// import HeroImg from "../../images/HeroImage.gif";
import Typewriter from "typewriter-effect";
import { Bio } from "../../data/constants";

const HeroSection = () => {
  return (
    <div id="about">
      <HeroContainer>
        <HeroBg className="hero_bg">
        <HeroBgAnimation width={800} height={500} />
        </HeroBg>
        <HeroInnerContainer>
          <HeroLeftContainer id="Left">
            <Title>
              Hi, I am <br /> {Bio.name}
            </Title>
            <TextLoop>
              I am a
              <Span>
                <Typewriter
                  options={{
                    strings: Bio.roles,
                    autoStart: true,
                    loop: true,
                  }}
                />
              </Span>
            </TextLoop>
            <SubTitle>{Bio.description}</SubTitle>
            <button  class="btn-hero">
             <a style={{color:"#fff", textDecoration:"none"}} href="https://drive.google.com/file/d/1WhryeEsULP-3q6lZXpleW26c0jZbB4tz/view" target="blank">Check CV</a> </button>
            {/* <ResumeButton href={Bio.resume} target="display">
              Check Resume
            </ResumeButton> */}
          </HeroLeftContainer>

          <HeroRightContainer id="Right">
            <Img src="https://res.cloudinary.com/dagggqd6g/image/upload/f_auto,q_auto/ivcxkvbdqmplvap2fwi6" alt="hero-image" />
          </HeroRightContainer>
        </HeroInnerContainer>
      </HeroContainer>
    </div>
  );
};

export default HeroSection;
