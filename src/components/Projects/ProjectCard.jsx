import styled from "styled-components";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen, FiCalendar, FiDownload, FiExternalLink, FiPlay } from "react-icons/fi";
import { projectCategories } from "../../data/constants";
import { toISOMonth } from "../../utils/dates";
import { imageSrcSet, optimizeImage } from "../../utils/image";
import { getDemoLink } from "../../utils/projects";
import { cardSurface, cardSurfaceHover, chip, monoLabel, spotlight } from "../ui/styles";

const MAX_TAGS = 4;
const IMAGE_WIDTHS = [400, 640, 960];
const IMAGE_SIZES = "(max-width: 768px) 86vw, (max-width: 1100px) 45vw, 380px";
const BADGES = Object.fromEntries(projectCategories.map(({ id, badge }) => [id, badge]));
const DEMO_ICONS = { video: FiPlay, paper: FiBookOpen, download: FiDownload, live: FiExternalLink };

const Card = styled(motion.article)`
  ${cardSurface}
  ${spotlight}
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
  transition:
    border-color 0.3s ease,
    translate 0.4s var(--ease-out);

  @media (hover: hover) {
    &:hover {
      ${cardSurfaceHover}
      translate: 0 -4px;
    }

    &:hover img {
      scale: 1.05;
    }

    &:hover h3,
    &:hover [data-hint] {
      color: var(--accent);
    }

    &:hover [data-hint] svg {
      translate: 2px -2px;
    }
  }
`;

const Media = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 13px;
  background: linear-gradient(135deg, #18181b, #27272a);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: scale 0.7s var(--ease-out);
  }
`;

const Badge = styled.span`
  ${monoLabel}
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  border: 1px solid rgb(255 255 255 / 0.14);
  border-radius: 999px;
  background: rgb(var(--bg-rgb) / 0.72);
  color: var(--text);
  font-size: 10.5px;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);

  html[data-perf="low"] & {
    background: rgb(var(--bg-rgb) / 0.86);
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  padding: 16px 10px 8px;
`;

const DateText = styled.p`
  ${monoLabel}
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-dim);
  font-size: 11.5px;
`;

const Title = styled.h3`
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.3;
  transition: color 0.2s ease;
`;

// The title button stretches over the whole card so any click on it opens the details.
const OpenButton = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: left;
  cursor: pointer;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 1;
    border-radius: var(--radius-lg);
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible::after {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
  }
`;

const Description = styled.p`
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-muted);
  font-size: 15px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
`;

const Tags = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  list-style: none;

  li {
    ${chip}
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid var(--line);
`;

const Links = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const linkBase = `
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.04);
  color: var(--text-soft);
  text-decoration: none;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    border-color: rgb(var(--accent-rgb) / 0.5);
    background: rgb(var(--accent-rgb) / 0.1);
    color: var(--text);
  }
`;

const IconLink = styled.a`
  ${linkBase}
  width: 40px;
  font-size: 18px;
`;

const TextLink = styled.a`
  ${linkBase}
  gap: 7px;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 600;
`;

const DetailsHint = styled.span`
  ${monoLabel}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--text-muted);
  white-space: nowrap;
  transition: color 0.2s ease;

  svg {
    font-size: 15px;
    transition: translate 0.25s ease;
  }
`;

export function DemoIcon({ kind }) {
  const Icon = DEMO_ICONS[kind] ?? FiExternalLink;
  return <Icon aria-hidden="true" />;
}

export default function ProjectCard({ project, onOpen, index = 0, animate = true }) {
  const { id, title, date, description, image, tags = [], category, github, webapp } = project;
  const demo = getDemoLink(webapp);
  const badge = BADGES[category];
  const hiddenTags = tags.length - MAX_TAGS;
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -60px 0px" },
        transition: { duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] },
      }
    : {};

  return (
    <Card data-interactive data-spotlight {...motionProps}>
      <Media>
        <img
          src={optimizeImage(image, 640)}
          srcSet={imageSrcSet(image, IMAGE_WIDTHS)}
          sizes={IMAGE_SIZES}
          alt=""
          width="640"
          height="360"
          loading="lazy"
          decoding="async"
        />
        {badge && <Badge>{badge}</Badge>}
      </Media>

      <Body>
        <DateText>
          <FiCalendar aria-hidden="true" />
          <time dateTime={toISOMonth(date)}>{date}</time>
        </DateText>
        <Title>
          <OpenButton type="button" aria-haspopup="dialog" data-project-id={id} onClick={() => onOpen(id)}>
            {title}
          </OpenButton>
        </Title>
        <Description>{description}</Description>
        {tags.length > 0 && (
          <Tags aria-label="Technologies">
            {tags.slice(0, MAX_TAGS).map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
            {hiddenTags > 0 && (
              <li>
                +{hiddenTags}
                <span className="sr-only"> more</span>
              </li>
            )}
          </Tags>
        )}

        <Footer>
          <Links>
            {github && (
              <IconLink href={github} target="_blank" rel="noopener noreferrer" aria-label={`${title} source code on GitHub`} title="Source code">
                <FaGithub aria-hidden="true" />
              </IconLink>
            )}
            {demo && (
              <TextLink href={webapp} target="_blank" rel="noopener noreferrer">
                <DemoIcon kind={demo.kind} />
                {demo.label}
                <span className="sr-only">: {title}</span>
              </TextLink>
            )}
          </Links>
          <DetailsHint data-hint aria-hidden="true">
            Details
            <FiArrowUpRight />
          </DetailsHint>
        </Footer>
      </Body>
    </Card>
  );
}
