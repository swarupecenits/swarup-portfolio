import { css } from "styled-components";

// Cards float above the animated 3D canvas, so they use near-opaque fills instead of backdrop
// blur: blurring a WebGL canvas that repaints every frame is expensive.
export const cardSurface = css`
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.03), transparent 42%), var(--surface);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.05),
    0 30px 60px -36px rgb(0 0 0 / 0.9);
`;

export const cardSurfaceHover = css`
  border-color: var(--line-strong);
  background: linear-gradient(180deg, rgb(255 255 255 / 0.045), transparent 42%), var(--surface-hover);
`;

export const gradientText = css`
  background: linear-gradient(180deg, #ffffff 25%, #a1a1aa 130%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
`;

/** Small uppercase mono label, e.g. section numbers and metadata. */
export const monoLabel = css`
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

/**
 * Hover light for cards: a soft glow plus a brighter border near the pointer, positioned by
 * `--mx` / `--my` (see useSpotlight). The card needs `data-spotlight` and `data-interactive`.
 */
export const spotlight = css`
  position: relative;
  isolation: isolate;

  &::before,
  &::after {
    content: "";
    position: absolute;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.35s ease;
    pointer-events: none;
  }

  &::before {
    inset: 0;
    z-index: -1;
    background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 0%), rgb(255 255 255 / 0.06), transparent 60%);
  }

  /* Only the 1px border ring is painted: the mask cuts out the content box. */
  &::after {
    inset: -1px;
    padding: 1px;
    background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 0%), rgb(var(--accent-rgb) / 0.7), transparent 70%);
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask-composite: exclude;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover::before,
    &:hover::after {
      opacity: 1;
    }
  }
`;

export const chip = css`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.04);
  color: var(--text-soft);
  font-family: var(--font-mono);
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.5;
  white-space: nowrap;
`;

export const primaryButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  box-shadow:
    inset 0 -2px 0 rgb(0 0 0 / 0.14),
    0 12px 32px -14px rgb(var(--accent-rgb) / 0.6);
  color: var(--accent-ink);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 0.25s var(--ease-out),
    box-shadow 0.25s ease,
    filter 0.25s ease;

  svg {
    transition: translate 0.25s var(--ease-out);
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.06);
    box-shadow:
      inset 0 -2px 0 rgb(0 0 0 / 0.14),
      0 18px 38px -14px rgb(var(--accent-rgb) / 0.75);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

export const ghostButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.03);
  color: var(--text);
  font-size: 15.5px;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s var(--ease-out);

  svg {
    transition: translate 0.25s var(--ease-out);
  }

  &:hover:not(:disabled) {
    border-color: rgb(255 255 255 / 0.32);
    background: rgb(255 255 255 / 0.08);
    transform: translateY(-2px);
  }
`;

/** Round, bordered icon link (socials, toolbar actions). */
export const iconButton = css`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgb(255 255 255 / 0.03);
  color: var(--text-soft);
  font-size: 18px;
  cursor: pointer;
  transition:
    color 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    transform 0.25s var(--ease-out);

  &:hover {
    border-color: var(--line-strong);
    background: rgb(255 255 255 / 0.08);
    color: var(--text);
    transform: translateY(-2px);
  }
`;
