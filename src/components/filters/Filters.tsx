import React, { useEffect } from "react";
import EPCFilter from "./EPCFilter";
import CentralHeatingFilter from "./CentralHeatingFilter";
import TenureTypeFilter from "./TenureTypeFilter";
import HomeTypeFilter from "./HomeTypeFilter";
import IncomeFilter from "./IncomeFilter";
import CostToEPCCFilter from "./CostToEPCC";
import IMDFilter from "./IMDFilter";
import { PropertyFilter, Range } from "../../types/types";
import useExploreFilters from "@/hooks/useExploreFilters";
import { useFilterStore } from "@/stores/UseFilterStore";
import { useOACountStore } from "@/stores/UseOACountStore";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface FiltersProps {
  setShowLoading: (value: boolean) => void;
  isAuthenticated: boolean;
  firstLoadCount?: number;
  setFirstLoadCount?: (value: number) => void;
  setLoadingText?: (value: string) => void;
}

const Filters: React.FC<FiltersProps> = ({
  setShowLoading,
  isAuthenticated,
  firstLoadCount = 0,
  setFirstLoadCount,
  setLoadingText,
}) => {
  const { filters, setFilters, fetchProperties } = useExploreFilters();
  const [isMinimised, setIsMinimised] = React.useState(false);
  const [initialFiltersApplied, setInitialFiltersApplied] =
    React.useState(false);
  const [resetKey, setResetKey] = React.useState(0);

  const applyFilters = async (filtersToApply?: PropertyFilter) => {
    const filtersToUse = filtersToApply || filters; // Use passed filters or fallback to current state

    const formattedFilters: PropertyFilter = {
      ...filtersToUse,
      centralHeatingTypeEnums:
        (filtersToUse.centralHeatingTypeEnums ?? []).length > 0
          ? (filtersToUse.centralHeatingTypeEnums ?? []).map((type) =>
              type.toUpperCase().replace(" ", "_")
            )
          : [],
      tenureTypeEnums:
        (filtersToUse.tenureTypeEnums ?? []).length > 0
          ? (filtersToUse.tenureTypeEnums ?? []).map((type) =>
              type
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_")
                .replace("(", "")
                .replace(")", "")
            )
          : [],
      homeTypeEnums:
        (filtersToUse.homeTypeEnums ?? []).length > 0
          ? (filtersToUse.homeTypeEnums ?? []).map((type) =>
              type
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_")
                .replace("(", "")
                .replace(")", "")
            )
          : [],
      buildingTypeEnums:
        (filtersToUse.buildingTypeEnums ?? []).length > 0
          ? (filtersToUse.buildingTypeEnums ?? []).map((type) =>
              type
                .toUpperCase()
                .replace("-", "_")
                .replace(" ", "_")
                .replace("(", "")
                .replace(")", "")
            )
          : [],
    };

    setShowLoading(true);
    if (firstLoadCount > 0)
      setLoadingText && setLoadingText("Fetching SuSy Data...");
    const response = await fetchProperties({ filters: formattedFilters });
    if (response !== undefined && (response as any).data) {
      // Update the filter store state
      useFilterStore.setState({ filters: formattedFilters });

      // Calculate the sum of the total values
      let sum = 0;
      (response as any).data.forEach((item: any) => {
        sum += item.total;
      });

      // Update the OACount store state with both the data and the sum
      useOACountStore.setState({
        OACounts: (response as any).data,
        totalSum: sum,
      });
    }

    console.log("Filters applied", formattedFilters);
  };

  const clearFilters = () => {
    const clearedFilters: PropertyFilter = {
      predictedEligibility: [],
      epcEnums: { min: 1, max: 7 },
      centralHeatingTypeEnums: [],
      homeTypeEnums: [],
      tenureTypeEnums: [],
      buildingTypeEnums: [],
      imd: { min: 1, max: 10 },
      incomeLess: undefined,
      incomeMore: undefined,
      costToEPCCmin: undefined,
      costToEPCCmax: undefined,
    };

    setFilters(clearedFilters); // Update the local state
    useFilterStore.setState({ filters: clearedFilters }); // Update the store state
    setResetKey((prev) => prev + 1); // Increment resetKey to reset UI elements

    // Ensure applyFilters uses the cleared filters by passing them directly
    applyFilters(clearedFilters);
    setFirstLoadCount && setFirstLoadCount(1);
  };

  const updateFilterSelection = (
    key: keyof PropertyFilter,
    value: string,
    checked: boolean
  ) => {
    setFilters((prev: PropertyFilter) => {
      const updatedArray = checked
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter((item) => item !== value);
      return {
        ...prev,
        [key]: updatedArray,
      };
    });
  };

  const handleRangeChange = (key: keyof PropertyFilter, range: Range) => {
    setFilters((prev: PropertyFilter) => ({
      ...prev,
      [key]: range,
    }));
  };

  const handleIncomeRangeChange = (range: { min: number; max: number }) => {
    setFilters((prev: PropertyFilter) => ({
      ...prev,
      incomeLess: range.min,
      incomeMore: range.max,
    }));
  };

  const handleCostToEPCCRangeChange = (range: { min: number; max: number }) => {
    setFilters((prev: PropertyFilter) => ({
      ...prev,
      costToEPCCmin: range.min === 0 ? 1 : range.min, // Set min to 1 if it's 0
      costToEPCCmax: range.max,
    }));
  };

  const handleMinimiseClick = () => {
    setIsMinimised(!isMinimised);
  };

  useEffect(() => {
    if (!initialFiltersApplied) {
      applyFilters(filters);
      setInitialFiltersApplied(true);
    }
  }, [isAuthenticated]);

  return (
    <div
      className={`relative flex flex-col bg-white font-SusyFont rounded-lg overflow-hidden transition-all duration-300 z-10  ${
        isMinimised ? "h-[90px] w-[90px]" : "h-[680px] w-[400px]"
      }`}
    >
      <div
        className={`p-2 px-8 w-full text-black flex flex-row items-center py-6 justify-center border-b-2 ${
          isMinimised ? "border-white" : "border-grey-200"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-8 mr-4"
        >
          <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
        </svg>

        {!isMinimised && (
          <h2 className="font-bold text-lg text-black w-full">Filters</h2>
        )}
        <button onClick={handleMinimiseClick} className="mr-4 text-xl">
          {isMinimised ? (
            <FaChevronRight className="translate-y-1" />
          ) : (
            <FaChevronLeft />
          )}
        </button>
      </div>
      {/* Start scroll area */}
      <div className="overflow-y-scroll h-[400px] w-full ">
        <EPCFilter
          isCollapsed
          onRangeChange={(range) => handleRangeChange("epcEnums", range)}
          resetKey={resetKey} // Pass resetKey to EPCFilter
        />
        <CostToEPCCFilter
          isCollapsed
          onRangeChange={handleCostToEPCCRangeChange}
          resetKey={resetKey}
        />
        <CentralHeatingFilter
          isCollapsed
          onChange={(value, checked) =>
            updateFilterSelection("centralHeatingTypeEnums", value, checked)
          }
          resetKey={resetKey} // Pass resetKey to CentralHeatingFilter
        />
        <HomeTypeFilter
          isCollapsed
          onChange={(value, checked) =>
            updateFilterSelection("homeTypeEnums", value, checked)
          }
          resetKey={resetKey}
        />
        <IMDFilter
          isCollapsed
          onRangeChange={(range) => handleRangeChange("imd", range)}
          resetKey={resetKey}
        />
        <IncomeFilter
          isCollapsed
          onRangeChange={handleIncomeRangeChange}
          resetKey={resetKey}
        />
      </div>

      <div
        className={`w-full p-8 border-t-2 ${
          isMinimised ? "border-white" : "border-grey-200"
        }`}
      >
        <div className="mt-8 w-full">
          <button
            onClick={() => applyFilters()}
            className="bg-susyPink text-susyNavy w-full py-3 rounded font-semibold hover:bg-susyLightPink"
          >
            Apply
          </button>
        </div>
        <div className="mt-4 w-full">
          <button
            onClick={clearFilters}
            className="bg-white border-susyPink border-2 font-bold rounded text-susyNavy w-full py-3 hover:bg-susyBlue hover:border-white hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
