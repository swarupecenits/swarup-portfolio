import { Link as LinkR } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.div`
  width: 100%;
  height: 72px;
  position: fixed;
  top: 0;
  background: linear-gradient(180deg, rgba(3, 7, 18, 0.92), rgba(3, 7, 18, 0.6));
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(59, 130, 246, 0.15);
  box-shadow: 0 10px 28px rgba(3, 7, 18, 0.45);
  z-index: 50;
  padding: 0 40px;

  @media (max-width: 768px) {
    padding: 0 20px;
  }
`;

export const NavbarContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
`;

export const NavLogo = styled(LinkR)`
  display: flex;
  align-items: center;
  text-decoration: none;
  cursor: pointer;
  gap: 10px;

  @media (max-width: 768px) {
    gap: 5px;
  }
`;

export const LogoImg = styled.img`
  width: 50px;
  height: 50px;
  cursor: pointer;
`;

export const LogoText = styled.div`
  display: none;
  font-weight: bold;
  color: #a8a9b3;
  font-size: 18px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const NavItemsContainer = styled.div`
  display: none;
  width: 500px;
  height: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-right: 80px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const NavLinksWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: auto;
  border: 1px solid rgba(59, 130, 246, 0.36);
  background: rgba(15, 23, 42, 0.54);
  border-radius: 50px;
  padding: 10px 20px;
  color: #c9c9d7;
`;

export const NavLink = styled.a`
  color: #c9c9d7;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  transition: all 0.2s ease-in-out;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -5px;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #5f7bff, #3ec8ff);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: #8eb6ff;

    &::after {
      transform: scaleX(1);
    }
  }
`;

export const SocialIconsContainer = styled.div`
  display: none;
  flex-direction: row;
  gap: 20px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

export const SocialIcon = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    color: rgb(96, 165, 250);
    transform: scale(1.1);
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const HamburgerMenu = styled.button`
  display: block;
  background: none;
  border: none;
  color: white;
  font-size: 32px;
  cursor: pointer;
  outline: none;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileMenuContainer = styled.div`
  display: ${({ isOpen }) => (isOpen ? "flex" : "none")};
  position: absolute;
  top: 65px;
  left: 0;
  width: 100%;
  background: rgba(3, 7, 18, 0.77);
  backdrop-filter: blur(30px);
  border-top: 1px solid rgba(59, 130, 246, 0.2);
  padding: 20px;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #c9c9d7;
  z-index: 999;

  @media (min-width: 768px) {
    display: none;
  }
`;

export const MobileLinksList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
`;

export const MobileLink = styled.a`
  color: #c9c9d7;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: rgb(96, 165, 250);
  }
`;

export const MobileSocialIconsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  width: 100%;
`;

export const MobileSocialIcon = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover {
    color: rgb(96, 165, 250);
  }

  svg {
    width: 32px;
    height: 32px;
  }
`;

