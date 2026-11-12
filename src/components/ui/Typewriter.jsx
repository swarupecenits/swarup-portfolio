import { useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import {
  INITIAL_TYPEWRITER_STATE,
  nextTypewriterState,
  typewriterDelay,
  typewriterText,
} from "../../utils/typewriter";

const blink = keyframes`
  50% {
    opacity: 0;
  }
`;

const Root = styled.span`
  display: inline-flex;
  align-items: center;
  /* Room for the longest word, so centred text doesn't shift with every keystroke. */
  min-width: calc(var(--typewriter-chars, 0) * 1ch + 0.7em);
`;

// Solid while keys are being pressed, blinking while the word rests.
const Caret = styled.span`
  width: 0.55em;
  height: 1.2em;
  margin-left: 0.12em;
  background: var(--accent);
  animation: ${blink} 1.1s steps(1) infinite;

  [data-typing="true"] > & {
    animation: none;
  }
`;

/**
 * Types each of `words`, holds it, erases it and moves on, looping. It runs while `play` is
 * true and the tab is visible, picking up where it left off. Text is written straight to the
 * DOM, so a keystroke never re-renders React. Decorative: give assistive technology the words
 * separately.
 */
export default function Typewriter({ words, play = true, startDelay = 0, className }) {
  const rootRef = useRef(null);
  const textRef = useRef(null);
  const stateRef = useRef(INITIAL_TYPEWRITER_STATE);
  const startedRef = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    if (!root || !text || !play || words.length === 0) return undefined;
    let timer = 0;

    const schedule = (delay) => {
      window.clearTimeout(timer);
      timer = document.hidden ? 0 : window.setTimeout(step, delay);
    };

    function step() {
      startedRef.current = true;
      const current = stateRef.current;
      const next = nextTypewriterState(current, words);
      if (next === current) return;
      stateRef.current = next;
      text.textContent = typewriterText(next, words);
      const delay = typewriterDelay(next, words);
      root.dataset.typing = String(delay < 200);
      schedule(delay);
    }

    const onVisibilityChange = () => schedule(typewriterDelay(stateRef.current, words));

    schedule(startedRef.current ? typewriterDelay(stateRef.current, words) : startDelay);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      root.dataset.typing = "false";
    };
  }, [play, words, startDelay]);

  const longest = words.reduce((max, word) => Math.max(max, word.length), 0);

  return (
    <Root
      ref={rootRef}
      className={className}
      style={{ "--typewriter-chars": longest }}
      aria-hidden="true"
      data-typing="false"
    >
      <span ref={textRef} />
      <Caret />
    </Root>
  );
}
