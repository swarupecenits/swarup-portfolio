import gsap from "gsap";
import { nearestAngle, smoothDamp } from "../../utils/spring";

const AXES = ["x", "y", "z"];
// How close to its target (in the property's own units) a channel must be to come to rest. Each is
// about a third of a pixel on screen, so the final snap onto the target is invisible.
const PRECISION = { scale: 2e-4, position: 0.3, rotation: 1e-3 };
// The longest step simulated at once, so the keyboard doesn't leap after the tab was hidden.
const MAX_STEP = 0.1;

/**
 * Moves `object` (anything with x/y/z `scale`, `position` and `rotation`) towards the pose that
 * `getTarget()` returns, on critically damped springs ticked by GSAP. The target is read every
 * frame and may change at any moment: the motion keeps its momentum, so it never jerks. Values
 * are only written when they change, and once the pose is reached the follower stops ticking
 * until `wake()` is called. Call `unwind()` when the target jumps to a new pose so that rotations
 * head there the short way round instead of unspinning whole turns.
 */
export function createPoseFollower(object, getTarget, { smoothTime = 0.45 } = {}) {
  const channels = Object.keys(PRECISION).flatMap((group) =>
    AXES.map((axis) => ({ group, axis, precision: PRECISION[group], value: 0, velocity: 0 })),
  );
  let awake = false;
  let disposed = false;

  function tick(_time, deltaMs) {
    const dt = Math.min(Math.max(deltaMs / 1000, 0), MAX_STEP);
    const target = getTarget();
    let resting = true;

    for (const channel of channels) {
      const { group, axis, precision } = channel;
      const goal = target[group][axis];
      let { value, velocity } = smoothDamp(channel.value, goal, channel.velocity, smoothTime, dt);
      if (Math.abs(goal - value) < precision && Math.abs(velocity) * smoothTime < precision) {
        value = goal;
        velocity = 0;
      } else {
        resting = false;
      }

      channel.velocity = velocity;
      if (value !== channel.value) {
        channel.value = value;
        object[group][axis] = value;
      }
    }

    if (resting) {
      gsap.ticker.remove(tick);
      awake = false;
    }
  }

  function wake() {
    if (awake || disposed) return;
    awake = true;
    for (const channel of channels) {
      channel.value = object[channel.group][channel.axis];
      channel.velocity = 0;
    }
    gsap.ticker.add(tick);
  }

  function unwind() {
    if (disposed) return;
    const { rotation } = getTarget();
    for (const channel of channels) {
      if (channel.group !== "rotation") continue;
      const current = awake ? channel.value : object.rotation[channel.axis];
      const unwound = nearestAngle(current, rotation[channel.axis]);
      if (unwound === current) continue;
      channel.value = unwound;
      object.rotation[channel.axis] = unwound;
    }
  }

  function dispose() {
    disposed = true;
    awake = false;
    gsap.ticker.remove(tick);
  }

  wake();
  return { wake, unwind, dispose };
}
