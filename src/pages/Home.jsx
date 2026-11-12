import styled from "styled-components";
import AnimatedBackground from "../components/AnimatedBackground";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import MarqueeBand from "../components/MarqueeBand";
import Skills from "../components/Skills";
import Experience from "../components/Experience";
import Projects from "../components/Projects";
import Education from "../components/Education";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import BackToTop from "../components/ui/BackToTop";

// `clip` (unlike `hidden`) hides sideways overflow from entrance animations without
// creating a scroll container, so sticky positioning keeps working.
const Main = styled.main`
  position: relative;
  overflow-x: clip;
`;

export default function Home() {
  return (
    <>
      <AnimatedBackground />
      <div className="canvas-overlay-mode">
        <Navbar />
        <Main id="main" tabIndex={-1}>
          <HeroSection />
          <MarqueeBand />
          <Skills />
          <Experience />
          <Projects />
          <Education />
          <Contact />
        </Main>
        <Footer />
      </div>
      <BackToTop />
    </>
  );
}
