import { useCallback, useEffect, useRef } from "react";

const SOUNDS = {
  press: `${import.meta.env.BASE_URL}assets/keycap-sounds/press.mp3`,
  release: `${import.meta.env.BASE_URL}assets/keycap-sounds/release.mp3`,
};

// Browsers only allow audio after a user gesture, so the AudioContext is created on the first
// interaction instead of on mount (which would log an autoplay warning and stay suspended).
// Not every event counts: modifier-only key presses (the Ctrl of Ctrl+K) and Esc don't.
const ACTIVATION_EVENTS = ["pointerdown", "pointerup", "keydown", "touchend", "click"];
const LISTENER_OPTIONS = { capture: true, passive: true };
const hasUserActivation = () => !navigator.userActivation || navigator.userActivation.isActive;

export function useSounds() {
  const audioRef = useRef(null);

  useEffect(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return undefined;

    const controller = new AbortController();
    let audio = null;

    const removeListeners = () =>
      ACTIVATION_EVENTS.forEach((type) => window.removeEventListener(type, unlock, LISTENER_OPTIONS));

    const loadBuffers = () =>
      Promise.all(
        Object.entries(SOUNDS).map(async ([name, url]) => {
          const response = await fetch(url, { signal: controller.signal });
          if (!response.ok) return;
          audio.buffers[name] = await audio.context.decodeAudioData(await response.arrayBuffer());
        }),
      ).catch(() => {
        // Sounds are a nice-to-have; the keyboard works fine without them.
      });

    function unlock() {
      if (!hasUserActivation()) return;
      if (!audio) {
        audio = { context: new AudioContextClass(), buffers: {} };
        audioRef.current = audio;
        loadBuffers();
      }
      if (audio.context.state === "running") {
        removeListeners();
        return;
      }
      audio.context
        .resume()
        .then(() => audio.context.state === "running" && removeListeners())
        .catch(() => {});
    }

    ACTIVATION_EVENTS.forEach((type) => window.addEventListener(type, unlock, LISTENER_OPTIONS));

    return () => {
      removeListeners();
      controller.abort();
      audio?.context.close().catch(() => {});
      audioRef.current = null;
    };
  }, []);

  return useCallback((name) => {
    const audio = audioRef.current;
    const buffer = audio?.buffers[name];
    if (!buffer || audio.context.state !== "running") return;

    const source = audio.context.createBufferSource();
    source.buffer = buffer;
    source.detune.value = Math.random() * 200 - 100;
    const gain = audio.context.createGain();
    gain.gain.value = 0.4;
    source.connect(gain).connect(audio.context.destination);
    source.start();
  }, []);
}
