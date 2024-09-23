// IncomeFilter.tsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import MultiRangeSlider from "../sliders/MultiRangeSlider";

interface IncomeFilterProps {
  isCollapsed?: boolean;
  onRangeChange: (range: { min: number; max: number }) => void;
  resetKey: number; // New prop to handle reset
  ifSnap?: boolean; // New prop to enable snapping
  snapInterval?: number; // Interval value for snapping
}

const IncomeFilter: React.FC<IncomeFilterProps> = ({
  isCollapsed = true,
  onRangeChange,
  resetKey,
}) => {
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed);

  const toggleVisibility = () => setIsCollapsedState(!isCollapsedState);

  return (
    <div className="px-16 w-full relative md:px-12">
      <div className="font-bold text-sm text-black w-full flex flex-row justify-between pb-4 pt-6">
        <h4>Income</h4>
        {isCollapsedState ? (
          <FaChevronDown onClick={toggleVisibility} />
        ) : (
          <FaChevronUp onClick={toggleVisibility} />
        )}
      </div>
      {!isCollapsedState && (
        <div className="h-16">
          <MultiRangeSlider
            displayValue={(value: number) => `£${value.toLocaleString()}`}
            min={0}
            max={100000}
            onCommit={onRangeChange}
            resetKey={resetKey} // Pass resetKey to
            ifSnap={true}
            snapInterval={5000}
          />
        </div>
      )}
      <div className="relative w-full border-b-2 border-grey-200  h-2"></div>
    </div>
  );
};

export default IncomeFilter;
