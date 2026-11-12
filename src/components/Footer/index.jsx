import styled from "styled-components";
import { FiArrowUp, FiArrowUpRight } from "react-icons/fi";
import { Bio } from "../../data/constants";
import { NAV_LINKS, SOCIAL_LINKS } from "../../data/socials";
import { ghostButton, monoLabel } from "../ui/styles";

const YEAR = new Date().getFullYear();
const [FIRST_NAME, ...OTHER_NAMES] = Bio.name.split(" ");
const LAST_NAME = OTHER_NAMES.join(" ");

const FooterRoot = styled.footer`
  position: relative;
  z-index: 1;
  overflow: hidden;
  margin-top: clamp(40px, 6vw, 80px);
  padding-top: clamp(56px, 8vw, 96px);
  border-top: 1px solid var(--line);
  /* Opaque, so the page slides over the fixed 3D keyboard like a curtain. */
  background:
    radial-gradient(70% 60% at 50% 100%, rgb(var(--accent-rgb) / 0.09), transparent 70%),
    var(--bg);
`;

const Inner = styled.div`
  width: min(1200px, 100% - 32px);
  margin: 0 auto;

  @media (min-width: 640px) {
    width: min(1200px, 100% - 64px);
  }
`;

const Top = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) repeat(2, minmax(0, 1fr));
  gap: 40px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 36px 24px;
  }
`;

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;

  p {
    max-width: 34ch;
    color: var(--text-soft);
    font-size: clamp(1.125rem, 2vw, 1.375rem);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1.45;
  }

  em {
    color: var(--accent);
    font-family: var(--font-serif);
    font-size: 1.12em;
    font-weight: 400;
  }

  @media (max-width: 768px) {
    grid-column: 1 / -1;
  }
`;

const TopButton = styled.a`
  ${ghostButton}
  min-height: 42px;
  padding: 0 16px;
  font-size: 14px;

  &:hover svg {
    translate: 0 -2px;
  }
`;

const ColumnTitle = styled.h2`
  ${monoLabel}
  margin-bottom: 16px;
  color: var(--text-dim);
  font-size: 11.5px;
`;

const LinkList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
`;

const FooterLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  font-size: 15px;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;

  svg {
    font-size: 13px;
    opacity: 0.6;
    transition:
      opacity 0.2s ease,
      translate 0.25s var(--ease-out);
  }

  &:hover {
    color: var(--text);

    svg {
      opacity: 1;
      translate: 2px -2px;
    }
  }
`;

/* The name set huge at the very bottom, filling the width exactly via container query units;
   the footer's overflow crops the descenders like a page edge. */
const WordmarkFrame = styled.div`
  container-type: inline-size;
  margin-top: clamp(12px, 2vw, 24px);
  -webkit-user-select: none;
  user-select: none;
`;

const Wordmark = styled.p`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: -0.2em;
  font-size: 13vw;
  font-size: 15.4cqi;
  font-weight: 600;
  letter-spacing: -0.065em;
  line-height: 1.1;
  white-space: nowrap;

  span {
    padding-right: 0.06em;
    background: linear-gradient(180deg, rgb(255 255 255 / 0.9) 20%, rgb(255 255 255 / 0.04) 92%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }

  .serif {
    background-image: linear-gradient(180deg, rgb(var(--accent-rgb) / 0.95) 20%, rgb(var(--accent-rgb) / 0.04) 92%);
    font-size: 1.1em;
    letter-spacing: -0.03em;
  }
`;

const Bottom = styled.div`
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px 24px;
  margin-top: clamp(48px, 7vw, 88px);
  padding-top: 22px;
  border-top: 1px solid var(--line);
  color: var(--text-dim);
  font-size: 13.5px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export default function Footer() {
  return (
    <FooterRoot>
      <Inner>
        <Top>
          <Intro>
            <p>
              {Bio.title} at {Bio.company}, building AI tools, apps and robots. Thanks for <em>stopping by</em>.
            </p>
            <TopButton href="#top">
              Back to top
              <FiArrowUp aria-hidden="true" />
            </TopButton>
          </Intro>

          <nav aria-labelledby="footer-nav-title">
            <ColumnTitle id="footer-nav-title">Navigate</ColumnTitle>
            <LinkList>
              {NAV_LINKS.map(({ id, label }) => (
                <li key={id}>
                  <FooterLink href={`#${id}`}>{label}</FooterLink>
                </li>
              ))}
            </LinkList>
          </nav>

          <div>
            <ColumnTitle id="footer-social-title">Elsewhere</ColumnTitle>
            <LinkList aria-labelledby="footer-social-title">
              {SOCIAL_LINKS.map(({ id, label, href }) => (
                <li key={id}>
                  <FooterLink href={href} target="_blank" rel="noopener noreferrer">
                    {label}
                    <FiArrowUpRight aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </FooterLink>
                </li>
              ))}
            </LinkList>
          </div>
        </Top>

        <Bottom>
          <p>
            &copy; {YEAR} {Bio.name}. All rights reserved.
          </p>
        </Bottom>

        <WordmarkFrame aria-hidden="true">
          <Wordmark>
            <span>{FIRST_NAME}</span>
            {LAST_NAME && <span className="serif">{LAST_NAME}</span>}
          </Wordmark>
        </WordmarkFrame>
      </Inner>
    </FooterRoot>
  );
}
