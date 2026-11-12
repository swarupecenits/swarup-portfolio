import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router";
import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import ScrollProgress from "./components/ui/ScrollProgress";
import RadialMenu from "./components/ui/RadialMenu";
import EasterEggs from "./components/EasterEggs";
import { useSpotlight } from "./hooks/useSpotlight";
import Home from "./pages/Home";
import "./App.css";

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  useSpotlight();

  return (
    // Small UI motion (fades, hovers, short reveals) runs for everyone. Large or looping motion
    // (parallax, the keyboard's spin, marquees, pulses) checks prefers-reduced-motion itself.
    <MotionConfig reducedMotion="never">
      <BrowserRouter>
        <SmoothScroll>
          <Preloader>
            <a className="skip-link" href="#main">
              Skip to content
            </a>
            <ScrollProgress />
            <EasterEggs />
            <RadialMenu />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="*"
                element={
                  <Suspense fallback={null}>
                    <NotFoundPage />
                  </Suspense>
                }
              />
            </Routes>
          </Preloader>
        </SmoothScroll>
      </BrowserRouter>
    </MotionConfig>
  );
}
