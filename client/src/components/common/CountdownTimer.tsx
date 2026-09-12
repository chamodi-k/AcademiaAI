import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string;
  label?: string;
  badgeOnly?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  label,
  badgeOnly = false
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.isPast) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
        Concluded
      </span>
    );
  }

  // Urgency colors:
  // <= 3 days: Red/Rose
  // <= 7 days: Amber
  // > 7 days: Indigo/Emerald
  const isUrgent = timeLeft.days <= 3;
  const isWarning = timeLeft.days <= 7;

  if (badgeOnly) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-tight ${
          isUrgent
            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/80 animate-pulse'
            : isWarning
            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/80'
            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days} days remaining` : `${timeLeft.hours}h ${timeLeft.minutes}m left`}
        </span>
      </span>
    );
  }

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border ${
        isUrgent
          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200'
          : isWarning
          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200'
          : 'bg-brand-50/70 dark:bg-brand-950/30 border-brand-200 dark:border-brand-900/50 text-brand-900 dark:text-brand-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock size={16} className={isUrgent ? 'text-rose-500 animate-bounce' : 'text-current'} />
        {label && <span className="font-semibold text-xs">{label}</span>}
      </div>
      <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
        <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs">
          {timeLeft.days}d
        </div>
        <span>:</span>
        <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs">
          {String(timeLeft.hours).padStart(2, '0')}h
        </div>
        <span>:</span>
        <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs">
          {String(timeLeft.minutes).padStart(2, '0')}m
        </div>
        <span>:</span>
        <div className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs">
          {String(timeLeft.seconds).padStart(2, '0')}s
        </div>
      </div>
    </div>
  );
};
