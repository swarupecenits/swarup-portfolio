import React, { Suspense, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SKILLS } from "./skills";
import { getKeyboardState } from "./config";
import { useSounds } from "./use-sounds";

gsap.registerPlugin(ScrollTrigger);

const Spline = React.lazy(() => import("@splinetool/react-spline"));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const AnimatedBackground = ({ darkMode }) => {
  const { playPressSound, playReleaseSound } = useSounds();
  const [splineApp, setSplineApp] = useState(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [keyboardRevealed, setKeyboardRevealed] = useState(false);
  const selectedSkillRef = useRef(null);
  const bongoAnimationRef = useRef(null);
  const keycapAnimationsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ─── Interaction handlers ────────────────────────────────────────────────────

  const handleMouseHover = (e, app) => {
    if (!app || selectedSkillRef.current?.name === e.target.name) return;

    if (e.target.name === "body" || e.target.name === "platform") {
      if (selectedSkillRef.current) playReleaseSound();
      selectedSkillRef.current = null;
      if (app.getVariable && typeof app.getVariable("heading") !== "undefined") {
        app.setVariable("heading", "");
        app.setVariable("desc", "");
      }
    } else {
      if (!selectedSkillRef.current || selectedSkillRef.current.name !== e.target.name) {
        const skill = SKILLS[e.target.name];
        if (skill) {
          if (selectedSkillRef.current) playReleaseSound();
          playPressSound();
          selectedSkillRef.current = skill;
          if (app.getVariable && typeof app.getVariable("heading") !== "undefined") {
            app.setVariable("heading", skill.label);
            app.setVariable("desc", skill.shortDescription);
          }
        }
      }
    }
  };

  const handleSplineInteractions = (app) => {
    const isInputFocused = () => {
      const el = document.activeElement;
      return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };

    app.addEventListener("keyUp", () => {
      if (!app || isInputFocused()) return;
      playReleaseSound();
      app.setVariable("heading", "");
      app.setVariable("desc", "");
    });

    app.addEventListener("keyDown", (e) => {
      if (!app || isInputFocused()) return;
      const skill = SKILLS[e.target.name];
      if (skill) {
        playPressSound();
        selectedSkillRef.current = skill;
        app.setVariable("heading", skill.label);
        app.setVariable("desc", skill.shortDescription);
      }
    });

    app.addEventListener("mouseHover", (e) => handleMouseHover(e, app));
  };

  // ─── Scroll section transitions ──────────────────────────────────────────────

  const createSectionTimeline = (app, triggerId, targetSection, prevSection, start = "top 50%") => {
    const kbd = app.findObjectByName("keyboard");
    if (!kbd) return;

    ScrollTrigger.create({
      trigger: triggerId,
      start,
      end: "bottom bottom",
      onEnter: () => {
        setActiveSection(targetSection);
        const state = getKeyboardState({ section: targetSection, isMobile });
        gsap.to(kbd.scale, { ...state.scale, duration: 1 });
        gsap.to(kbd.position, { ...state.position, duration: 1 });
        gsap.to(kbd.rotation, { ...state.rotation, duration: 1 });
      },
      onLeaveBack: () => {
        setActiveSection(prevSection);
        const state = getKeyboardState({ section: prevSection, isMobile });
        gsap.to(kbd.scale, { ...state.scale, duration: 1 });
        gsap.to(kbd.position, { ...state.position, duration: 1 });
        gsap.to(kbd.rotation, { ...state.rotation, duration: 1 });
      },
    });
  };

  const setupScrollAnimations = (app) => {
    const kbd = app.findObjectByName("keyboard");
    if (!kbd) return;

    const heroState = getKeyboardState({ section: "hero", isMobile });
    gsap.set(kbd.scale, heroState.scale);
    gsap.set(kbd.position, heroState.position);

    createSectionTimeline(app, "#skills", "skills", "hero");
    createSectionTimeline(app, "#experience", "experience", "skills");
    createSectionTimeline(app, "#projects", "projects", "experience", "top 70%");
    createSectionTimeline(app, "#contact", "contact", "projects", "top 30%");
  };

  // ─── Bongo cat animation ─────────────────────────────────────────────────────

  const getBongoAnimation = (app) => {
    const framesParent = app.findObjectByName("bongo-cat");
    const frame1 = app.findObjectByName("frame-1");
    const frame2 = app.findObjectByName("frame-2");
    if (!frame1 || !frame2 || !framesParent) return { start: () => {}, stop: () => {} };

    let interval;
    return {
      start: () => {
        let i = 0;
        framesParent.visible = true;
        interval = setInterval(() => {
          frame1.visible = !!(i % 2);
          frame2.visible = !(i % 2);
          i++;
        }, 100);
      },
      stop: () => {
        clearInterval(interval);
        framesParent.visible = false;
        frame1.visible = false;
        frame2.visible = false;
      },
    };
  };

  // ─── Keycap float animation ──────────────────────────────────────────────────

  const getKeycapsAnimation = (app) => {
    let tweens = [];
    const killAll = () => tweens.forEach((t) => t.kill());

    return {
      start: () => {
        killAll();
        tweens = [];
        Object.values(SKILLS)
          .sort(() => Math.random() - 0.5)
          .forEach((skill, idx) => {
            const keycap = app.findObjectByName(skill.name);
            if (!keycap) return;
            tweens.push(
              gsap.to(keycap.position, {
                y: Math.random() * 200 + 200,
                duration: Math.random() * 2 + 2,
                delay: idx * 0.6,
                repeat: -1,
                yoyo: true,
                ease: "elastic.out(1,0.3)",
              })
            );
          });
      },
      stop: () => {
        killAll();
        tweens = [];
        Object.values(SKILLS).forEach((skill) => {
          const keycap = app.findObjectByName(skill.name);
          if (!keycap) return;
          tweens.push(
            gsap.to(keycap.position, {
              y: 0,
              duration: 4,
              repeat: 1,
              ease: "elastic.out(1,0.7)",
            })
          );
        });
        setTimeout(killAll, 5000);
      },
    };
  };

  // ─── Keyboard reveal on load ─────────────────────────────────────────────────

  const updateKeyboardTransform = async (app) => {
    const kbd = app.findObjectByName("keyboard");
    if (!kbd) return;

    kbd.visible = false;
    await sleep(400);
    kbd.visible = true;
    setKeyboardRevealed(true);

    const currentState = getKeyboardState({ section: "hero", isMobile });
    gsap.fromTo(
      kbd.scale,
      { x: 0.01, y: 0.01, z: 0.01 },
      { ...currentState.scale, duration: 1.5, ease: "elastic.out(1,0.6)" }
    );

    const allObjects = app.getAllObjects();
    const keycaps = allObjects.filter((obj) => obj.name === "keycap");

    await sleep(900);

    if (isMobile) {
      allObjects.filter((o) => o.name === "keycap-mobile").forEach((k) => { k.visible = true; });
    } else {
      allObjects
        .filter((o) => o.name === "keycap-desktop")
        .forEach(async (keycap, idx) => {
          await sleep(idx * 70);
          keycap.visible = true;
        });
    }

    keycaps.forEach(async (keycap, idx) => {
      keycap.visible = false;
      await sleep(idx * 70);
      keycap.visible = true;
      gsap.fromTo(keycap.position, { y: 200 }, { y: 50, duration: 0.5, delay: 0.1, ease: "bounce.out" });
    });
  };

  // ─── Init once Spline is loaded ──────────────────────────────────────────────

  const handleLoad = async (app) => {
    setSplineApp(app);

    handleSplineInteractions(app);
    setupScrollAnimations(app);

    bongoAnimationRef.current = getBongoAnimation(app);
    keycapAnimationsRef.current = getKeycapsAnimation(app);

    await updateKeyboardTransform(app);
  };

  // ─── Theme: toggle Spline text objects ──────────────────────────────────────

  useEffect(() => {
    if (!splineApp) return;
    const tDD = splineApp.findObjectByName("text-desktop-dark");
    const tDL = splineApp.findObjectByName("text-desktop");
    const tMD = splineApp.findObjectByName("text-mobile-dark");
    const tML = splineApp.findObjectByName("text-mobile");
    if (!tDD || !tDL || !tMD || !tML) return;

    const set = (dDark, dLight, mDark, mLight) => {
      tDD.visible = dDark;
      tDL.visible = dLight;
      tMD.visible = mDark;
      tML.visible = mLight;
    };

    if (activeSection !== "skills") {
      set(false, false, false, false);
    } else if (darkMode) {
      isMobile ? set(false, false, false, true) : set(false, true, false, false);
    } else {
      isMobile ? set(false, false, true, false) : set(true, false, false, false);
    }
  }, [darkMode, splineApp, isMobile, activeSection]);

  // ─── Section-based animation management ─────────────────────────────────────

  useEffect(() => {
    if (!splineApp) return;

    const kbd = splineApp.findObjectByName("keyboard");
    let rotateKbd, teardownKbd;

    if (kbd) {
      rotateKbd = gsap.to(kbd.rotation, {
        y: Math.PI * 2 + kbd.rotation.y,
        duration: 10,
        repeat: -1,
        yoyo: true,
        ease: "back.inOut",
        delay: 2.5,
        paused: true,
      });

      teardownKbd = gsap.fromTo(
        kbd.rotation,
        { y: 0, x: -Math.PI, z: 0 },
        {
          y: -Math.PI / 2,
          duration: 5,
          repeat: -1,
          yoyo: true,
          delay: 2.5,
          immediateRender: false,
          paused: true,
        }
      );
    }

    const manage = async () => {
      if (activeSection !== "skills") {
        splineApp.setVariable("heading", "");
        splineApp.setVariable("desc", "");
      }

      if (activeSection === "hero") {
        rotateKbd?.restart();
        teardownKbd?.pause();
      } else if (activeSection === "contact") {
        rotateKbd?.pause();
      } else {
        rotateKbd?.pause();
        teardownKbd?.pause();
      }

      if (activeSection === "projects") {
        await sleep(300);
        bongoAnimationRef.current?.start();
      } else {
        await sleep(200);
        bongoAnimationRef.current?.stop();
      }

      if (activeSection === "contact") {
        await sleep(600);
        teardownKbd?.restart();
        keycapAnimationsRef.current?.start();
      } else {
        await sleep(600);
        teardownKbd?.pause();
        keycapAnimationsRef.current?.stop();
      }
    };

    manage();

    return () => {
      rotateKbd?.kill();
      teardownKbd?.kill();
    };
  }, [activeSection, splineApp]);

  // ─── Cleanup ScrollTriggers on unmount ──────────────────────────────────────

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <Spline
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          pointerEvents: "auto",
        }}
        onLoad={handleLoad}
        scene="/assets/skills-keyboard.spline"
      />
    </Suspense>
  );
};

export default AnimatedBackground;
