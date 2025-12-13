import styled, { ThemeProvider } from "styled-components";
import { useState, useEffect } from "react";
import { darkTheme, lightTheme } from './utils/Themes.js';
import Navbar from "./components/Navbar";
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Experience from "./components/Experience";
import Education from "./components/Education";
// Preloader replaced by Loader component (particle effect)
import ProjectDetails from "./components/ProjectDetails";
// import StarCanvas from "./components/canvas/Stars";
import { AnimatePresence } from "framer-motion";
import Loader from "./components/Preloader/Loader.jsx";
import VideoHero from "./components/VideoHero";
// import { Animation } from "./components/Animation/Animation.jsx";
// import ToggleButton from "./components/ToggleButton/ToggleButton.jsx";

const Body = styled.div`
  background-color: ${({ theme }) => theme.bg};
  width: 100%;
  overflow-x: hidden;
  position: relative;
`;

const Wrapper = styled.div`
  padding-bottom: 100px;
  background: linear-gradient(
      38.73deg,
      rgba(204, 0, 187, 0.15) 0%,
      rgba(201, 32, 184, 0) 50%
    ),
    linear-gradient(
      141.27deg,
      rgba(0, 70, 209, 0) 50%,
      rgba(0, 70, 209, 0.15) 100%
    );
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 30% 98%, 0 100%);
`;



function App() {
  const [openModal, setOpenModal] = useState({ state: false, project: null });
  // const [isMobile, setIsMobile] = useState(false);

  // Show the Loader until the particle animation signals completion.
  // The particle component will call the onComplete callback when the
  // words array has been played once.
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   const handleResize = () => {
  //     setIsMobile(window.innerWidth <= 768); // Adjust the breakpoint as needed
  //   };
  //   window.addEventListener("resize", handleResize);
  //   handleResize(); // Initial check
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  const [darkMode, setDarkMode] = useState(true);//default to dark mode

  // const toggleTheme = () => {
  //   setDarkMode(prevMode => !prevMode);
  // };

  console.log(openModal);
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Router>
        {isLoading ? (
          // While loading, show the Loader (full-screen) and hide the rest.
          // Pass a callback so Loader/Particle component can stop the loader
          <Loader onComplete={() => setIsLoading(false)} />
        ) : (
          // After loading is done, render the normal app chrome
          <>
            <Navbar />
            <VideoHero />
            <Body>
              <AnimatePresence>
                <div>
                  <Wrapper>
                    <Skills />
                    <Experience />
                  </Wrapper>
                  <Projects openModal={openModal} setOpenModal={setOpenModal} />
                  <Wrapper>
                    <Education />
                    <Contact />
                  </Wrapper>
                  <Footer />
                  {openModal.state && (
                    <ProjectDetails openModal={openModal} setOpenModal={setOpenModal} />
                  )}
                </div>
              </AnimatePresence>
            </Body>
          </>
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
