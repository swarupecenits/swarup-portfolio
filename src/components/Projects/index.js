import React from "react";
import { useState } from "react";
import {
  Container,
  Wrapper,
  Title,
  Desc,
  CardContainer,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from "./ProjectsStyle";
import ProjectCard from "../Cards/ProjectCards";
import { projects } from "../../data/constants";


const Projects = ({ openModal, setOpenModal }) => {
  const [toggle, setToggle] = useState("all");
  return (
    <Container id="projects">
      <Wrapper>
        <Title>My Projects</Title>
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
            <ToggleButton value="machine_learning" onClick={() => setToggle("machine_learning")}>
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
        <CardContainer>
          {toggle === "all" &&
            projects.map((project) => (
              <ProjectCard
                project={project}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
            ))}
          {projects
            .filter((item) => item.category === toggle)
            .map((project) => (
              <ProjectCard
                project={project}
                openModal={openModal}
                setOpenModal={setOpenModal}
              />
            ))}
        </CardContainer>
      </Wrapper>
    </Container>
  );
};

export default Projects;
