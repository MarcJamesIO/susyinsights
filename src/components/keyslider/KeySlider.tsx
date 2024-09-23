import React from "react";
import "./keyslider.css";

interface KeySliderProps {
  value: number;
  text: string;
  min?: number;
  max?: number;
}

const KeySlider: React.FC<KeySliderProps> = ({
  value,
  text,
  min = 0,
  max = 10,
}) => {
  const step = (max - min) / 10;

  return (
    <div className="w-9/12 mt-6 z-2 border-gray-200 border-2 p-4 px-8 bg-white">
      <div className="w-full text-black flex justify-between text-sm mb-2">
        <p>No match</p>
        <p>{text}</p>
        <p>10+</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={() => {}}
        className="slider w-full h-2 rounded-lg appearance-none cursor-pointer pointer-events-none"
      />
      <div className="flex gap-2">
        <div className="bg-gray-300 h-6 w-1/6"></div>
        <div className="bg-yellow-100 h-6 w-1/6"></div>
        <div className="bg-orange-100 h-6 w-1/6"></div>
        <div className="bg-orange-300 h-6 w-1/6"></div>
        <div className="bg-rose-300 h-6 w-1/6"></div>
        <div className="bg-red-400 h-6 w-1/6"></div>
      </div>
    </div>
  );
};

export default KeySlider;
