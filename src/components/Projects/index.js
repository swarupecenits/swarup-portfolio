import React, { useEffect, useState } from "react";
import {
  Container,
  Wrapper,
  Title,
  Desc,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  CardContainer,
  ShowMoreButton,
  SwiperMobileCenter,
} from "./ProjectsStyle";
import ProjectCard from "../Cards/ProjectCards";
import { projects } from "../../data/constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { useLenis } from "lenis/react";
import { motion, AnimatePresence } from "framer-motion";

const Projects = ({ openModal, setOpenModal }) => {
  const lenis = useLenis();
  const INITIAL_VISIBLE_CARDS = 6;
  const [toggle, setToggle] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const filteredProjects =
    toggle === "all"
      ? projects
      : projects.filter((item) => item.category === toggle);

  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_VISIBLE_CARDS);

  const shouldShowMoreButton = filteredProjects.length > INITIAL_VISIBLE_CARDS;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [toggle]);

  return (
    <Container id="projects">
      <Wrapper>
        <Title>My Works</Title>
        <Desc>
          I have worked on a wide range of projects. Here are some of my
          projects.
        </Desc>
        <ToggleButtonGroup>
          {toggle === "all" ? (
            <ToggleButton active value="all" onClick={() => setToggle("all")}>
              All
            </ToggleButton>
          ) : (
            <ToggleButton value="all" onClick={() => setToggle("all")}>
              All
            </ToggleButton>
          )}
          <Divider />
          {toggle === "web app" ? (
            <ToggleButton
              active
              value="web app"
              onClick={() => setToggle("web app")}
            >
              Web
            </ToggleButton>
          ) : (
            <ToggleButton value="web app" onClick={() => setToggle("web app")}>
              Web
            </ToggleButton>
          )}
          <Divider />
          {toggle === "robotics" ? (
            <ToggleButton
              active
              value="robotics"
              onClick={() => setToggle("robotics")}
            >
              Robotics
            </ToggleButton>
          ) : (
            <ToggleButton value="robotics" onClick={() => setToggle("robotics")}>
              Robotics
            </ToggleButton>
          )}
          <Divider />
          {toggle === "machine_learning" ? (
            <ToggleButton
              active
              value="machine_learning"
              onClick={() => setToggle("machine_learning")}
            >
              ML
            </ToggleButton>
          ) : (
            <ToggleButton
              value="machine_learning"
              onClick={() => setToggle("machine_learning")}
            >
              ML
            </ToggleButton>
          )}
          <Divider />
          {toggle === "Mobile app" ? (
            <ToggleButton
              active
              value="Mobile app"
              onClick={() => setToggle("Mobile app")}
            >
              App
            </ToggleButton>
          ) : (
            <ToggleButton value="Mobile app" onClick={() => setToggle("Mobile app")}>
              App
            </ToggleButton>
          )}
        </ToggleButtonGroup>
        {isMobile ? (
          <SwiperMobileCenter style={{ width: "100%" }}>
            <Swiper
              spaceBetween={30}
              slidesPerView={1}
              loop={true}
              loopAdditionalSlides={2}
              autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              modules={[Pagination, Autoplay]}
              style={{ width: "100%", padding: "20px" }}
            >
              {filteredProjects.map((project, index) => (
                <SwiperSlide key={index}>
                  <ProjectCard
                    project={project}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </SwiperMobileCenter>
        ) : (
          <CardContainer>
            <AnimatePresence mode="popLayout">
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={`project-${index}-${project.title}`}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.3, 
                    ease: "easeInOut"
                  }}
                >
                  <ProjectCard
                    project={project}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContainer>
        )}
        {!isMobile && shouldShowMoreButton && (
          <ShowMoreButton 
            id="show-more-btn"
            onClick={() => {
              if (showAll) {
                if (lenis) {
                  lenis.scrollTo("#projects", { duration: 1.5, lock: true });
                } else {
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }
                setTimeout(() => {
                  setShowAll(false);
                }, 600); // Wait for mostly finished scroll before cutting height
              } else {
                setShowAll(true);
              }
            }}
          >
            {showAll ? "Show Less" : "Show More"}
          </ShowMoreButton>
        )}
      </Wrapper>
    </Container>
  );
};

export default Projects;
