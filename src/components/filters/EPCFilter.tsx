import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MultiRangeSlider from "../sliders/MultiRangeSlider";
import { Range } from "../../types/types";

interface EPCFilterProps {
  isCollapsed?: boolean;
  onRangeChange: (range: Range) => void;
  resetKey: number; // New prop to handle reset
}

const EPCFilter: React.FC<EPCFilterProps> = ({
  isCollapsed = true,
  onRangeChange,
  resetKey,
}) => {
  const [isEPCCollapsed, setIsEPCCollapsed] = useState(isCollapsed);

  const toggleVisibility = () => setIsEPCCollapsed(!isEPCCollapsed);

  const displayValue = (value: number) => {
    const letters = ["A", "B", "C", "D", "E", "F", "G"];
    return `${letters[value - 1]}`;
  };

  return (
    <div className="px-16 w-full relative md:px-12">
      <div className="font-bold text-sm text-black w-full flex flex-row justify-between pb-4 pt-6">
        <h4>EPC</h4>
        {isEPCCollapsed ? (
          <FaChevronDown onClick={toggleVisibility} />
        ) : (
          <FaChevronUp onClick={toggleVisibility} />
        )}
      </div>
      {!isEPCCollapsed && (
        <div className="h-16">
          <MultiRangeSlider
            displayValue={displayValue}
            min={1}
            max={7}
            onCommit={onRangeChange}
            resetKey={resetKey} // Pass resetKey to MultiRangeSlider
          />
        </div>
      )}
      <div className="relative w-full border-b-2 border-grey-200 k h-2"></div>
    </div>
  );
};

export default EPCFilter;
