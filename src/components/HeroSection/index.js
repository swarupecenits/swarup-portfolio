import React, { useRef } from "react";
import {
  HeroContainer,
  HeroLeftContainer,
  HeroInnerContainer,
  Greeting,
  NameTitle,
  SubTitle,
  ActionsContainer,
  ButtonGroup,
  PrimaryButton,
  OutlineButton,
  IconButton
} from "./HeroStyle";
import { Bio } from "../../data/constants";
import { motion, useScroll, useTransform } from "framer-motion";
import { BlurIn, BoxReveal } from "../ui/RevealAnimations";
import ScrollDownIcon from "../ui/ScrollDownIcon";
import { File } from "lucide-react";
import { SiGithub, SiInstagram, SiLinkedin } from "react-icons/si";

const HeroSection = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  const authorNameParts = Bio.name.split(" ");
  const firstName = authorNameParts[0];
  const lastName = authorNameParts.slice(1).join(" ");

  return (
    <div id="about" ref={containerRef}>
      <HeroContainer>
        <motion.div style={{ opacity, scale, width: '100%', height: '100%' }}>
          <HeroInnerContainer>
            <HeroLeftContainer id="Left">
              <div style={{ width: '100%' }}>
                <BlurIn delay={2.7}>
                  <Greeting>
                    Hi, I am
                    <br className="md-hidden" />
                  </Greeting>
                </BlurIn>

                <BlurIn delay={3.0}>
                  <NameTitle title="theres something waiting for you in devtools">
                    {firstName}
                    <br />
                    {lastName}
                  </NameTitle>
                </BlurIn>

                <BlurIn delay={3.2}>
                  <SubTitle>
                    A Software Development Engineer
                  </SubTitle>
                </BlurIn>
              </div>

              <ActionsContainer>
                <a
                  href={Bio.resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ textDecoration: 'none', width: '100%' }}
                >
                  <BoxReveal delay={3.5} width="100%">
                    <PrimaryButton as="div">
                      <File size={24} />
                      <p style={{ margin: 0 }}>Resume</p>
                    </PrimaryButton>
                  </BoxReveal>
                </a>
                
                <ButtonGroup>
                  <OutlineButton href="#contact" style={{ flexGrow: 1 }}>
                    Contact Me
                  </OutlineButton>
                  
                  <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: '0.5rem' }}>
                    <IconButton href={Bio.insta} target="_blank" rel="noreferrer noopener">
                      <SiInstagram size={20} />
                    </IconButton>
                    <IconButton href={Bio.github} target="_blank" rel="noreferrer noopener" className="cursor-can-hover">
                      <SiGithub size={20} />
                    </IconButton>
                    <IconButton href={Bio.linkedin} target="_blank" rel="noreferrer noopener" className="cursor-can-hover">
                      <SiLinkedin size={20} />
                    </IconButton>
                  </div>
                </ButtonGroup>
              </ActionsContainer>
            </HeroLeftContainer>

            {/* Empty right container for grid alignment matching reference */}
            <div style={{ display: 'grid', gridColumn: 'span 1' }}></div>
          </HeroInnerContainer>
        </motion.div>
        
        {/* Scroll Down Icon positioned at bottom center */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <ScrollDownIcon />
        </div>
      </HeroContainer>
    </div>
  );
};

export default HeroSection;

