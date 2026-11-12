import { useEffect, useEffectEvent, useRef } from "react";
import { wasmPath } from "virtual:spline-wasm";
import { isLowPowerDevice } from "../utils/gpu";

// Scenes exported with an older Spline editor are upgraded on the fly, and the runtime logs an
// "updating from <old> to <new>" notice each time. It is informational only (re-exporting the
// scene from the Spline editor removes it), so exactly that message is muted while a scene starts.
let muteDepth = 0;
let originalWarn = null;
function muteSceneUpgradeNotice() {
  if (muteDepth++ === 0) {
    originalWarn = console.warn;
    console.warn = (...args) => {
      if (typeof args[0] === "string" && args[0].startsWith("updating from")) return;
      originalWarn.apply(console, args);
    };
  }
  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    if (--muteDepth === 0) console.warn = originalWarn;
  };
}

async function fetchScene(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Could not load the 3D scene ${url} (HTTP ${response.status})`);
  return response.arrayBuffer();
}

/**
 * Holds back the scene's frames, including the first one, which `start` draws straight away,
 * until the returned function is called.
 */
function holdFrames(app) {
  const render = app.render;
  if (typeof render !== "function") return () => {};
  let held = true;
  app.render = (...args) => {
    if (!held) render.apply(app, args);
  };
  return () => {
    held = false;
    app._requestRenderAutoMode?.();
  };
}

// How often to check whether the browser has finished compiling, and how long to wait at most.
const COMPILE_POLL_MS = 16;
const COMPILE_LIMIT_MS = 5000;

const nextTask = (delay = 0) => new Promise((resolve) => setTimeout(resolve, delay));

/**
 * A shader is compiled the first time something that uses it is drawn, and the page freezes
 * meanwhile (for 0.1-0.2 s per shader without a GPU). This compiles the shaders of everything in
 * the scene, hidden objects included, before it is drawn: the browser compiles them on its own
 * threads, so the page keeps responding. Resolves once they are ready, or after a few seconds.
 * Never rejects: it is only an optimisation, and anything missed is compiled when first drawn.
 */
async function compileShaders(app) {
  try {
    const renderer = app._renderer;
    const programs = renderer?.info?.programs;
    // The scene is drawn into this buffer before its effects are applied. Shaders are specific to
    // the kind of buffer they draw into, so ones compiled for the screen would go unused.
    const target = renderer?.pipeline?._rt;
    if (typeof renderer?.compile !== "function" || !Array.isArray(programs) || !target?.isWebGLRenderTarget) return;

    const known = new Set(programs);
    const previousTarget = renderer.getRenderTarget();
    renderer.setRenderTarget(target);
    try {
      renderer.compile(app._scene, app._camera);
    } finally {
      renderer.setRenderTarget(previousTarget);
    }

    const created = programs.filter((program) => !known.has(program));
    // A program is deleted along with its material, and must not be used after that.
    const live = () => created.filter((program) => programs.includes(program));
    const deadline = performance.now() + COMPILE_LIMIT_MS;
    while (!app.disposed && performance.now() < deadline && !live().every((program) => program.isReady())) {
      await nextTask(COMPILE_POLL_MS);
    }
    if (app.disposed) return;
    // The first draw with a program also reads back its variables, which waits for the compile to
    // finish. Now that it has, that takes no time.
    for (const program of live()) {
      program.getUniforms();
      program.getAttributes();
    }
  } catch {
    // Only an optimisation: whatever is not compiled here is compiled when first drawn.
  }
}

/**
 * The runtime (2.0.x) is meant to skip frames while nothing changes, but its camera controls never
 * report that they are idle, so it redraws the whole scene on every frame. Passing their idle flag
 * through makes it draw only while something moves (object changes, state animations, hover
 * effects). Without a GPU it also drops the ~32 extra anti-aliasing frames drawn after every
 * change, which look the same but cost a lot there. Scenes whose follow, look-at or drag
 * behaviours animate between frames are left alone. Returns an undo function.
 */
function renderOnlyOnChange(app, canvas) {
  const controls = app._controls;
  const handlers = app._eventManager?.handlers ?? {};
  if (typeof controls?.update !== "function" || handlers.Follow || handlers.LookAt || handlers.DragDrop) {
    return () => {};
  }
  const update = controls.update;
  controls.update = function updateAndReportIdle(dt) {
    return update.call(this, dt) ?? this.skipRender;
  };
  const restoreControls = () => {
    controls.update = update;
  };

  // Particles and hair simulations keep asking for frames on their own; the trim would freeze them.
  let simulated = false;
  app._scene?.traverseEntity?.((entity) => {
    if (entity.type === "ParticleSystem" || entity.isHairSystem === true) simulated = true;
  });
  if (!isLowPowerDevice() || simulated) return restoreControls;

  // After a frame in which nothing in the scene itself changed, stop instead of drawing the tail.
  const onRendered = () => {
    const renderer = app._renderer;
    if (!app.currentTAAFrame || renderer?.lastFrameIncomplete || renderer?.skyAnimationActive) return;
    if (renderer?.sceneTransitionTimeRemaining > 0) return;
    app.currentTAAFrame = 0;
    app._skipRender = true;
  };
  canvas.addEventListener("rendered", onRendered);
  return () => {
    canvas.removeEventListener("rendered", onRendered);
    restoreControls();
  };
}

// A frame the GPU has not confirmed within this time is treated as done, in case the fence is lost.
const GPU_WAIT_LIMIT_MS = 1000;
// The scene counts as animating when it asks for a frame while the last one is still being drawn
// or within this time after it...
const ANIMATING_GAP_MS = 200;
// ...and it is then drawn at this fraction of its resolution, until it has been still this long.
const MOTION_RESOLUTION = 0.5;
const SETTLE_MS = 350;

/**
 * Without a GPU, Chrome accepts WebGL frames much faster than the software rasteriser draws them.
 * While the scene animates the backlog grows, and the page's own text and images, which wait behind
 * it, can freeze scrolling for seconds. This draws a frame only once the previous one has finished
 * (a WebGL 2 fence), so at most one frame is ever waiting. While the scene animates it is drawn at
 * half resolution, which nearly triples its frame rate there, and it is redrawn sharp once it
 * settles. Returns an undo function.
 */
function fitToSoftwareGpu(app, canvas) {
  const renderer = app._renderer;
  const gl = canvas.getContext("webgl2");
  if (!gl || typeof renderer?.renderSplineScene !== "function") return () => {};
  const renderScene = renderer.renderSplineScene;
  const fullRatio = renderer.getPixelRatio();
  let fence = null;
  let fencedAt = 0;
  let deferred = false;
  let settleTimer = 0;

  const releaseFence = () => {
    if (fence && !gl.isContextLost()) gl.deleteSync(fence);
    fence = null;
  };
  const gpuBusy = () => {
    if (!fence) return false;
    const waiting =
      !gl.isContextLost() &&
      performance.now() - fencedAt < GPU_WAIT_LIMIT_MS &&
      gl.getSyncParameter(fence, gl.SYNC_STATUS) !== gl.SIGNALED;
    if (!waiting) releaseFence();
    return waiting;
  };
  const setPixelRatio = (ratio) => {
    if (renderer.getPixelRatio() === ratio) return;
    renderer.setPixelRatio(ratio);
    // The renderer only reallocates its buffers when its size changes, so force that at this size.
    const { viewportWidth, viewportHeight } = renderer;
    renderer.viewportWidth = 0;
    renderer.setSize(viewportWidth, viewportHeight, false);
  };
  const requestPass = () => {
    if (!app.disposed) app._requestRenderAutoMode();
  };

  renderer.renderSplineScene = function renderWhenGpuIsFree(scene, camera, ...rest) {
    // Only the frame loop's own draws are paced, not internal captures such as scene transitions.
    if (scene !== app._scene || camera !== app._camera) return renderScene.call(this, scene, camera, ...rest);
    if (gpuBusy()) {
      deferred = true;
      // Ask for another pass once this one, including its "rendered" listeners, has finished.
      queueMicrotask(requestPass);
      return undefined;
    }
    const animating = deferred || performance.now() - fencedAt < ANIMATING_GAP_MS;
    deferred = false;
    clearTimeout(settleTimer);
    if (animating) settleTimer = setTimeout(requestPass, SETTLE_MS);
    // Resizing clears the canvas, so it only happens right before a draw.
    setPixelRatio(animating ? fullRatio * MOTION_RESOLUTION : fullRatio);

    const result = renderScene.call(this, scene, camera, ...rest);
    fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    fencedAt = performance.now();
    gl.flush();
    return result;
  };
  return () => {
    clearTimeout(settleTimer);
    renderer.renderSplineScene = renderScene;
    releaseFence();
    setPixelRatio(fullRatio);
  };
}

/**
 * Renders a Spline scene with the runtime directly. The runtime and the scene are downloaded in
 * parallel, failures are reported through `onError` instead of crashing the page, and the WebGL
 * context is released on unmount. The scene's shaders are compiled in the background before its
 * first frame, and `onLoad(app)` runs just before that frame is drawn. With `renderOnDemand` the
 * scene is only redrawn when something changes; use it for scenes without continuous animation.
 * Without a GPU, frames are also paced to the rasteriser so the rest of the page stays responsive.
 */
export default function SplineScene({ scene, onLoad, onError, renderOnDemand = false, ...containerProps }) {
  const canvasRef = useRef(null);
  const handleLoad = useEffectEvent((app) => onLoad?.(app));
  const handleError = useEffectEvent((error) => onError?.(error));

  useEffect(() => {
    const canvas = canvasRef.current;
    const controller = new AbortController();
    let app = null;
    let restoreRendering = null;
    let cancelled = false;

    (async () => {
      try {
        const [{ Application }, buffer] = await Promise.all([
          import("@splinetool/runtime"),
          fetchScene(scene, controller.signal),
        ]);
        if (cancelled) return;
        app = new Application(canvas, { renderer: "webgl", wasmPath });
        const releaseFrames = holdFrames(app);
        const unmute = muteSceneUpgradeNotice();
        try {
          await app.start(buffer);
        } finally {
          unmute();
        }
        if (cancelled) return;
        await compileShaders(app);
        if (cancelled) return;
        const restoreOnDemand = renderOnDemand ? renderOnlyOnChange(app, canvas) : null;
        const restorePacing = isLowPowerDevice() ? fitToSoftwareGpu(app, canvas) : null;
        restoreRendering = () => {
          restorePacing?.();
          restoreOnDemand?.();
        };
        handleLoad(app);
        releaseFrames();
      } catch (error) {
        if (!cancelled) handleError(error);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      restoreRendering?.();
      app?.dispose();
    };
  }, [scene, renderOnDemand]);

  return (
    <div {...containerProps}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
