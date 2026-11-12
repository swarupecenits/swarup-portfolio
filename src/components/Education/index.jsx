import { education } from "../../data/constants";
import EducationCard from "../Cards/EducationCard";
import { Container, Section, SectionHeading } from "../ui/Section";
import Timeline from "../ui/Timeline";

const ENTRIES = education.map((item) => ({
  id: item.id,
  date: item.date,
  logo: item.img,
  logoAlt: `${item.school} logo`,
  content: <EducationCard education={item} />,
}));

export default function Education() {
  return (
    <Section id="education" aria-labelledby="education-title">
      <Container>
        <SectionHeading
          id="education-title"
          index="04"
          eyebrow="Education"
          title="Where I studied"
          accent="studied"
          description="The classrooms and campuses where I built the foundations behind everything I make."
        />
        <Timeline entries={ENTRIES} label="Education history" />
      </Container>
    </Section>
  );
}
