import React, { useState, useEffect } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

interface TenureTypeFilterProps {
  isCollapsed?: boolean;
  onChange: (value: string, checked: boolean) => void;
  resetKey?: number; // Add resetKey prop
}

const TenureTypeFilter: React.FC<TenureTypeFilterProps> = ({
  isCollapsed = true,
  onChange,
  resetKey = 0, // Default value if not provided
}) => {
  const [isCollapsedState, setIsCollapsedState] = useState(isCollapsed);
  const [checkedStates, setCheckedStates] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleVisibility = () => setIsCollapsedState(!isCollapsedState);

  const tenureTypes = ["House", "Flat", "Bungalow", "Maisonette", "Park home"];

  // Reset the checkboxes when resetKey changes
  useEffect(() => {
    const initialStates = tenureTypes.reduce((acc, type) => {
      acc[
        type.toUpperCase().replace("-", "_").replace("(", "").replace(")", "")
      ] = false;
      return acc;
    }, {} as { [key: string]: boolean });
    setCheckedStates(initialStates);
  }, [resetKey]);

  const handleCheckboxChange = (type: string, checked: boolean) => {
    setCheckedStates((prev) => ({
      ...prev,
      [type]: checked,
    }));
    onChange(type, checked);
  };

  return (
    <div className="px-16 w-full relative md:px-12">
      <div className="font-bold text-sm text-black w-full flex flex-row justify-between pb-2 pt-6">
        <h4>Home Type</h4>
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
                name="homeType"
                value={type
                  .toUpperCase()
                  .replace("-", "_")
                  .replace("(", "")
                  .replace(")", "")}
                className="mr-2 mb-1"
                checked={
                  checkedStates[
                    type
                      .toUpperCase()
                      .replace("-", "_")
                      .replace("(", "")
                      .replace(")", "")
                  ] || false
                } // Set the checkbox state
                onChange={(e) =>
                  handleCheckboxChange(e.target.value, e.target.checked)
                }
              />
              <label htmlFor={type} className="text-black">
                {type}
              </label>
            </div>
          ))}
        </div>
      )}
      <div className="relative w-full border-b-2 border-grey-200  h-2 mt-2"></div>
    </div>
  );
};

export default TenureTypeFilter;
