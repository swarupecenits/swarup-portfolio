import { normalizeText } from "./text";

const isSubsequence = (needle, haystack) => {
  let position = 0;
  for (const character of haystack) {
    if (character === needle[position]) position += 1;
    if (position === needle.length) return true;
  }
  return false;
};

/**
 * How well `query` matches `{ label, keywords }`, from 100 (exact label) through label prefix,
 * word prefix, substring and "every word appears in the label or keywords" down to 5 (the
 * label's letters appear in order). 0 means no match; an empty query matches everything.
 */
export function scoreCommand(command, query) {
  const needle = normalizeText(query).trim().replace(/\s+/g, " ");
  if (!needle) return 1;

  const label = normalizeText(command.label);
  if (label === needle) return 100;
  if (label.startsWith(needle)) return 80;
  if (label.split(/[^a-z0-9]+/).some((word) => word.startsWith(needle))) return 60;
  if (label.includes(needle)) return 40;

  const haystack = normalizeText([command.label, ...(command.keywords ?? [])].join(" "));
  if (needle.split(" ").every((term) => haystack.includes(term))) return 20;
  if (isSubsequence(needle.replaceAll(" ", ""), label.replace(/\s+/g, ""))) return 5;
  return 0;
}

/** The commands matching `query`, best first; equally good matches keep their original order. */
export function rankCommands(commands, query) {
  return commands
    .map((command, index) => ({ command, index, score: scoreCommand(command, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ command }) => command);
}
