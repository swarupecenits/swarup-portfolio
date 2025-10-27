import React from "react";
import './Hero.css'
import AnoAI from "../ui/animated-shader-background";
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
import { Tilt } from "react-tilt";
import { motion } from "framer-motion";
import {
  headContainerAnimation,
  headContentAnimation,
  // headTextAnimation,
} from "../../utils/motion";
import StarCanvas from "../canvas/Stars";

const HeroSection = () => {
  return (
    <div id="about">
      <HeroContainer>
        <HeroBg className="hero_bg">
          <AnoAI />
        </HeroBg>
        <motion.div {...headContainerAnimation}>
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
              {/* css styles */}
              <div class="btn_container">
                <button class="btn-hero">
                  <a style={{ color: "#fff", textDecoration: "none" }} href="https://drive.google.com/file/d/1WhryeEsULP-3q6lZXpleW26c0jZbB4tz/view" target="blank">Check CV</a> </button>
              </div>

              {/* <ResumeButton href={Bio.resume} target="display">
              Check Resume
            </ResumeButton> */}
            </HeroLeftContainer>

            <HeroRightContainer id="Right">
              <motion.div {...headContentAnimation}>
                <Tilt>
                  <Img src="https://res.cloudinary.com/dagggqd6g/image/upload/v1761346197/Untitled_design_bqv6b2.png" alt="hero-image" />
                </Tilt>
              </motion.div>
            </HeroRightContainer>
          </HeroInnerContainer>
        </motion.div>
      </HeroContainer>
    </div>
  );
};

export default HeroSection;
