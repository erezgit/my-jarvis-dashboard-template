import * as React from "react";

interface SliderProps {
  value: number[];
  max?: number;
  min?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

/**
 * Simple range-input slider styled with Tailwind.
 * API-compatible with Radix UI Slider for audio player use.
 */
export function Slider({ value, max = 100, min = 0, step = 1, onValueChange, className = "" }: SliderProps) {
  const current = value[0] ?? 0;
  const pct = max > 0 ? (current / max) * 100 : 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    onValueChange?.([v]);
  };

  return (
    <div className={`relative flex items-center ${className}`} style={{ height: 20 }}>
      {/* Track fill */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="relative w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-200 to-violet-200 rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {/* Native range — transparent but interactive */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={handleChange}
        className="w-full h-1.5 cursor-pointer opacity-0 absolute inset-0"
        style={{ margin: 0 }}
      />
    </div>
  );
}
