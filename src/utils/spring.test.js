import { describe, expect, it } from "vitest";
import { nearestAngle, smoothDamp } from "./spring";

const run = (steps, dt, { from = 0, to = 1, velocity = 0, smoothTime = 0.4 } = {}) => {
  let state = { value: from, velocity };
  for (let step = 0; step < steps; step += 1) state = smoothDamp(state.value, to, state.velocity, smoothTime, dt);
  return state;
};

describe("smoothDamp", () => {
  it("moves the same distance whatever the frame rate", () => {
    const at60fps = run(60, 1 / 60);
    const at12fps = run(12, 1 / 12);
    expect(at12fps.value).toBeCloseTo(at60fps.value, 10);
    expect(at12fps.velocity).toBeCloseTo(at60fps.velocity, 10);
  });

  it("settles on the target from rest without overshooting", () => {
    let state = { value: 0, velocity: 0 };
    for (let step = 0; step < 240; step += 1) {
      state = smoothDamp(state.value, 10, state.velocity, 0.4, 1 / 60);
      expect(state.value).toBeLessThanOrEqual(10);
    }
    expect(state.value).toBeCloseTo(10, 4);
  });

  it("keeps its momentum when the target changes mid-flight", () => {
    const midway = run(15, 1 / 60, { to: 10 });
    const next = smoothDamp(midway.value, -10, midway.velocity, 0.4, 1 / 60);
    expect(next.value).toBeGreaterThan(midway.value);
  });
});

describe("nearestAngle", () => {
  it("shifts by whole turns to within half a turn of the reference", () => {
    expect(nearestAngle(Math.PI * 2 + 0.25, 0)).toBeCloseTo(0.25);
    expect(nearestAngle(5.5, Math.PI / 12)).toBeCloseTo(5.5 - Math.PI * 2);
    expect(nearestAngle(-Math.PI, Math.PI)).toBeCloseTo(Math.PI);
  });

  it("leaves an exact half turn alone so deliberate flips keep their direction", () => {
    expect(nearestAngle(Math.PI, 0)).toBe(Math.PI);
    expect(nearestAngle(-Math.PI, 0)).toBe(-Math.PI);
  });
});
