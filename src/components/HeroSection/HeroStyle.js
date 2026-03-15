import styled from "styled-components";

export const HeroContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  z-index: 1;
  background: transparent;
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
  z-index: 2;
  grid-column: span 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-top: 7rem; /* pt-28 */
  
  @media (min-width: 640px) {
    padding-bottom: 4rem; /* sm:pb-16 */
  }
  
  @media (min-width: 768px) {
    height: calc(100dvh - 4rem);
    justify-content: center;
    align-items: flex-start;
    padding: 5rem; /* md:p-20 */
  }

  @media (min-width: 1024px) {
    padding: 6rem; /* lg:p-24 */
  }

  @media (min-width: 1280px) {
    padding: 7rem; /* xl:p-28 */
  }
`;

import { TypographyH1, TypographyLead } from "../ui/Typography";

export const Greeting = styled(TypographyLead)`
  margin-top: 1rem;
  font-weight: 100;
  font-size: 1rem; /* text-md base */
  color: #64748b; /* slate-500 */
  cursor: default;
  white-space: nowrap;
  
  @media (min-width: 640px) {
    font-size: 1.25rem; /* sm:text-xl */
  }
  @media (min-width: 768px) {
    align-self: flex-start;
  }
`;

export const NameTitle = styled(TypographyH1)`
  margin-left: -6px;
  line-height: 1;
  font-weight: 900; /* Made bold as replica to the typography.tsx component */
  text-align: left;
  font-size: 4.5rem; /* text-7xl */
  cursor: default;
  color: #FFFFFF;

  @media (min-width: 768px) {
    font-size: 4.5rem; /* md:text-7xl */
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
  font-weight: 400;
  font-size: 1rem;
  color: #64748b;
  cursor: default;
  white-space: nowrap;

  @media (min-width: 640px) {
    font-size: 1.25rem;
  }
  @media (min-width: 768px) {
    align-self: flex-start;
    margin-top: 1rem;
  }
`;

export const ActionsContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: max-content;
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
  font-weight: 500;
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
  font-weight: 500;
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


