// TenureTypeFilter.tsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface TenureTypeFilterProps {
  isCollapsed?: boolean;
  onChange: (value: string, checked: boolean) => void;
}

const TenureTypeFilter: React.FC<TenureTypeFilterProps> = ({
  isCollapsed = true,
  onChange,
}) => {
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed);

  const toggleVisibility = () => setIsCollapsedState(!isCollapsedState);

  const tenureTypes = ["Owner-Occupied", "Rented (Social)", "Rented (Private)"];

  return (
    <div className="p-4 px-16 w-full relative md:px-12">
      <div className="font-bold text-sm mb-4 text-black w-full flex flex-row justify-between pb-2">
        <h4>Tenure Type</h4>
        {isCollapsedState ? (
          <FaChevronDown onClick={toggleVisibility} />
        ) : (
          <FaChevronUp onClick={toggleVisibility} />
        )}
      </div>
      {!isCollapsedState && (
        <div className="flex flex-col py-2">
          {tenureTypes.map((type) => (
            <div className="flex-row mb-2" key={type}>
              <input
                type="checkbox"
                id={type}
                name="tenureType"
                value={type
                  .toUpperCase()
                  .replace("-", "_")
                  .replace("(", "")
                  .replace(")", "")}
                className="mr-2 mb-1"
                onChange={(e) => onChange(e.target.value, e.target.checked)}
              />
              <label htmlFor={type} className="text-black">
                {type}
              </label>
            </div>
          ))}
        </div>
      )}
      <div className="relative w-full border-b-2 border-black h-2 mt-2"></div>
    </div>
  );
};

export default TenureTypeFilter;
