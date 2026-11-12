import { describe, expect, it } from "vitest";
import { rankCommands } from "./commands";

const COMMANDS = [
  { id: "contact", label: "Contact", keywords: ["email", "message"] },
  { id: "copy", label: "Copy link", keywords: ["share", "url"] },
  { id: "form", label: "Open contact form" },
  { id: "resume", label: "Résumé", keywords: ["cv"] },
  { id: "discontact", label: "Discontact" },
];

const rank = (query) => rankCommands(COMMANDS, query).map(({ id }) => id);

describe("rankCommands", () => {
  it("keeps every command in its original order for an empty query", () => {
    expect(rank("  ")).toEqual(["contact", "copy", "form", "resume", "discontact"]);
  });

  it("ranks exact, prefix, word-start and substring matches in that order", () => {
    expect(rank("contact")).toEqual(["contact", "form", "discontact"]);
    expect(rank("co")).toEqual(["contact", "copy", "form", "discontact"]);
  });

  it("matches keywords and several words in any order", () => {
    expect(rank("share")).toEqual(["copy"]);
    expect(rank("url   copy")).toEqual(["copy"]);
  });

  it("ignores case and accents", () => {
    expect(rank("RESUME")).toEqual(["resume"]);
  });

  it("falls back to letters that appear in order", () => {
    expect(rank("cpl")).toEqual(["copy"]);
  });

  it("returns nothing when no command matches", () => {
    expect(rank("zebra")).toEqual([]);
  });
});
