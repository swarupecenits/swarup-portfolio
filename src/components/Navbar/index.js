import React, { useEffect, useRef } from "react";
import {
  Nav,
  NavLink,
  NavbarContainer,
  NavLogo,
  NavItemsContainer,
  NavLinksWrapper,
  SocialIconsContainer,
  SocialIcon,
  HamburgerMenu,
  MobileMenuContainer,
  MobileLinksList,
  MobileLink,
  MobileSocialIconsContainer,
  MobileSocialIcon,
  LogoImg,
  LogoText,
} from "./NavbarStyledComponent";
import { DiCssdeck } from "react-icons/di";
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Bio } from "../../data/constants";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const navbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Nav ref={navbarRef}>
      <NavbarContainer>
        {/* Logo + Name */}
        <NavLogo
          to="/"
          onClick={() => {
            handleNavClick();
            document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <DiCssdeck size="3rem" color="white" />
          <LogoText>Portfolio</LogoText>
        </NavLogo>

        {/* Web Navbar */}
        <NavItemsContainer>
          <NavLinksWrapper>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#skills">Skills</NavLink>
            <NavLink href="#experience">Experience</NavLink>
            <NavLink href="#projects">Projects</NavLink>
            <NavLink href="#education">Education</NavLink>
          </NavLinksWrapper>
        </NavItemsContainer>

        {/* Social Icons (Web) */}
        <SocialIconsContainer>
          <SocialIcon href={Bio.github} target="_blank" rel="noreferrer noopener">
            <FaGithub />
          </SocialIcon>
          <SocialIcon href={Bio.linkedin} target="_blank" rel="noreferrer noopener">
            <FaLinkedin />
          </SocialIcon>
          <SocialIcon href={Bio.insta} target="_blank" rel="noreferrer noopener">
            <FaInstagram />
          </SocialIcon>
        </SocialIconsContainer>

        {/* Hamburger Menu */}
        <HamburgerMenu onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </HamburgerMenu>
      </NavbarContainer>

      {/* Mobile Menu */}
      <MobileMenuContainer isOpen={isMobileMenuOpen}>
        {/* Links */}
        <MobileLinksList>
          <MobileLink href="#about" onClick={handleNavClick}>
            About
          </MobileLink>
          <MobileLink href="#skills" onClick={handleNavClick}>
            Skills
          </MobileLink>
          <MobileLink href="#experience" onClick={handleNavClick}>
            Experience
          </MobileLink>
          <MobileLink href="#projects" onClick={handleNavClick}>
            Projects
          </MobileLink>
          <MobileLink href="#education" onClick={handleNavClick}>
            Education
          </MobileLink>
        </MobileLinksList>

        {/* Social Icons */}
        <MobileSocialIconsContainer>
          <MobileSocialIcon href={Bio.github} target="_blank" rel="noreferrer noopener">
            <FaGithub />
          </MobileSocialIcon>
          <MobileSocialIcon href="https://linkedin.com" target="_blank" rel="noreferrer noopener">
            <FaLinkedin />
          </MobileSocialIcon>
          <MobileSocialIcon href={Bio.insta} target="_blank" rel="noreferrer noopener">
            <FaInstagram />
          </MobileSocialIcon>
        </MobileSocialIconsContainer>
      </MobileMenuContainer>
    </Nav>
  );
};

export default Navbar;
