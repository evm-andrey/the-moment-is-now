import { useEffect, useRef, useState } from "react";

import { perfMark, perfMeasure } from "@/perf";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  onComplete?: () => void;
  motionEnabled?: boolean;
  hydrated?: boolean;
}

function getTimeLeft(targetDate: Date): TimeLeft {
  const difference = targetDate.getTime() - Date.now();

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    total: difference,
  };
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

const CountdownTimer = ({ targetDate, onComplete, motionEnabled = true, hydrated = true }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(targetDate));
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isSecondsTicking, setIsSecondsTicking] = useState(false);
  const hasMarkedFirstTickRef = useRef(false);

  useEffect(() => {
    perfMark("timer:mounted");
    perfMeasure("app:to-timer-mounted", "app:start", "timer:mounted");
    perfMeasure("nav:to-timer-mounted", "nav:start", "timer:mounted");
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      perfMark("timer:first-frame");
      perfMeasure("app:to-timer-first-frame", "app:start", "timer:first-frame");
      perfMeasure("nav:to-timer-first-frame", "nav:start", "timer:first-frame");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let tickTimeout: number | undefined;
    const timer = setInterval(() => {
      const newTimeLeft = getTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      if (!hasMarkedFirstTickRef.current) {
        hasMarkedFirstTickRef.current = true;
        perfMark("timer:first-tick");
        perfMeasure("app:to-timer-first-tick", "app:start", "timer:first-tick");
      }

      setIsSecondsTicking(true);
      tickTimeout = window.setTimeout(() => setIsSecondsTicking(false), 100);

      if (newTimeLeft.total <= 0 && !hasCompleted) {
        setHasCompleted(true);
        perfMark("timer:complete");
        perfMeasure("app:to-timer-complete", "app:start", "timer:complete");
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (tickTimeout) window.clearTimeout(tickTimeout);
    };
  }, [hydrated, targetDate, hasCompleted, onComplete]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
        <TimerBlock value="--" label="дней" motionEnabled={false} />
        <Separator motionEnabled={false} />
        <TimerBlock value="--" label="часов" motionEnabled={false} />
        <Separator motionEnabled={false} />
        <TimerBlock value="--" label="минут" motionEnabled={false} />
        <Separator motionEnabled={false} />
        <TimerBlock value="--" label="секунд" motionEnabled={false} />
      </div>
    );
  }

  if (hasCompleted) {
    return (
      <div className={`flex flex-col items-center gap-6 ${motionEnabled ? "animate-fade-in-up" : ""}`}>
        <div className={`timer-digit text-6xl sm:text-8xl md:text-9xl ${motionEnabled ? "animate-breathe" : ""}`}>
          00:00:00
        </div>
      </div>
    );
  }

  const showDays = timeLeft.days > 0 || timeLeft.total > 24 * 60 * 60 * 1000;

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
      {showDays && (
        <>
          <TimerBlock value={timeLeft.days.toString()} label="дней" motionEnabled={motionEnabled} />
          <Separator motionEnabled={motionEnabled} />
        </>
      )}
      <TimerBlock value={pad2(timeLeft.hours)} label="часов" motionEnabled={motionEnabled} />
      <Separator motionEnabled={motionEnabled} />
      <TimerBlock value={pad2(timeLeft.minutes)} label="минут" motionEnabled={motionEnabled} />
      <Separator motionEnabled={motionEnabled} />
      <TimerBlock value={pad2(timeLeft.seconds)} label="секунд" isTicking={isSecondsTicking} motionEnabled={motionEnabled} />
    </div>
  );
};

interface TimerBlockProps {
  value: string;
  label: string;
  isTicking?: boolean;
  motionEnabled: boolean;
}

const TimerBlock = ({ value, label, isTicking, motionEnabled }: TimerBlockProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`timer-digit text-5xl sm:text-7xl md:text-8xl lg:text-9xl ${motionEnabled ? "transition-transform duration-150" : ""} ${
          motionEnabled && isTicking ? "scale-110" : "scale-100"
        }`}
      >
        {value}
      </div>
      <span className="status-text mt-3 text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] font-medium">
        {label}
      </span>
    </div>
  );
};

const Separator = ({ motionEnabled }: { motionEnabled: boolean }) => {
  return (
    <span className={`timer-separator text-4xl sm:text-6xl md:text-7xl lg:text-8xl self-start mt-1 sm:mt-2 md:mt-3 ${motionEnabled ? "animate-pulse-subtle" : ""}`}>
      :
    </span>
  );
};

export default CountdownTimer;
