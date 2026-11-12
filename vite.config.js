import { readdirSync, readFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves 404.html for unknown paths, so mirror index.html to keep client-side routing working there.
function spaFallbackPage() {
  return {
    name: "spa-fallback-page",
    apply: "build",
    enforce: "post",
    async writeBundle(options, bundle) {
      if (!bundle["index.html"]) return;
      await copyFile(join(options.dir, "index.html"), join(options.dir, "404.html"));
    },
  };
}

// The Spline runtime fetches its WebAssembly helpers from unpkg/cdn.spline.design by default.
// Serving them from this origin (under a versioned, immutable path) avoids two extra
// third-party connections and keeps the 3D scenes working if those CDNs are unavailable.
function splineWasm() {
  const virtualId = "virtual:spline-wasm";
  const runtimeDir = fileURLToPath(new URL("./node_modules/@splinetool/runtime/", import.meta.url));
  const buildDir = join(runtimeDir, "build");
  const { version } = JSON.parse(readFileSync(join(runtimeDir, "package.json"), "utf8"));
  const basePath = `/static/spline/${version}`;
  const files = readdirSync(buildDir).filter((file) => file.endsWith(".wasm"));
  const wasmFallbackRE = /new URL\(\s*(['"])([\w-]+\.wasm)\1\s*,\s*import\.meta\.url\s*\)/g;

  return {
    name: "spline-wasm",
    resolveId: (id) => (id === virtualId ? `\0${virtualId}` : undefined),
    load: (id) => (id === `\0${virtualId}` ? `export const wasmPath = ${JSON.stringify(basePath)};` : undefined),
    // The glue modules only fall back to `new URL("x.wasm", import.meta.url)` when no binary is passed in, but
    // that pattern makes Vite emit hashed duplicates. The runtime always passes the bytes it fetched from
    // `wasmPath`, so point the fallback at the self-hosted copy instead of bundling a second one.
    transform: {
      filter: { id: /[\\/]@splinetool[\\/]runtime[\\/]build[\\/][^\\/]+\.js$/, code: "import.meta.url" },
      handler(code) {
        const result = code.replace(wasmFallbackRE, (match, _quote, file) =>
          files.includes(file) ? `new URL(/* @vite-ignore */ ${JSON.stringify(`${basePath}/${file}`)}, import.meta.url)` : match,
        );
        return result === code ? null : { code: result, map: null };
      },
    },
    configureServer(server) {
      server.middlewares.use(basePath, (req, res, next) => {
        const file = decodeURIComponent(req.url.split("?")[0].slice(1));
        if (!files.includes(file)) return next();
        res.setHeader("Content-Type", "application/wasm");
        res.end(readFileSync(join(buildDir, file)));
      });
    },
    generateBundle() {
      for (const file of files) {
        this.emitFile({ type: "asset", fileName: `${basePath.slice(1)}/${file}`, source: readFileSync(join(buildDir, file)) });
      }
    },
  };
}

const vendorGroup = (name, packages, priority) => ({
  name,
  priority,
  test: new RegExp(`[\\\\/]node_modules[\\\\/](${packages.join("|")})[\\\\/]`),
});

export default defineConfig({
  plugins: [react(), splineWasm(), spaFallbackPage()],
  server: {
    port: 3000,
  },
  build: {
    outDir: "build",
    // Hashed bundles live under /static so they can be cached immutably without touching /public/assets.
    assetsDir: "static",
    // The Spline runtime and three.js are inherently large but are only fetched lazily.
    chunkSizeWarningLimit: 2600,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            vendorGroup("react-vendor", ["react", "react-dom", "scheduler", "react-router", "styled-components", "@emotion/is-prop-valid", "stylis"], 40),
            vendorGroup("motion", ["framer-motion", "motion-dom", "motion-utils"], 30),
            vendorGroup("gsap", ["gsap", "lenis"], 30),
          ],
        },
      },
    },
  },
});
