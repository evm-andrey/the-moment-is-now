import { Suspense, lazy, useEffect, useState } from "react";
import CountdownTimer from '@/components/CountdownTimer';

const loadVanGoghBackground = () => import("@/components/VanGoghBackground");
const VanGoghBackground = lazy(loadVanGoghBackground);

const targetDate = new Date("2026-01-01T00:00:00");

const Index = () => {
  const [isComplete, setIsComplete] = useState(() => Date.now() >= targetDate.getTime());
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.add("glow-enabled");
    });
    return () => {
      cancelAnimationFrame(id);
      document.documentElement.classList.remove("glow-enabled");
    };
  }, []);

  useEffect(() => {
    const schedule = () => {
      void loadVanGoghBackground();
      setShowBackground(true);
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
      document.documentElement.classList.add('success-state');
    } else {
      document.documentElement.classList.remove('success-state');
    }
    return () => {
      document.documentElement.classList.remove('success-state');
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
      
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="flex flex-col items-center gap-10 sm:gap-14 md:gap-20 max-w-6xl mx-auto">
          
          {/* Status text - before timer */}
          <div 
            className={`text-center transition-all duration-1000 ${
              isComplete ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            <p className="status-text text-xs sm:text-sm md:text-base tracking-[0.25em] uppercase font-medium">
              До момента, когда будет можно
            </p>
          </div>

          {/* Timer */}
          <CountdownTimer targetDate={targetDate} onComplete={handleComplete} />

          {/* Status messages */}
          <div className="text-center h-28 flex items-center justify-center">
            {isComplete ? (
              <div className="animate-fade-in-up">
                <h1 className="timer-digit text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-6 animate-breathe">
                  Уже можно
                </h1>
                <p className="status-text text-sm sm:text-base md:text-lg tracking-[0.15em]">
                  Момент настал
                </p>
              </div>
            ) : (
              <p 
                className="status-text text-xs sm:text-sm tracking-[0.15em] animate-pulse-subtle"
                style={{ animationDelay: '0.6s' }}
              >
                Ожидание продолжается...
              </p>
            )}
          </div>
        </div>

        {/* Minimal footer */}
        <footer className="absolute bottom-8 left-0 right-0 text-center">
          <p className="status-text text-[10px] sm:text-xs opacity-40 tracking-[0.3em] uppercase">
            uzhemozhno.ru
          </p>
        </footer>
      </main>
    </>
  );
};

export default Index;
