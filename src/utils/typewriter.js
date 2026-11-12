// Milliseconds. Typing varies a little per keystroke so it feels human.
export const TYPE_DELAY = 75;
export const ERASE_DELAY = 34;
export const HOLD_DELAY = 1800;
export const GAP_DELAY = 420;

export const INITIAL_TYPEWRITER_STATE = Object.freeze({ index: 0, length: 0, deleting: false });

const wordAt = (words, index) => words[index] ?? "";

/** The visible text for a typewriter state. */
export function typewriterText(state, words) {
  return wordAt(words, state.index).slice(0, state.length);
}

/**
 * The next state of a type → hold → erase → next word loop. The state is
 * `{ index, length, deleting }`: which word is shown, how many of its characters are visible
 * and whether they are being erased. A single word is typed once and then kept.
 */
export function nextTypewriterState(state, words) {
  const word = wordAt(words, state.index);
  if (!state.deleting) {
    if (state.length < word.length) return { ...state, length: state.length + 1 };
    if (words.length < 2) return state;
    return { ...state, deleting: true, length: state.length - 1 };
  }
  if (state.length > 0) return { ...state, length: state.length - 1 };
  return { index: (state.index + 1) % words.length, length: 0, deleting: false };
}

/** How long to show `state` before stepping on. `random` returns a number in [0, 1). */
export function typewriterDelay(state, words, random = Math.random) {
  if (state.deleting) return ERASE_DELAY;
  if (state.length === 0) return GAP_DELAY;
  if (state.length >= wordAt(words, state.index).length) return HOLD_DELAY;
  return Math.round(TYPE_DELAY * (0.6 + random() * 0.8));
}
