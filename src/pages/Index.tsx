import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';

const Index = () => {
  // Target date: Set to a future date (adjust as needed)
  // Example: January 1, 2026, 00:00:00
  const targetDate = new Date('2026-01-01T00:00:00');
  
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if already complete on mount
    if (new Date() >= targetDate) {
      setIsComplete(true);
    }
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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="timer-digit text-6xl sm:text-8xl md:text-9xl opacity-20">
          --:--:--
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-background transition-colors duration-800">
      {/* Main content */}
      <div className="flex flex-col items-center gap-8 sm:gap-12 md:gap-16 max-w-5xl mx-auto">
        {/* Status text - before timer */}
        <div className={`text-center transition-all duration-800 ${isComplete ? 'opacity-0 h-0' : 'opacity-100'}`}>
          <p className="status-text text-sm sm:text-base md:text-lg tracking-widest uppercase font-medium">
            До момента, когда будет можно
          </p>
        </div>

        {/* Timer */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CountdownTimer 
            targetDate={targetDate} 
            onComplete={handleComplete}
          />
        </div>

        {/* Status messages */}
        <div className="text-center h-24 flex items-center justify-center">
          {isComplete ? (
            <div className="animate-fade-in-up">
              <h1 className="timer-digit text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4">
                Уже можно
              </h1>
              <p className="status-text text-base sm:text-lg md:text-xl tracking-wide">
                Момент настал
              </p>
            </div>
          ) : (
            <p className="status-text text-sm sm:text-base tracking-wide animate-pulse-subtle">
              Ожидание продолжается...
            </p>
          )}
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center">
        <p className="status-text text-xs opacity-50 tracking-widest uppercase">
          uzhemozhno.ru
        </p>
      </footer>
    </main>
  );
};

export default Index;
