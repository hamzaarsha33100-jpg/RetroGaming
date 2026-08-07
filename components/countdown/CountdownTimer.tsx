"use client";

import { useState, useEffect, useMemo } from "react";

interface CountdownTimerProps {
  target: Date | string;
  variant?: "default" | "compact" | "large";
  labels?: boolean;
}

function calculate(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({
  target,
  variant = "default",
  labels = true,
}: CountdownTimerProps) {
  const targetDate = useMemo(
    () => (target instanceof Date ? target : new Date(target)),
    [target]
  );
  const [timeLeft, setTimeLeft] = useState(() => calculate(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculate(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const blocks = [
    { value: timeLeft.days, label: "DAYS" },
    { value: timeLeft.hours, label: "HRS" },
    { value: timeLeft.minutes, label: "MIN" },
    { value: timeLeft.seconds, label: "SEC" },
  ];

  const sizes =
    variant === "large"
      ? "min-w-[64px] px-3 py-3 text-2xl"
      : variant === "compact"
        ? "min-w-[38px] px-2 py-1.5 text-sm"
        : "min-w-[52px] px-3 py-2 text-xl";

  const textSizes = variant === "compact" ? "text-[9px]" : "text-[10px]";

  return (
    <div className="flex items-center gap-1.5">
      {blocks.map(({ value, label }, i) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="bg-gaming-dark border border-neon-pink/25 rounded-xl text-center backdrop-blur-sm">
            <span className={`block font-gaming font-bold text-neon-pink tabular-nums leading-none ${sizes}`}>
              {String(value).padStart(2, "0")}
            </span>
            {labels && (
              <span className={`text-gaming-textMuted font-medium tracking-wider uppercase mt-0.5 block ${textSizes}`}>
                {label}
              </span>
            )}
          </div>
          {i < 3 && (
            <span className="text-neon-pink/60 text-lg font-bold animate-pulse">
              {i === 0 ? ":" : ":"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
