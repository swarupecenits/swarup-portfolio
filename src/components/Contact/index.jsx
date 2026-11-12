import styled from "styled-components";
import { motion } from "framer-motion";
import { FiArrowUpRight, FiFileText, FiMapPin } from "react-icons/fi";
import { Bio } from "../../data/constants";
import { SOCIAL_LINKS } from "../../data/socials";
import { Container, Section, SectionHeading } from "../ui/Section";
import { cardSurface, monoLabel } from "../ui/styles";
import ContactForm from "./ContactForm";
import Globe from "./Globe";
import LocalTime from "./LocalTime";

const EASE_OUT = [0.22, 1, 0.36, 1];

const LINK_NOTES = {
  linkedin: "Let's connect professionally",
  github: "Code and open source",
  instagram: "Life beyond code",
};

const QUICK_LINKS = [
  ...Object.keys(LINK_NOTES)
    .map((id) => SOCIAL_LINKS.find((link) => link.id === id))
    .filter(Boolean)
    .map((link) => ({ ...link, note: LINK_NOTES[link.id] })),
  ...(Bio.resume ? [{ id: "resume", label: "Resume", note: "My experience at a glance", href: Bio.resume, Icon: FiFileText }] : []),
];

const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "form globe"
    "form links";
  gap: clamp(20px, 2.5vw, 28px);

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: none;
    grid-template-areas:
      "globe"
      "form"
      "links";
  }
`;

const Card = styled(motion.div)`
  ${cardSurface}
  position: relative;
  padding: clamp(22px, 3vw, 32px);
`;

const FormCard = styled(Card)`
  grid-area: form;
  display: flex;
  flex-direction: column;
`;

const GlobeCard = styled(Card)`
  grid-area: globe;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  overflow: hidden;
  padding-top: clamp(12px, 2vw, 20px);
`;

const GlobeFrame = styled.div`
  width: min(100%, 340px);

  @media (max-width: 900px) {
    width: min(100%, 280px);
  }
`;

const Place = styled.div`
  display: flex;
  flex-direction: column;
  align-self: stretch;
  align-items: center;
  gap: 6px;
  text-align: center;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.02em;

    svg {
      color: var(--accent);
    }
  }
`;

const LinksCard = styled(Card)`
  grid-area: links;
`;

const LinksTitle = styled.h3`
  ${monoLabel}
  margin-bottom: 12px;
  color: var(--text-dim);
`;

const LinkList = styled.ul`
  display: grid;
  gap: 4px;
  list-style: none;
`;

const QuickLink = styled.a`
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 0 -10px;
  padding: 10px;
  border-radius: 14px;
  color: var(--text-soft);
  text-decoration: none;
  transition: background-color 0.2s ease;

  .icon {
    display: grid;
    flex-shrink: 0;
    place-items: center;
    width: 42px;
    height: 42px;
    border: 1px solid var(--line);
    border-radius: 999px;
    background: rgb(255 255 255 / 0.04);
    font-size: 18px;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease,
      color 0.2s ease;
  }

  .text {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  strong {
    color: var(--text);
    font-weight: 600;
  }

  small {
    color: var(--text-muted);
    font-size: 13.5px;
  }

  .arrow {
    flex-shrink: 0;
    color: var(--text-dim);
    transition:
      color 0.2s ease,
      translate 0.2s ease;
  }

  &:hover {
    background: rgb(255 255 255 / 0.04);
  }

  &:hover .icon {
    border-color: rgb(var(--accent-rgb) / 0.5);
    background: rgb(var(--accent-rgb) / 0.1);
    color: var(--accent);
  }

  &:hover .arrow {
    color: var(--accent);
    translate: 2px -2px;
  }
`;

const reveal = (delay) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "0px 0px -80px 0px" },
  transition: { duration: 0.7, delay, ease: EASE_OUT },
});

export default function Contact() {
  return (
    <Section id="contact" aria-labelledby="contact-title">
      <Container>
        <SectionHeading
          id="contact-title"
          index="05"
          eyebrow="Contact"
          title="Let's work together"
          accent="together"
          description="Have a question, an opportunity or an idea worth building? Send a message and I'll get back to you soon."
        />

        <Layout>
          <FormCard {...reveal(0)}>
            <ContactForm />
          </FormCard>

          <GlobeCard {...reveal(0.1)}>
            <GlobeFrame>
              <Globe />
            </GlobeFrame>
            <Place>
              <h3>
                <FiMapPin aria-hidden="true" />
                Based in {Bio.location}
              </h3>
              <LocalTime timeZone={Bio.timeZone} />
            </Place>
          </GlobeCard>

          <LinksCard {...reveal(0.2)}>
            <LinksTitle>Elsewhere</LinksTitle>
            <LinkList>
              {QUICK_LINKS.map(({ id, label, note, href, Icon }) => (
                <li key={id}>
                  <QuickLink href={href} target="_blank" rel="noopener noreferrer">
                    <span className="icon">
                      <Icon aria-hidden="true" />
                    </span>
                    <span className="text">
                      <strong>{label}</strong>
                      <small>{note}</small>
                    </span>
                    <FiArrowUpRight className="arrow" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </QuickLink>
                </li>
              ))}
            </LinkList>
          </LinksCard>
        </Layout>
      </Container>
    </Section>
  );
}
