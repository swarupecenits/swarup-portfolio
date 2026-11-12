import styled from "styled-components";
import { Bio, projectCategories } from "../../data/constants";
import Marquee from "../ui/Marquee";

const BUILDS = projectCategories.filter(({ id }) => id !== "all").map(({ label }) => label);
const DETAILS = [`${Bio.title} @ ${Bio.company}`, ...BUILDS, `Based in ${Bio.location}`];

// Decorative ribbons between the hero and the first section; the same content is on the page.
const Wrapper = styled.div`
  position: relative;
  z-index: 2;
  padding: clamp(48px, 7vw, 96px) 0;
  pointer-events: none;
`;

const Band = styled.div`
  width: 112vw;
  margin-left: -6vw;
`;

const AccentBand = styled(Band)`
  position: relative;
  z-index: 1;
  background: var(--accent);
  box-shadow: 0 24px 60px -30px rgb(var(--accent-rgb) / 0.5);
  color: var(--accent-ink);
  rotate: -2.5deg;
`;

const QuietBand = styled(Band)`
  position: absolute;
  top: 50%;
  left: 0;
  border-block: 1px solid var(--line);
  background: rgb(var(--bg-rgb) / 0.92);
  color: var(--text-muted);
  rotate: 2deg;
  translate: 0 -50%;
`;

const Item = styled.span`
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
`;

const BigItem = styled(Item)`
  gap: clamp(20px, 3vw, 40px);
  padding: clamp(12px, 1.6vw, 18px) clamp(10px, 1.5vw, 20px);
  font-size: clamp(1.375rem, 3vw, 2.5rem);
  font-weight: 600;
  letter-spacing: -0.035em;
  line-height: 1.1;

  &:nth-child(even) .text {
    font-family: var(--font-serif);
    font-size: 1.12em;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.01em;
  }
`;

const SmallItem = styled(Item)`
  gap: 18px;
  padding: 14px 9px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;

  &::after {
    content: "/";
    color: var(--text-dim);
  }
`;

const Star = styled.svg`
  flex-shrink: 0;
  width: 0.6em;
  height: 0.6em;

  /* Beats the overlay rule that makes every svg clickable. */
  && {
    pointer-events: none;
  }
`;

function StarIcon() {
  return (
    <Star viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 0c.6 6.4 5 11.4 12 12-7 .6-11.4 5.6-12 12-.6-6.4-5-11.4-12-12 7-.6 11.4-5.6 12-12Z" />
    </Star>
  );
}

export default function MarqueeBand() {
  return (
    <Wrapper aria-hidden="true">
      <QuietBand>
        <Marquee duration={60} reverse repeat={3}>
          {DETAILS.map((text) => (
            <SmallItem key={text}>{text}</SmallItem>
          ))}
        </Marquee>
      </QuietBand>
      <AccentBand>
        <Marquee duration={45}>
          {Bio.roles.map((role) => (
            <BigItem key={role}>
              <span className="text">{role}</span>
              <StarIcon />
            </BigItem>
          ))}
        </Marquee>
      </AccentBand>
    </Wrapper>
  );
}
