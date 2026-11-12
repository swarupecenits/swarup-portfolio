import { experiences } from "../../data/constants";
import { isOngoing } from "../../utils/dates";
import ExperienceCard from "../Cards/ExperienceCard";
import { Container, Section, SectionHeading } from "../ui/Section";
import Timeline from "../ui/Timeline";

const ENTRIES = experiences.map((experience) => ({
  id: experience.id,
  date: experience.date,
  logo: experience.img,
  logoAlt: `${experience.company} logo`,
  current: isOngoing(experience.date),
  content: <ExperienceCard experience={experience} />,
}));

export default function Experience() {
  return (
    <Section id="experience" aria-labelledby="experience-title">
      <Container>
        <SectionHeading
          id="experience-title"
          index="02"
          eyebrow="Experience"
          title="Career journey"
          accent="journey"
          description="From internships and research to leading a robotics club and shipping software at Microsoft, here is the journey so far."
        />
        <Timeline entries={ENTRIES} label="Work experience" />
      </Container>
    </Section>
  );
}
