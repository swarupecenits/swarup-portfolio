import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplineScene from "../SplineScene";
import { usePreloader } from "../Preloader/context";
import { useMediaQuery, usePrefersReducedMotion } from "../../hooks/useMediaQuery";
import { isLowPowerDevice } from "../../utils/gpu";
import { SKILLS } from "./skills";
import { getKeyboardState } from "./config";
import { createPoseFollower } from "./follower";
import { useSounds } from "./use-sounds";

gsap.registerPlugin(ScrollTrigger);

const SCENE_URL = `${import.meta.env.BASE_URL}assets/skills-keyboard.splinecode`;
const KEYBOARD_MOBILE_QUERY = "(max-width: 767px)";
// Length of the preloader's exit animation; the keyboard pops in as the curtain lifts.
const LOADER_EXIT_SECONDS = 0.9;

const SECTION_TRIGGERS = [
  { trigger: "#skills", section: "skills", previous: "hero", start: "top 50%" },
  { trigger: "#experience", section: "experience", previous: "skills", start: "top 50%" },
  { trigger: "#projects", section: "projects", previous: "experience", start: "top 70%" },
  { trigger: "#contact", section: "contact", previous: "projects", start: "top 30%" },
];

const SCENE_STYLE = { position: "fixed", inset: 0, zIndex: 0 };

const isMobileViewport = () => window.matchMedia(KEYBOARD_MOBILE_QUERY).matches;

const isTyping = () => {
  const el = document.activeElement;
  return !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);
};

// Where the keyboard is heading: the section's pose plus any ambient motion on top.
function getTargetPose({ pose, spin, sway, flip }) {
  if (flip) return { ...pose, rotation: { x: -Math.PI, y: sway, z: 0 } };
  if (spin) return { ...pose, rotation: { ...pose.rotation, y: pose.rotation.y + spin } };
  return pose;
}

function createBongoCat(app, { interval = 100 } = {}) {
  const cat = app.findObjectByName("bongo-cat");
  const frames = [app.findObjectByName("frame-1"), app.findObjectByName("frame-2")];
  if (!cat || !frames[0] || !frames[1]) return null;

  let timer = null;
  return {
    start() {
      clearInterval(timer);
      let tick = 0;
      cat.visible = true;
      timer = setInterval(() => {
        frames[0].visible = tick % 2 === 1;
        frames[1].visible = tick % 2 === 0;
        tick += 1;
      }, interval);
    },
    stop() {
      clearInterval(timer);
      timer = null;
      cat.visible = false;
      frames.forEach((frame) => {
        frame.visible = false;
      });
    },
    dispose: () => clearInterval(timer),
  };
}

// In the contact section the skill keycaps drift off the keyboard; elsewhere they settle back.
function createFloatingKeycaps(app) {
  const keycaps = Object.keys(SKILLS)
    .map((name) => app.findObjectByName(name))
    .filter(Boolean);
  let tweens = [];
  let floating = false;
  const kill = () => {
    tweens.forEach((tween) => tween.kill());
    tweens = [];
  };

  return {
    start() {
      kill();
      floating = true;
      tweens = gsap.utils.shuffle([...keycaps]).map((keycap, index) =>
        gsap.to(keycap.position, {
          y: gsap.utils.random(200, 400),
          duration: gsap.utils.random(2, 4),
          delay: index * 0.6,
          repeat: -1,
          yoyo: true,
          ease: "elastic.out(1,0.3)",
        }),
      );
    },
    stop() {
      if (!floating) return;
      floating = false;
      kill();
      tweens = keycaps.map((keycap) =>
        gsap.to(keycap.position, { y: 0, duration: 4, ease: "elastic.out(1,0.7)" }),
      );
    },
    dispose: kill,
  };
}

