import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  threshold?: number; // e.g., 80
  label?: string;
  showValueText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Optional custom hex or Tailwind color
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  threshold,
  label,
  showValueText = true,
  size = 'md',
  color
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  }[size];

  // Determine color based on threshold if provided
  let barColorClass = 'bg-brand-500';
  if (threshold !== undefined) {
    if (clamped >= threshold) {
      barColorClass = 'bg-emerald-500';
    } else if (clamped >= threshold - 5) {
      barColorClass = 'bg-amber-500';
    } else {
      barColorClass = 'bg-rose-500';
    }
  }

  return (
    <div className="w-full">
      {(label || showValueText) && (
        <div className="flex justify-between items-center mb-1 text-xs">
          {label && <span className="font-semibold text-slate-700 dark:text-slate-300">{label}</span>}
          {showValueText && (
            <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
              {clamped}% {threshold && <span className="text-slate-400 font-normal">({threshold}% min)</span>}
            </span>
          )}
        </div>
      )}

      <div className={`relative w-full ${heightClass} bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden`}>
        {/* Progress Fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${!color ? barColorClass : ''}`}
          style={{
            width: `${clamped}%`,
            ...(color ? { backgroundColor: color } : {})
          }}
        />

        {/* Threshold indicator needle */}
        {threshold !== undefined && threshold > 0 && threshold < 100 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-700 dark:bg-slate-300 z-10 opacity-70"
            style={{ left: `${threshold}%` }}
            title={`Required rule: ${threshold}%`}
          />
        )}
      </div>
    </div>
  );
};
