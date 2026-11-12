import { useRef } from "react";
import styled, { keyframes } from "styled-components";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { Bio, education, projects, skills } from "../../data/constants";
import { PRIMARY_SOCIAL_LINKS } from "../../data/socials";
import { usePreloader } from "../Preloader/context";
import { usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import CountUp from "../ui/CountUp";
import { BlurIn } from "../ui/RevealAnimations";
import RevealText from "../ui/RevealText";
import ScrollDownIcon from "../ui/ScrollDownIcon";
import Typewriter from "../ui/Typewriter";
import { ghostButton, iconButton, monoLabel, primaryButton } from "../ui/styles";

const [FIRST_NAME, ...OTHER_NAMES] = Bio.name.split(" ");
const LAST_NAME = OTHER_NAMES.join(" ");

const UNIQUE_SKILLS = new Set(skills.flatMap((group) => group.skills.map((skill) => skill.name.trim().toLowerCase()))).size;
const [LATEST_DEGREE] = education;

// "At a glance" numbers, all derived from the portfolio data.
const STATS = [
  { value: projects.length, label: "Projects built" },
  { value: UNIQUE_SKILLS, label: "Technologies" },
  {
    value: Number.parseFloat(LATEST_DEGREE?.grade),
    decimals: 2,
    label: `${LATEST_DEGREE?.degree.split(",")[0] ?? "Degree"} CGPA`,
  },
].filter((stat) => Number.isFinite(stat.value));

const ping = keyframes`
  75%, 100% {
    transform: scale(2.6);
    opacity: 0;
  }
`;

const HeroSection = styled.section`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  min-height: 100vh;
  min-height: 100svh;
  padding: calc(var(--nav-height) + 40px) 0 128px;

  @media (max-width: 767px) {
    align-items: flex-start;
    padding: calc(var(--nav-height) + 24px) 0 96px;
  }
`;

const Content = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: min(1200px, 100% - 64px);
  margin: 0 auto;

  > * {
    max-width: min(640px, 55%);
  }

  @media (max-width: 1023px) {
    > * {
      max-width: 58%;
    }
  }

  @media (max-width: 767px) {
    align-items: center;
    width: min(1200px, 100% - 32px);
    text-align: center;

    > * {
      max-width: 100%;
    }
  }
`;

const Status = styled.p`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
  padding: 7px 14px 7px 12px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgb(var(--bg-rgb) / 0.6);
  color: var(--text-soft);
  font-size: 13.5px;
  font-weight: 500;

  strong {
    color: var(--text);
    font-weight: 600;
  }

  @media (max-width: 767px) {
    margin-bottom: 20px;
    font-size: 13px;
  }
`;

const Dot = styled.span`
  position: relative;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    animation: ${ping} 2s cubic-bezier(0, 0, 0.2, 1) infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }
