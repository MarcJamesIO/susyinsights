// IMDFilter.tsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MultiRangeSlider from "../sliders/MultiRangeSlider";
import { Range } from "../../types/types";

interface IMDFilterProps {
  isCollapsed?: boolean;
  onRangeChange: (range: Range) => void;
  resetKey: number; // New prop to handle reset
}

const IMDFilter: React.FC<IMDFilterProps> = ({
  isCollapsed = true,
  onRangeChange,
  resetKey,
}) => {
  const [isIMDCollapsed, setIsIMDCollapsed] = useState(isCollapsed);

  const toggleVisibility = () => setIsIMDCollapsed(!isIMDCollapsed);

  return (
    <div className="px-16 w-full relative md:px-12">
      <div className="font-bold text-sm text-black w-full flex flex-row justify-between pb-4 pt-6">
        <h4>IMD</h4>
        {isIMDCollapsed ? (
          <FaChevronDown onClick={toggleVisibility} />
        ) : (
          <FaChevronUp onClick={toggleVisibility} />
        )}
      </div>
      {!isIMDCollapsed && (
        <div className="h-16">
          <MultiRangeSlider
            displayValue={(value: number) => `IMD ${value}`}
            min={1}
            max={10}
            onCommit={onRangeChange}
            resetKey={resetKey} // Pass resetKey to
          />
        </div>
      )}
      <div className="relative w-full border-b-2 border-grey-200  h-2"></div>
    </div>
  );
};

export default IMDFilter;