export default function AnimatedBackground() {
  const { isLoading } = usePreloader();
  const isMobile = useMediaQuery(KEYBOARD_MOBILE_QUERY);
  const reducedMotion = usePrefersReducedMotion();
  const lowPower = isLowPowerDevice();
  // Continuous motion (the hero spin, the contact sway and floating keycaps) is skipped when
  // reduced motion is requested, and without a GPU, where each frame of it redraws the scene.
  const ambient = !reducedMotion && !lowPower;
  const playSound = useSounds();
  const [scene, setScene] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [revealed, setRevealed] = useState(false);
  const activeSectionRef = useRef(activeSection);
  const loaderGoneAtRef = useRef(0);
  const driverRef = useRef({ pose: null, spin: 0, sway: 0, flip: false });
  const followerRef = useRef(null);

  const handleLoad = (app) => {
    const keyboard = app.findObjectByName("keyboard");
    if (!keyboard) return;
    const start = getKeyboardState({ section: "hero", isMobile: isMobileViewport() });
    keyboard.visible = false;
    gsap.set(keyboard.scale, { x: 0.01, y: 0.01, z: 0.01 });
    gsap.set(keyboard.position, start.position);
    gsap.set(keyboard.rotation, start.rotation);
    setScene({
      app,
      keyboard,
      bongoCat: createBongoCat(app, { interval: lowPower ? 250 : 100 }),
      keycaps: createFloatingKeycaps(app),
    });
  };

  const handleError = (error) => {
    // The keyboard is decorative, so the page simply carries on without it.
    if (import.meta.env.DEV) console.error(error);
  };

  useEffect(() => {
    activeSectionRef.current = activeSection;
  }, [activeSection]);

  useEffect(() => {
    if (!isLoading) loaderGoneAtRef.current = performance.now();
  }, [isLoading]);

  useEffect(() => {
    if (!scene) return undefined;
    return () => {
      scene.bongoCat?.dispose();
      scene.keycaps.dispose();
    };
  }, [scene]);

  // Only the light-on-dark text variants are used; pick the one that fits the layout.
  useEffect(() => {
    if (!scene) return;
    const visibility = {
      "text-desktop": !isMobile,
      "text-mobile": isMobile,
      "text-desktop-dark": false,
      "text-mobile-dark": false,
    };
    for (const [name, visible] of Object.entries(visibility)) {
      const object = scene.app.findObjectByName(name);
      if (object) object.visible = visible;
    }
  }, [scene, isMobile, activeSection]);

  // Hovering (or typing) a skill key shows its name and plays a key click.
  useEffect(() => {
    if (!scene) return undefined;
    const { app } = scene;
    const hasLabel = app.getVariable("heading") !== undefined;
    let selected = null;

    const showLabel = (skill) => {
      if (!hasLabel) return;
      app.setVariable("heading", skill?.label ?? "");
      app.setVariable("desc", skill?.shortDescription ?? "");
    };

    const onHover = (event) => {
      const name = event.target?.name;
      if (!name || selected?.name === name) return;
      if (name === "body" || name === "platform") {
        if (selected) playSound("release");
        selected = null;
        showLabel(null);
        return;
      }
      const skill = SKILLS[name];
      if (!skill) return;
      if (selected) playSound("release");
      playSound("press");
      selected = skill;
      showLabel(skill);
    };

    const onKeyDown = (event) => {
      const skill = SKILLS[event.target?.name];
      if (!skill || isTyping()) return;
      playSound("press");
      selected = skill;
      showLabel(skill);
    };

    const onKeyUp = () => {
      if (isTyping()) return;
      playSound("release");
      selected = null;
      showLabel(null);
    };

    app.addEventListener("mouseHover", onHover);
    app.addEventListener("keyDown", onKeyDown);
    app.addEventListener("keyUp", onKeyUp);
    return () => {
      app.removeEventListener("mouseHover", onHover);
      app.removeEventListener("keyDown", onKeyDown);
      app.removeEventListener("keyUp", onKeyUp);
    };
  }, [scene, playSound]);

  // Track which section is on screen; the keyboard changes pose for each one.
  useEffect(() => {
    if (!scene) return undefined;
    const ctx = gsap.context(() => {
      for (const { trigger, section, previous, start } of SECTION_TRIGGERS) {
        if (!document.querySelector(trigger)) continue;
        ScrollTrigger.create({
          trigger,
          start,
          end: "bottom bottom",
          onEnter: () => setActiveSection(section),
          onLeaveBack: () => setActiveSection(previous),
        });
      }
    });

    // Sections grow when images load or projects are filtered, so keep trigger positions fresh.
    let timer;
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      ctx.revert();
    };
  }, [scene]);

  // Pop the keyboard in once both the scene and the page are ready.
  useEffect(() => {
    if (!scene || isLoading) return undefined;
    const { app, keyboard } = scene;
    const mobile = isMobileViewport();
    const state = getKeyboardState({ section: activeSectionRef.current, isMobile: mobile });
    const objects = app.getAllObjects();
    const keycaps = objects.filter((object) => object.name === "keycap");
    const layoutKeycaps = objects.filter((object) => object.name === (mobile ? "keycap-mobile" : "keycap-desktop"));
    const sinceLoader = (performance.now() - loaderGoneAtRef.current) / 1000;

    const tl = gsap.timeline({ delay: Math.max(0, LOADER_EXIT_SECONDS - sinceLoader) });
    tl.call(() => {
      keyboard.visible = true;
      keycaps.forEach((keycap) => {
        keycap.visible = false;
        keycap.position.y = 200;
      });
    })
      .to(keyboard.scale, { ...state.scale, duration: 1.5, ease: "elastic.out(1,0.6)" }, 0)
      .to(keyboard.position, { ...state.position, duration: 1.5, ease: "power2.out" }, 0)
      .to(keyboard.rotation, { ...state.rotation, duration: 1.5, ease: "power2.out" }, 0)
      .call(() => setRevealed(true), undefined, 1.5);

    layoutKeycaps.forEach((keycap, index) => {
      tl.call(() => (keycap.visible = true), undefined, 0.9 + (mobile ? 0 : index * 0.07));
    });
    keycaps.forEach((keycap, index) => {
      const at = 0.9 + index * 0.07;
      tl.call(() => (keycap.visible = true), undefined, at);
      tl.to(keycap.position, { y: 50, duration: 0.5, ease: "bounce.out" }, at + 0.1);
    });

    return () => tl.kill();
  }, [scene, isLoading]);

  // The keyboard glides between poses on springs that keep their momentum, so it stays fluid
  // however quickly the visitor scrolls. It only ticks (and redraws the scene) while moving.
  useEffect(() => {
    if (!scene || !revealed) return undefined;
    const driver = driverRef.current;
    driver.pose = getKeyboardState({ section: activeSectionRef.current, isMobile: isMobileViewport() });
    const follower = createPoseFollower(scene.keyboard, () => getTargetPose(driver));
    followerRef.current = follower;

    // The keyboard's size follows the viewport width.
    const onResize = () => {
      driver.pose = getKeyboardState({ section: activeSectionRef.current, isMobile: isMobileViewport() });
      follower.wake();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      follower.dispose();
      followerRef.current = null;
    };
  }, [scene, revealed]);

  // Per-section pose and ambient animations.
  useEffect(() => {
    const follower = followerRef.current;
    if (!scene || !revealed || !follower) return undefined;
    const { bongoCat, keycaps } = scene;
    const driver = driverRef.current;
    Object.assign(driver, { pose: getKeyboardState({ section: activeSection, isMobile }), spin: 0, sway: 0, flip: false });
    follower.unwind();
    follower.wake();

    const ctx = gsap.context(() => {
      if (activeSection === "projects") gsap.delayedCall(0.3, () => bongoCat?.start());
      else gsap.delayedCall(0.2, () => bongoCat?.stop());

      if (activeSection !== "contact") gsap.delayedCall(0.6, () => keycaps.stop());
      if (!ambient) return;

      if (activeSection === "hero") {
        gsap.to(driver, {
          spin: Math.PI * 2,
          duration: 10,
          delay: 1,
          repeat: -1,
          yoyo: true,
          yoyoEase: true,
          ease: "back.inOut",
          onUpdate: follower.wake,
        });
      } else if (activeSection === "contact") {
        // Flip over, then sway while the skill keycaps float off.
        gsap.delayedCall(0.6, () => {
          driver.flip = true;
          follower.wake();
          keycaps.start();
        });
        gsap.to(driver, {
          sway: -Math.PI / 2,
          duration: 5,
          delay: 1.4,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          onUpdate: follower.wake,
        });
      }
    });

    return () => ctx.kill();
  }, [scene, revealed, activeSection, isMobile, ambient]);

  return (
    <SplineScene
      scene={SCENE_URL}
      onLoad={handleLoad}
      onError={handleError}
      renderOnDemand
      aria-hidden="true"
      style={SCENE_STYLE}
    />
  );
}
