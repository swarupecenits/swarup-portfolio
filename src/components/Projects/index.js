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
} from "./ProjectsStyle";
import ProjectCard from "../Cards/ProjectCards";
import { projects } from "../../data/constants";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/swiper-bundle.css";

const Projects = ({ openModal, setOpenModal }) => {
  const [toggle, setToggle] = useState("all");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const filteredProjects =
    toggle === "all"
      ? projects
      : projects.filter((item) => item.category === toggle);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          {toggle === "research" ? (
            <ToggleButton
              active
              value="research"
              onClick={() => setToggle("research")}
            >
              Research
            </ToggleButton>
          ) : (
            <ToggleButton value="research" onClick={() => setToggle("research")}>
              Research
            </ToggleButton>
          )}
        </ToggleButtonGroup>
        {isMobile ? (
          <Swiper
            spaceBetween={30}
            slidesPerView={1}
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
        ) : (
          <CardContainer>
            {filteredProjects.map((project, index) => (
              <ProjectCard
                key={index}
                project={project}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
            ))}
          </CardContainer>
        )}
      </Wrapper>
    </Container>
  );
};

export default Projects;
