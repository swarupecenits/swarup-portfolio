// WebGL renderers that run on the CPU: SwiftShader, Mesa's llvmpipe/softpipe and Windows' WARP
// ("Microsoft Basic Render Driver"), common in virtual machines and remote desktops.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|\bwarp\b/i;
const MASKED_RENDERER = /^(webkit webgl|mozilla)?$/i;

let lowPower;

function readRenderer() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    if (!gl) return null;
    let renderer = String(gl.getParameter(gl.RENDERER) ?? "");
    if (MASKED_RENDERER.test(renderer.trim())) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      if (info) renderer = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) ?? "");
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return renderer;
  } catch {
    return null;
  }
}

/**
 * True when there is no GPU to draw with: WebGL is missing or runs on a software renderer.
 * Heavy effects are toned down then so scrolling stays smooth. `?perf=low` / `?perf=high` in
 * the URL overrides the detection. The result is cached.
 */
export function isLowPowerDevice() {
  if (lowPower === undefined) {
    if (typeof window === "undefined") return false;
    const override = new URLSearchParams(window.location.search).get("perf");
    if (override === "low" || override === "high") lowPower = override === "low";
    else {
      const renderer = readRenderer();
      lowPower = renderer === null || SOFTWARE_RENDERER.test(renderer);
    }
  }
  return lowPower;
}
