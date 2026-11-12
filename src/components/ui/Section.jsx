import styled from "styled-components";
import { motion } from "framer-motion";
import RevealText from "./RevealText";
import { monoLabel } from "./styles";

const EASE_OUT = [0.22, 1, 0.36, 1];
const IN_VIEW = { once: true, margin: "0px 0px -12% 0px" };

/** A full-width page section; content is centred in a 1200px column. */
export const Section = styled.section`
  position: relative;
  z-index: 1;
  width: 100%;
  padding: clamp(80px, 11vw, 140px) 0;
`;

export const Container = styled.div`
  width: min(1200px, 100% - 32px);
  margin: 0 auto;

  @media (min-width: 640px) {
    width: min(1200px, 100% - 64px);
  }
`;

const Header = styled.header`
  position: relative;
  isolation: isolate;
  display: grid;
  gap: clamp(20px, 2.6vw, 30px);
  margin-bottom: clamp(40px, 6vw, 72px);

  /* A soft scrim keeps the heading readable while the 3D keyboard drifts behind it. The halo is
     a blurred box-shadow: it is painted once, where a blur filter would be redrawn every frame. */
  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    inset: 44px 36px;
    background: rgb(var(--bg-rgb) / 0.62);
    box-shadow: 0 0 64px 64px rgb(var(--bg-rgb) / 0.62);
    pointer-events: none;
  }
`;

const Label = styled(motion.p)`
  ${monoLabel}
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--text-muted);

  .index {
    color: var(--accent);
  }
`;

const Rule = styled(motion.span)`
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, var(--line-strong), transparent);
  transform-origin: left center;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.75fr);
  align-items: end;
  gap: 20px 56px;

  @media (max-width: 900px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const Title = styled.h2`
  color: var(--text);
  font-size: clamp(2.6rem, 7vw, 5.25rem);
  font-weight: 600;
  line-height: 0.98;
  letter-spacing: -0.045em;
  text-wrap: balance;

  .serif {
    color: var(--accent);
    font-size: 1.06em;
    letter-spacing: -0.02em;
  }
`;

const Description = styled(motion.p)`
  position: relative;
  max-width: 46ch;
  padding-bottom: 0.4em;
  color: var(--text-muted);
  font-size: clamp(1rem, 1.4vw, 1.0625rem);
  line-height: 1.7;
  text-wrap: pretty;
  /* A local scrim and a dark halo keep the copy legible when bright 3D keys drift behind it. */
  text-shadow:
    0 1px 2px rgb(0 0 0 / 0.65),
    0 0 18px rgb(var(--bg-rgb) / 0.95);

  &::before {
    content: "";
    position: absolute;
    z-index: -1;
    /* With the halo this reaches as far as the text's surroundings, so it fades out around it. */
    inset: 8px -4px;
    background: rgb(var(--bg-rgb) / 0.86);
    box-shadow: 0 0 36px 36px rgb(var(--bg-rgb) / 0.86);
    pointer-events: none;
  }
`;

/**
 * Numbered label + large title + description. Words of `title` listed in `accent` are set in
 * the italic serif. `id` goes on the title so the section can reference it.
 */
export function SectionHeading({ id, index, eyebrow, title, accent, description }) {
  return (
    <Header>
      {eyebrow && (
        <Label
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={IN_VIEW}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {index && (
            <span className="index" aria-hidden="true">
              {index}
            </span>
          )}
          <span>{eyebrow}</span>
          <Rule
            aria-hidden="true"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={IN_VIEW}
            transition={{ duration: 1.2, delay: 0.1, ease: EASE_OUT }}
          />
        </Label>
      )}
      <Row>
        <Title id={id}>
          <span className="sr-only">{title}</span>
          <RevealText text={title} accent={accent} />
        </Title>
        {description && (
          <Description
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={IN_VIEW}
            transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT }}
          >
            {description}
          </Description>
        )}
      </Row>
    </Header>
  );
}
