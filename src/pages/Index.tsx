import { lazy, Suspense, useEffect, useState } from "react";

import CountdownTimer from "@/components/CountdownTimer";
import { perfMark, perfMeasure } from "@/perf";

const loadVanGoghBackground = () => import("@/components/VanGoghBackground");
const VanGoghBackground = lazy(loadVanGoghBackground);

const TARGET_DATE = new Date("2026-01-01T00:00:00");
const TARGET_TS = TARGET_DATE.getTime();

const Index = () => {
  const [isComplete, setIsComplete] = useState(() => Date.now() >= TARGET_TS);
  const [showBackground, setShowBackground] = useState(false);
  const [motionEnabled, setMotionEnabled] = useState(false);

  useEffect(() => {
    perfMark("index:mounted");
    perfMeasure("app:to-index-mounted", "app:start", "index:mounted");
    perfMeasure("nav:to-index-mounted", "nav:start", "index:mounted");
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.add("glow-enabled");
      perfMark("ui:glow-enabled");
      perfMeasure("app:to-glow-enabled", "app:start", "ui:glow-enabled");
      perfMeasure("nav:to-glow-enabled", "nav:start", "ui:glow-enabled");

      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
      if (!prefersReducedMotion) {
        setMotionEnabled(true);
        perfMark("ui:motion-enabled");
      }
    });
    return () => {
      cancelAnimationFrame(id);
      document.documentElement.classList.remove("glow-enabled");
    };
  }, []);

  useEffect(() => {
    const schedule = () => {
      perfMark("bg:show-request");
      setShowBackground(true);
      perfMeasure("app:to-bg-request", "app:start", "bg:show-request");
    };

    if (window.requestIdleCallback) {
      const id = window.requestIdleCallback(schedule, { timeout: 5000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const timeoutId = window.setTimeout(schedule, 2000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (isComplete) {
      document.documentElement.classList.add("success-state");
    } else {
      document.documentElement.classList.remove("success-state");
    }
    return () => {
      document.documentElement.classList.remove("success-state");
    };
  }, [isComplete]);

  const handleComplete = () => {
    setIsComplete(true);
  };

  return (
    <>
      {showBackground && (
        <Suspense fallback={null}>
          <VanGoghBackground />
        </Suspense>
      )}
      
      <main className="relative z-10 min-h-[100svh] px-4 py-6 sm:py-8">
        <div className="mx-auto flex min-h-[100svh] max-w-6xl flex-col items-center">
          <div className="flex flex-1 flex-col items-center justify-center gap-10 sm:gap-14 md:gap-20">

          <div
            className={`text-center transition-all duration-1000 ${isComplete ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
          >
            <p className="status-text text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase font-medium">
              До момента, когда будет можно
            </p>
          </div>

          <CountdownTimer motionEnabled={motionEnabled} targetDate={TARGET_DATE} onComplete={handleComplete} />

          <div className="flex h-24 items-center justify-center text-center sm:h-28">
            {isComplete ? (
              <div className={motionEnabled ? "animate-fade-in-up" : undefined}>
                <h1 className={`timer-digit text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 ${motionEnabled ? "animate-breathe" : ""}`}>
                  Уже можно
                </h1>
                <p className="status-text text-sm sm:text-base md:text-lg tracking-[0.15em]">
                  Момент настал
                </p>
              </div>
            ) : (
              <p className={`status-text text-xs sm:text-sm tracking-[0.15em] ${motionEnabled ? "animate-pulse-subtle" : ""}`}>
                Ожидание продолжается...
              </p>
            )}
          </div>
          </div>

          <footer className="content-visibility-auto pb-[env(safe-area-inset-bottom)] pt-6 text-center">
            <p className="status-text text-[10px] sm:text-xs opacity-40 tracking-[0.3em] uppercase">
              uzhemozhno.ru
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Index;
