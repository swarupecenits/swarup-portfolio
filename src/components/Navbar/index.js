import React, { useEffect, useRef } from "react";
import {
  Nav,
  NavLink,
  NavbarContainer,
  Span,
  NavLogo,
  NavItems,
  // GitHubButton,
  ButtonContainer,
  MobileIcon,
  MobileMenu,
  // MobileNavLogo,
  MobileLink,
} from "./NavbarStyledComponent";
import { DiCssdeck } from "react-icons/di";
import { FaBars } from "react-icons/fa";
import { Bio } from "../../data/constants";
import Githubbtn from "../Button/GithubButton"
// import { Close, CloseRounded } from "@mui/icons-material";
// import { useTheme } from "styled-components";


const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // const theme = useTheme();
  return (
    <Nav ref={navbarRef}>
      <NavbarContainer>
        <NavLogo to="/" onClick={() => {
  setIsOpen(false);
  document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
}}>

          <a
            href="#about"
            style={{
              display: "flex",
              alignItems: "center",
              color: "white",
              marginBottom: "20;",
              cursor: "pointer",
              textDecoration:"none",
            }}
          >
            <DiCssdeck size="3rem" /> <Span>Portfolio</Span>
          </a>
        </NavLogo>
        <MobileIcon>
          <FaBars
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          />
        </MobileIcon>
        <NavItems>
          <NavLink href="#about">About</NavLink>
          <NavLink href="#skills">Skills</NavLink>
          <NavLink href="#experience">Experience</NavLink>
          <NavLink href="#projects">Projects</NavLink>
          <NavLink href="#education">Education</NavLink>
        </NavItems>

        <ButtonContainer>
          <Githubbtn href={Bio.github} target="_blank">
            Github Profile
          </Githubbtn>
        </ButtonContainer>
        <MobileMenu isOpen={isOpen}>
            <MobileLink
              href="#about"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              About
            </MobileLink>
            <MobileLink
              href="#skills"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Skills
            </MobileLink>
            <MobileLink
              href="#experience"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Experience
            </MobileLink>
            <MobileLink
              href="#projects"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Projects
            </MobileLink>
            <MobileLink
              href="#education"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Education
            </MobileLink>
            <Githubbtn
              style={{
                padding: "10px 16px",
                background: `#ab20fd`,
                color: "white",
                width: "max-content",
              }}
              href={Bio.github}
              target="_blank"
            >
              Github Profile
            </Githubbtn>
          </MobileMenu>
      </NavbarContainer>
    </Nav>
  );
};

export default Navbar;
