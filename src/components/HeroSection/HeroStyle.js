import styled from "styled-components";

export const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  background: transparent;
  pointer-events: none;
`;

export const HeroInnerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; /* md:grid-cols-2 */
  }
`;

export const HeroLeftContainer = styled.div`
  height: calc(100dvh - 3rem);
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 7rem; /* pt-28 */
  padding-left: 1.5rem;
  padding-right: 1.5rem;
  
  @media (min-width: 640px) {
    padding-bottom: 4rem; /* sm:pb-16 */
  }
  
  @media (min-width: 768px) {
    height: calc(100dvh - 4rem);
    justify-content: center;
    align-items: flex-start;
    padding: 5rem; /* md:p-20 */
    padding-left: 7rem;
  }

  @media (min-width: 1024px) {
    padding: 6rem; /* lg:p-24 */
    padding-left: 8rem;
  }

  @media (min-width: 1280px) {
    padding: 7rem; /* xl:p-28 */
    padding-left: 9rem;
  }
`;

import { TypographyH1, TypographyLead } from "../ui/Typography";

export const Greeting = styled(TypographyLead)`
  margin-top: 1rem;
  font-weight: 900;
  font-size: 1rem; /* text-md base */
  color: #909399; /* slate-500 */
  cursor: default;
  white-space: nowrap;
  text-align: center;
  
  @media (min-width: 640px) {
    font-size: 1.25rem; /* sm:text-xl */
  }
  @media (min-width: 768px) {
    align-self: flex-start;
    text-align: left;
  }
`;

export const NameTitle = styled(TypographyH1)`
  margin-left: 0;
  line-height: 1;
  font-weight: 900; /* Made bold as replica to the typography.tsx component */
  text-align: center;
  font-size: 4.5rem; /* text-7xl */
  cursor: default;
  color: #E2E2E4;
  position: relative;
  display: inline-block;  pointer-events: auto; /* Required to capture hover events */
/* Mobile: Hidden Tooltips */
  &::after {
    display: none;
  }

  &::after {
    content: "there is something hidden for you guys in dev tools";
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(10px);
    background-color: rgba(3, 7, 18, 0.95);
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.4s ease;
    border: 1px solid rgba(59, 130, 246, 0.4);
    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    z-index: 20;
    letter-spacing: normal;
    line-height: normal;
    pointer-events: none;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-10px);
  }

  @media (min-width: 768px) {
    margin-left: -6px;
    text-align: left;
    font-size: 4.5rem; /* md:text-7xl */

    &::after {
      display: block; /* Desktop Tooltips: Re-enabled */
      left: 25%; /* Moved right */
      transform: translateX(0) translateY(10px);
    }
    
    &:hover::after {
      transform: translateX(0) translateY(-10px);
    }
  }
  @media (min-width: 1024px) {
    font-size: 6rem; /* lg:text-8xl */
  }
  @media (min-width: 1280px) {
    font-size: 8rem; /* xl:text-9xl */
  }
`;

export const SubTitle = styled(TypographyLead)`
  margin-top: 0;
  font-weight: 900;
  font-size: 1rem;
  color: #909399;
  cursor: default;
  white-space: nowrap;
  text-align: center;

  @media (min-width: 640px) {
    font-size: 1.25rem;
  }
  @media (min-width: 768px) {
    align-self: flex-start;
    text-align: left;
    margin-top: 1rem;
  }
`;

export const ActionsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: max-content;
  pointer-events: auto; /* Required to allow clicks to go through the container */
`;

export const ButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (min-width: 768px) {
    align-self: flex-start;
  }
`;

export const PrimaryButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 1rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 1000;
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
  }
`;

export const OutlineButton = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  height: 2.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 1000;
  background-color: transparent;
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border) / 0.5);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
  
  &:hover {
    background-color: hsl(var(--accent) / 0.5);
  }
`;

export const IconButton = styled(OutlineButton)`
  padding: 0.5rem;
  width: 2.5rem;
`;


