import { useState, useEffect } from 'react';

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
}

const CountdownTimer = ({ targetDate, onComplete }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateTimeLeft(targetDate));
  const [hasCompleted, setHasCompleted] = useState(false);
  const [tickingDigit, setTickingDigit] = useState<string | null>(null);

  function calculateTimeLeft(target: Date): TimeLeft {
    const now = new Date().getTime();
    const difference = target.getTime() - now;

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

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);
      
      setTickingDigit('seconds');
      setTimeout(() => setTickingDigit(null), 100);

      if (newTimeLeft.total <= 0 && !hasCompleted) {
        setHasCompleted(true);
        onComplete?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, hasCompleted, onComplete]);

  const formatNumber = (num: number, digits: number = 2): string => {
    return num.toString().padStart(digits, '0');
  };

  const showDays = timeLeft.days > 0 || timeLeft.total > 24 * 60 * 60 * 1000;

  if (hasCompleted) {
    return (
      <div className="flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="timer-digit text-6xl sm:text-8xl md:text-9xl animate-success-glow animate-breathe">
          00:00:00
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
      {showDays && (
        <>
          <TimerBlock 
            value={formatNumber(timeLeft.days)} 
            label="дней" 
            isTicking={tickingDigit === 'days'}
          />
          <Separator />
        </>
      )}
      <TimerBlock 
        value={formatNumber(timeLeft.hours)} 
        label="часов" 
        isTicking={tickingDigit === 'hours'}
      />
      <Separator />
      <TimerBlock 
        value={formatNumber(timeLeft.minutes)} 
        label="минут" 
        isTicking={tickingDigit === 'minutes'}
      />
      <Separator />
      <TimerBlock 
        value={formatNumber(timeLeft.seconds)} 
        label="секунд" 
        isTicking={tickingDigit === 'seconds'}
      />
    </div>
  );
};

interface TimerBlockProps {
  value: string;
  label: string;
  isTicking?: boolean;
}

const TimerBlock = ({ value, label, isTicking }: TimerBlockProps) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={`timer-digit text-5xl sm:text-7xl md:text-8xl lg:text-9xl transition-all duration-150 ${
          isTicking ? 'scale-110' : 'scale-100'
        }`}
      >
        {value}
      </div>
      <span className="status-text text-[10px] sm:text-xs md:text-sm mt-3 uppercase tracking-[0.2em] font-medium">
        {label}
      </span>
    </div>
  );
};

const Separator = () => {
  return (
    <span className="timer-separator text-4xl sm:text-6xl md:text-7xl lg:text-8xl self-start mt-1 sm:mt-2 md:mt-3 animate-pulse-subtle">
      :
    </span>
  );
};

export default CountdownTimer;
