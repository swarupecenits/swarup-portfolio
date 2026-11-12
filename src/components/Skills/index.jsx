import styled from "styled-components";
import { motion } from "framer-motion";
import { FiCode, FiCpu, FiLayers, FiMonitor, FiServer, FiTool } from "react-icons/fi";
import { skills } from "../../data/constants";
import { useIsMobile } from "../../hooks/useMediaQuery";
import { optimizeImage } from "../../utils/image";
import { Container, Section, SectionHeading } from "../ui/Section";
import SnapCarousel from "../ui/SnapCarousel";
import { cardSurface, cardSurfaceHover, monoLabel, spotlight } from "../ui/styles";

const CATEGORY_ICONS = {
  Frontend: FiMonitor,
  Language: FiCode,
  "Backend and Services": FiServer,
  "Machine Learning": FiCpu,
  Others: FiTool,
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;

  > :last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
`;

const Card = styled(motion.article)`
  ${cardSurface}
  ${spotlight}
  height: 100%;
  padding: 26px;
  transition: border-color 0.3s ease;

  &:hover {
    ${cardSurfaceHover}
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const CardHeader = styled.header`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;

  h3 {
    color: var(--text);
    font-size: 1.3rem;
    font-weight: 600;
    letter-spacing: -0.02em;
  }

  p {
    ${monoLabel}
    margin-left: auto;
    color: var(--text-dim);
    font-size: 11.5px;
    white-space: nowrap;

    strong {
      color: var(--accent);
      font-weight: 500;
    }
  }
`;

const IconTile = styled.span`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 42px;
  height: 42px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: rgb(255 255 255 / 0.04);
  color: var(--accent);
  font-size: 19px;
`;

const Chips = styled.ul`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
`;

const Chip = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px 7px 9px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.03);
  color: var(--text-soft);
  font-size: 14.5px;
  font-weight: 500;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.25s var(--ease-out);

  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  &:hover {
    border-color: rgb(var(--accent-rgb) / 0.45);
    background: rgb(var(--accent-rgb) / 0.08);
    color: var(--text);
    transform: translateY(-2px);
  }

  @media (max-width: 768px) {
    padding: 6px 12px 6px 8px;
    font-size: 14px;
  }
`;

function SkillCard({ category, index = 0, animate = true }) {
  const Icon = CATEGORY_ICONS[category.title] ?? FiLayers;
  const motionProps = animate
    ? {
        initial: { opacity: 0, y: 32 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "0px 0px -60px 0px" },
        transition: { duration: 0.6, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] },
      }
    : {};

  return (
    <Card data-interactive data-spotlight {...motionProps}>
      <CardHeader>
        <IconTile aria-hidden="true">
          <Icon />
        </IconTile>
        <h3>{category.title}</h3>
        <p>
          <strong>{String(category.skills.length).padStart(2, "0")}</strong> skills
        </p>
      </CardHeader>
      <Chips>
        {category.skills.map((skill) => (
          <Chip key={skill.name}>
            <img src={optimizeImage(skill.image, 48)} alt="" width="20" height="20" loading="lazy" decoding="async" />
            {skill.name}
          </Chip>
        ))}
      </Chips>
    </Card>
  );
}

export default function Skills() {
  const isMobile = useIsMobile();

  return (
    <Section id="skills" aria-labelledby="skills-title">
      <Container>
        <SectionHeading
          id="skills-title"
          index="01"
          eyebrow="Skills"
          title="Skills & tools"
          accent="tools"
          description="The languages, frameworks and tools I use to bring ideas to life, from pixel-perfect interfaces to machine learning models and robots."
        />
        {isMobile ? (
          <SnapCarousel
            label="Skill categories"
            items={skills}
            getKey={(category) => category.title}
            renderItem={(category) => <SkillCard category={category} animate={false} />}
          />
        ) : (
          <Grid>
            {skills.map((category, index) => (
              <SkillCard key={category.title} category={category} index={index} />
            ))}
          </Grid>
        )}
      </Container>
    </Section>
  );
}
