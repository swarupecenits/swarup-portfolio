import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Loader from "./Loader";

export default function Preloader({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingPercent, setLoadingPercent] = useState(0);
  const loadingTween = useRef();
  const loadingPercentRef = useRef({ value: 0 });

  const LOADING_TIME = 2.5;

  useEffect(() => {
    loadingTween.current = gsap.to(loadingPercentRef.current, {
      value: 100,
      duration: LOADING_TIME,
      // ease: "slow(0.7,0.7,false)", // may need CostumEase or just use power2
      ease: "power2.inOut",
      onUpdate: () => {
        setLoadingPercent(loadingPercentRef.current.value);
      },
      onComplete: () => {
        setIsLoading(false);
      },
    });
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <Loader loadingPercent={loadingPercent} />}
      </AnimatePresence>
      {/* We can choose to mount children only after loading, or keep them mounted behind. 
          The original kept them mounted behind. The old App.js conditionally mounted them.
          Let's just conditionally mount to avoid performance issues during loading, 
          but if we do, the exit animation of the Loader needs children to be mounted to look good. 
          Let's mount them always, the loader has z-index. */}
      {children}
    </>
  );
}
