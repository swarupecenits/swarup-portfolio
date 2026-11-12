import { describe, expect, it } from "vitest";
import {
  ERASE_DELAY,
  GAP_DELAY,
  HOLD_DELAY,
  INITIAL_TYPEWRITER_STATE,
  nextTypewriterState,
  typewriterDelay,
  typewriterText,
} from "./typewriter";

const play = (words, steps) => {
  const frames = [];
  let state = INITIAL_TYPEWRITER_STATE;
  for (let step = 0; step < steps; step += 1) {
    state = nextTypewriterState(state, words);
    frames.push(typewriterText(state, words));
  }
  return frames;
};

describe("typewriter", () => {
  it("types a word, erases it and moves on to the next, wrapping around", () => {
    expect(play(["ab", "c"], 10)).toEqual(["a", "ab", "a", "", "", "c", "", "", "a", "ab"]);
  });

  it("types a single word once and keeps it", () => {
    expect(play(["hi"], 5)).toEqual(["h", "hi", "hi", "hi", "hi"]);
  });

  it("holds full words, pauses between words and erases faster than it types", () => {
    const words = ["abc", "d"];
    expect(typewriterDelay({ index: 0, length: 3, deleting: false }, words)).toBe(HOLD_DELAY);
    expect(typewriterDelay({ index: 1, length: 0, deleting: false }, words)).toBe(GAP_DELAY);
    expect(typewriterDelay({ index: 0, length: 2, deleting: true }, words)).toBe(ERASE_DELAY);
    const typing = { index: 0, length: 1, deleting: false };
    expect(typewriterDelay(typing, words, () => 0)).toBeGreaterThan(ERASE_DELAY);
    expect(typewriterDelay(typing, words, () => 0.99)).toBeLessThan(HOLD_DELAY / 10);
  });
});
