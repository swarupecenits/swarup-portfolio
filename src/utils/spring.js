const TURN = Math.PI * 2;

/**
 * Shifts `angle` by whole turns so that it lies within half a turn of `reference`. An exact half
 * turn is left alone, so a deliberate 180° move keeps its direction.
 */
export function nearestAngle(angle, reference) {
  const delta = angle - reference;
  if (Math.abs(delta) <= Math.PI + 1e-9) return angle;
  return angle - TURN * Math.round(delta / TURN);
}

/**
 * Advances a critically damped spring by `dt` seconds (the exact solution, so any frame rate
 * gives the same motion). It eases towards `target` without overshooting from rest and keeps
 * its velocity when the target changes mid-flight. `smoothTime` is roughly the time it takes
 * to cover most of the distance.
 */
export function smoothDamp(current, target, velocity, smoothTime, dt) {
  const omega = 2 / Math.max(smoothTime, 1e-4);
  const offset = current - target;
  const drive = (velocity + omega * offset) * dt;
  const decay = Math.exp(-omega * dt);
  return {
    value: target + (offset + drive) * decay,
    velocity: (velocity - omega * drive) * decay,
  };
}
