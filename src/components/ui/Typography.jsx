import React from 'react';
import styled from 'styled-components';

export const TypographyH1 = styled.h1`
  scroll-margin-top: 5rem;
  font-size: 2.25rem;
  font-weight: 800; /* extrabold */
  letter-spacing: -0.025em; /* tracking-tight */
  
  @media (min-width: 1024px) {
    font-size: 3rem; /* 5xl */
  }
`;

export const TypographyH2 = styled.h2`
  scroll-margin-top: 5rem;
  padding-bottom: 0.5rem;
  font-size: 1.875rem; /* 3xl */
  font-weight: 600; /* semibold */
  letter-spacing: -0.025em;
  border-bottom: 1px solid hsl(var(--border) / 0.5);
  
  &:first-child {
    margin-top: 0;
  }
`;

export const TypographyH3 = styled.h3`
  scroll-margin-top: 5rem;
  font-size: 1.5rem; /* 2xl */
  font-weight: 600;
  letter-spacing: -0.025em;
`;

export const TypographyH4 = styled.h4`
  scroll-margin-top: 5rem;
  font-size: 1.25rem; /* xl */
  font-weight: 600;
  letter-spacing: -0.025em;
`;

export const TypographyP = styled.p`
  line-height: 1.75;
  
  &:not(:first-child) {
    margin-top: 1.5rem;
  }
`;

export const TypographyBlockquote = styled.blockquote`
  margin-top: 1.5rem;
  border-left: 2px solid hsl(var(--border));
  padding-left: 1.5rem;
  font-style: italic;
`;

export const TypographyList = styled.ul`
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
  margin-left: 1.5rem;
  list-style-type: disc;
  
  li {
    margin-top: 0.5rem;
  }
`;

export const TypographyInlineCode = styled.code`
  position: relative;
  border-radius: 0.25rem;
  background-color: hsl(var(--muted));
  padding: 0.2rem 0.3rem;
  font-family: monospace;
  font-size: 0.875rem;
  font-weight: 600;
`;

export const TypographyLead = styled.p`
  font-size: 1.25rem;
  color: hsl(var(--muted-foreground));
`;

export const TypographyLarge = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
`;

export const TypographySmall = styled.small`
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
`;

export const TypographyMuted = styled.p`
  font-size: 0.875rem;
  color: hsl(var(--muted-foreground));
`;