`;

const Name = styled.h1`
  position: relative;
  width: fit-content;
  margin-bottom: 28px;
  color: var(--text);
  font-size: clamp(4.25rem, 19vw, 6.5rem);
  font-weight: 600;
  line-height: 0.9;
  letter-spacing: -0.055em;

  .serif {
    font-size: 1.14em;
    letter-spacing: -0.025em;
  }

  .last {
    line-height: 0.86;
  }

  @media (min-width: 768px) {
    font-size: clamp(5rem, 9.2vw, 8.5rem);

    /* An editorial stagger: the second line steps in. */
    .last {
      padding-left: 0.42em;
    }
  }

  @media (max-width: 767px) {
    margin: 0 auto 20px;
  }

  /* A hint for the curious: the console hides a few surprises. */
  @media (hover: hover) and (pointer: fine) {
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      top: 6%;
      left: calc(100% + 20px);
      width: max-content;
      max-width: 240px;
      padding: 8px 12px;
      border: 1px solid var(--line-strong);
      border-radius: 10px;
      background: var(--surface-strong);
      color: var(--text-soft);
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 500;
      line-height: 1.5;
      letter-spacing: 0;
      opacity: 0;
      transform: translateX(-6px);
      transition:
        opacity 0.25s ease,
        transform 0.25s ease;
      pointer-events: none;
    }

    &:hover::after {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const RoleLine = styled.p`
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 1.6em;
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: clamp(1rem, 1.7vw, 1.25rem);
  font-weight: 500;
  white-space: nowrap;

  .prompt {
    color: var(--accent);
  }

  @media (max-width: 767px) {
    justify-content: center;
  }
`;

const Description = styled.p`
  margin-top: 22px;
  color: var(--text-muted);
  font-size: 1.0625rem;
  line-height: 1.75;
  text-wrap: pretty;

  @media (max-width: 767px) {
    display: none;
  }
`;

const Actions = styled(BlurIn)`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 36px;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    width: min(340px, 100%);
    margin-top: 28px;
  }
`;

const ResumeButton = styled.a`
  ${primaryButton}

  &:hover svg {
    translate: 2px -2px;
  }
`;

const SecondaryRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  @media (max-width: 767px) {
    display: grid;
    grid-template-columns: 1fr repeat(${PRIMARY_SOCIAL_LINKS.length}, 48px);
  }
`;

const ContactButton = styled.a`
  ${ghostButton}

  &:hover svg {
    translate: 3px 0;
  }
`;

const IconButton = styled.a`
  ${iconButton}
  width: 48px;
  height: 48px;
  font-size: 19px;
`;

const Stats = styled.dl`
  display: flex;
  gap: clamp(28px, 4vw, 56px);
  margin-top: 56px;
  padding-top: 24px;
  border-top: 1px solid var(--line);

  > div {
    display: flex;
    flex-direction: column-reverse;
    gap: 6px;
  }

  dt {
    ${monoLabel}
    color: var(--text-dim);
    font-size: 11px;
  }

  dd {
    color: var(--text);
    font-size: clamp(1.75rem, 2.8vw, 2.25rem);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.04em;
    line-height: 1;
  }

  @media (max-width: 767px) {
    display: none;
  }
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 28px;
  left: 50%;
  translate: -50% 0;

  @media (max-height: 640px) {
    display: none;
  }
`;

export default function Hero() {
  const { isLoading } = usePreloader();
  const ready = !isLoading;
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef);

  // Fade the intro away as the visitor scrolls on to the next section.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -90]);

  return (
    <HeroSection id="about" ref={sectionRef} aria-labelledby="hero-title">
      <Content style={{ opacity, y }}>
        <BlurIn when={ready} delay={0.1} duration={0.8}>
          <Status>
            <Dot aria-hidden="true" />
            <span>
              {Bio.title} @ <strong>{Bio.company}</strong>
            </span>
          </Status>
        </BlurIn>

        <Name id="hero-title" data-interactive data-tooltip="psst… there's something hidden in the dev tools 👀">
          <span className="sr-only">{Bio.name}</span>
          <RevealText text={FIRST_NAME} when={ready} delay={0.2} />
          {LAST_NAME && <RevealText className="last" text={LAST_NAME} accent={LAST_NAME} when={ready} delay={0.32} />}
        </Name>

        <BlurIn when={ready} delay={0.55} duration={0.8}>
          <RoleLine>
            <span className="prompt" aria-hidden="true">
              &gt;
            </span>
            <span className="sr-only">{Bio.roles.join(", ")}</span>
            <Typewriter words={Bio.roles} play={ready && inView} startDelay={900} />
          </RoleLine>
        </BlurIn>

        <BlurIn when={ready} delay={0.7} duration={0.8}>
          <Description>{Bio.description}</Description>
        </BlurIn>

        <Actions when={ready} delay={0.85} duration={0.8}>
          <ResumeButton href={Bio.resume} target="_blank" rel="noopener noreferrer">
            View résumé
            <FiArrowUpRight aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </ResumeButton>
          <SecondaryRow>
            <ContactButton href="#contact">
              Contact me
              <FiArrowRight aria-hidden="true" />
            </ContactButton>
            {PRIMARY_SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
              <IconButton key={id} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                <Icon aria-hidden="true" />
              </IconButton>
            ))}
          </SecondaryRow>
        </Actions>

        {STATS.length > 0 && (
          <BlurIn when={ready} delay={1} duration={0.8}>
            <Stats>
              {STATS.map(({ value, decimals, label }, index) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>
                    <CountUp value={value} decimals={decimals} when={ready} delay={1 + index * 0.12} />
                  </dd>
                </div>
              ))}
            </Stats>
          </BlurIn>
        )}
      </Content>

      <ScrollHint>
        <ScrollDownIcon href="#skills" />
      </ScrollHint>
    </HeroSection>
  );
}
