import { useState, useEffect } from 'react';
import CountdownTimer from '@/components/CountdownTimer';
import VanGoghBackground from '@/components/VanGoghBackground';

const Index = () => {
  // Target date: January 1, 2026, 00:00:00
  const targetDate = new Date('2026-01-01T00:00:00');
  
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        <VanGoghBackground />
        <div className="timer-digit text-6xl sm:text-8xl md:text-9xl opacity-20">
          --:--:--
        </div>
      </div>
    );
  }

  return (
    <>
      <VanGoghBackground />
      
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
          <div 
            className="animate-fade-in-up" 
            style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}
          >
            <CountdownTimer 
              targetDate={targetDate} 
              onComplete={handleComplete}
            />
          </div>

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
