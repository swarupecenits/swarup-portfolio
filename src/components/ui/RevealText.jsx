import { Fragment } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";

const EASE_OUT = [0.22, 1, 0.36, 1];

const Line = styled(motion.span)`
  display: block;
`;

// Each word slides up from behind its own mask. The padding leaves room for descenders and
// italic overhangs; the negative margin cancels it so spacing is unchanged.
const Mask = styled.span`
  display: inline-block;
  overflow: hidden;
  padding: 0.04em 0.08em 0.14em;
  margin: -0.04em -0.08em -0.14em;
  vertical-align: top;
`;

const Word = styled(motion.span)`
  display: inline-block;
`;

const WORD_VARIANTS = {
  hidden: { y: "112%" },
  visible: (delay) => ({ y: "0%", transition: { duration: 0.95, delay, ease: EASE_OUT } }),
};

const toWords = (text, accent) => {
  const accentWords = new Set(String(accent ?? "").split(/\s+/).filter(Boolean));
  return String(text)
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, accent: accentWords.has(word) }));
};

/**
 * Masked word-by-word reveal. Words listed in `accent` get the italic serif `.serif` style.
 * Plays once in view, or when `when` turns true if it is given. Purely visual: render the
 * plain text for assistive technology alongside it.
 */
export default function RevealText({ text, accent, when, delay = 0, stagger = 0.06, className, accentClassName = "serif" }) {
  const words = toWords(text, accent);
  const trigger =
    when === undefined
      ? { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "0px 0px -12% 0px" } }
      : { initial: "hidden", animate: when ? "visible" : "hidden" };

  return (
    <Line className={className} aria-hidden="true" {...trigger}>
      {words.map(({ word, accent: isAccent }, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 && " "}
          <Mask className={isAccent ? accentClassName : undefined}>
            <Word variants={WORD_VARIANTS} custom={delay + index * stagger}>
              {word}
            </Word>
          </Mask>
        </Fragment>
      ))}
    </Line>
  );
}
