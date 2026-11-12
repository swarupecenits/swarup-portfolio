export const opacity = {
  initial: { opacity: 0 },
  enter: { opacity: 0.75, transition: { duration: 1, delay: 0.2 } },
};

export const slideUp = {
  initial: { y: 0 },
  exit: { y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 } },
};

// The exit used when reduced motion is requested: a fade instead of a full-screen slide.
export const fadeOut = {
  initial: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};
