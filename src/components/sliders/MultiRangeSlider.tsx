import React, { useEffect, useState, useRef } from "react";
import "./multirangeslider.css";

interface MultiRangeSliderProps {
  min: number;
  max: number;
  onCommit?: (values: { min: number; max: number }) => void;
  displayValue: (value: number) => string; // Assuming displayValue returns a string for display
  resetKey?: number; // New prop to handle reset
  ifSnap?: boolean; // New prop to enable snapping
  snapInterval?: number; // Interval value for snapping
}

const MultiRangeSlider: React.FC<MultiRangeSliderProps> = ({
  min,
  max,
  onCommit,
  displayValue,
  resetKey = 0, // Default value if not provided
  ifSnap = false, // Default to no snapping
  snapInterval = 1, // Default snapping interval
}) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const range = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const minPercent = ((minVal - min) / (max - min)) * 100;
    const maxPercent = ((maxVal - min) / (max - min)) * 100;
    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, min, max]);

  // Reset slider values when resetKey changes
  useEffect(() => {
    setMinVal(min);
    setMaxVal(max);
  }, [resetKey, min, max]);

  const commitValues = () => {
    if (onCommit) {
      onCommit({ min: minVal, max: maxVal });
    }
  };

  const snapValue = (value: number) => {
    if (!ifSnap) return value;
    const remainder = value % snapInterval;
    if (remainder === 0) return value;
    return remainder < snapInterval / 2
      ? value - remainder
      : value + snapInterval - remainder;
  };

  const handleMinChange = (value: number) => {
    const newVal = snapValue(Math.min(value, maxVal));
    setMinVal(newVal);
  };

  const handleMaxChange = (value: number) => {
    const newVal = snapValue(Math.max(value, minVal));
    setMaxVal(newVal);
  };

  return (
    <div className="w-full relative">
      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
        <div className="slider__left-value">{displayValue(minVal)}</div>
        <div className="slider__right-value">{displayValue(maxVal)}</div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        className="thumb thumb--left"
        onChange={(e) => handleMinChange(e.target.valueAsNumber)}
        onMouseUp={commitValues} // Commit on mouse up
        onTouchEnd={commitValues} // Commit on touch end
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        className="thumb thumb--right"
        onChange={(e) => handleMaxChange(e.target.valueAsNumber)}
        onMouseUp={commitValues} // Commit on mouse up
        onTouchEnd={commitValues} // Commit on touch end
      />
    </div>
  );
};

export default MultiRangeSlider;
