import styled, { ThemeProvider } from "styled-components";
import { useState } from "react";
import { darkTheme, lightTheme } from './utils/Themes.js';
import Navbar from "./components/Navbar";
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Experience from "./components/Experience";
import Education from "./components/Education";
import ProjectDetails from "./components/ProjectDetails";
import Preloader from "./components/Preloader";
import { AnimatePresence } from "framer-motion";
import HeroSection from "./components/HeroSection";
import AnimatedBackground from "./components/AnimatedBackground";
import NotFoundPage from './pages/NotFoundPage';
import ScrollProgress from './components/ui/ScrollProgress';
import ElasticCursor from './components/ui/ElasticCursor';
import Particles from './components/ui/Particles';

const Body = styled.div`
  background-color: transparent;
  width: 100%;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
`;

const Wrapper = styled.div`
  padding-bottom: 100px;
  background: transparent;
  width: 100%;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 30% 98%, 0 100%);
`;



function App() {
  const [openModal, setOpenModal] = useState({ state: false, project: null });
  const [darkMode, setDarkMode] = useState(true);//default to dark mode

  // const toggleTheme = () => {
  //   setDarkMode(prevMode => !prevMode);
  // };

  console.log(openModal);
  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <Preloader>
        <Router>
          <ScrollProgress />
          <ElasticCursor />
          <Particles quantity={100} />
          <Routes>
            <Route path="/" element={
              <>
                <AnimatedBackground darkMode={darkMode} />
                <div className="canvas-overlay-mode">
                  <Navbar />
                  <HeroSection />
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
                </div>
              </>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </Preloader>
    </ThemeProvider>
  );
}

export default App;
