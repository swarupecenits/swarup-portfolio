import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/geist/wght.css";
import "@fontsource-variable/geist-mono/wght.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import App from "./App";
import { isLowPowerDevice } from "./utils/gpu";

// Lets CSS drop costly effects (backdrop blur, film grain) when there is no GPU.
document.documentElement.dataset.perf = isLowPowerDevice() ? "low" : "high";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
