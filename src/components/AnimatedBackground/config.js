export const STATES = {
  hero: {
    desktop: {
      scale: { x: 0.20, y: 0.20, z: 0.20 },
      position: { x: 325, y: -110, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    mobile: {
      scale: { x: 0.30, y: 0.30, z: 0.30 },
      position: { x: 0, y: -200, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
  },
  skills: {
    desktop: {
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      position: { x: 0, y: -40, z: 0 },
      rotation: { x: 0, y: Math.PI / 12, z: 0 },
    },
    mobile: {
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: 0, y: -40, z: 0 },
      rotation: { x: 0, y: Math.PI / 6, z: 0 },
    },
  },
  experience: {
    desktop: {
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      position: { x: 0, y: -40, z: 0 },
      rotation: { x: Math.PI / 12, y: -Math.PI / 4, z: 0 },
    },
    mobile: {
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: 0, y: -40, z: 0 },
      rotation: { x: Math.PI / 6, y: -Math.PI / 6, z: 0 },
    },
  },
  projects: {
    desktop: {
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      position: { x: 0, y: -40, z: 0 },
      rotation: { x: Math.PI, y: Math.PI / 3, z: Math.PI },
    },
    mobile: {
      scale: { x: 0.3, y: 0.3, z: 0.3 },
      position: { x: 0, y: 150, z: 0 },
      rotation: { x: Math.PI, y: Math.PI / 3, z: Math.PI },
    },
  },
  contact: {
    desktop: {
      scale: { x: 0.2, y: 0.2, z: 0.2 },
      position: { x: 350, y: -250, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
    },
    mobile: {
      scale: { x: 0.25, y: 0.25, z: 0.25 },
      position: { x: 0, y: 150, z: 0 },
      rotation: { x: Math.PI, y: Math.PI / 3, z: Math.PI },
    },
  },
};

export function getKeyboardState({ section, isMobile }) {
  const state = STATES[section] || STATES.hero;
  const base = state[isMobile ? "mobile" : "desktop"];

  const DESKTOP_REF = 1280;
  const MOBILE_REF = 390;
  const width = window.innerWidth;
  const raw = isMobile ? width / MOBILE_REF : width / DESKTOP_REF;
  const scaleOffset = Math.min(Math.max(raw, 0.5), isMobile ? 0.6 : 1.15);

  return {
    ...base,
    scale: {
      x: Math.abs(base.scale.x * scaleOffset),
      y: Math.abs(base.scale.y * scaleOffset),
      z: Math.abs(base.scale.z * scaleOffset),
    },
  };
}
