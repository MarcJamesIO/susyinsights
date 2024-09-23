import React, { useEffect, useState } from "react";
import Filters from "../filters/Filters";
import Map from "../map/Map";
import useExploreFilters from "../../hooks/useExploreFilters";
import { PropertyFilter } from "@/types/types";
import { useOACountStore } from "@/stores/UseOACountStore";

interface ExploreProps {
  setListsOpen: (value: boolean) => void;
  isAuthenticated: boolean;
  setShowLoading: (value: boolean) => void;
  showLoading: boolean;
  setLoadingText: (value: string) => void;
  firstLoadCount: number;
  setFirstLoadCount: (value: number) => void;
}

const Explore: React.FC<ExploreProps> = ({
  setListsOpen,
  isAuthenticated,
  setShowLoading,
  showLoading,
  setLoadingText,
  firstLoadCount,
  setFirstLoadCount,
}) => {
  const { filters, listData, error, setFilters, fetchProperties } =
    useExploreFilters();
  const [appliedFilters, setAppliedFilters] = useState<PropertyFilter>(filters);
  const [oaCountData, setOACountData] = useState<any>([]);
  const OACounts = useOACountStore((state) => state.OACounts);

  useEffect(() => {
    setOACountData(OACounts);
  }, [OACounts]);

  return (
    <div className="flex flex-col w-full bg-white h-full">
      <div className="relative flex flex-col md:flex-row w-full h-full">
        <div className="absolute left-8 top-8">
          <Filters
            isAuthenticated={isAuthenticated}
            setShowLoading={setShowLoading}
            firstLoadCount={firstLoadCount}
            setFirstLoadCount={setFirstLoadCount}
            setLoadingText={setLoadingText}
          />
        </div>
        <div className="w-full">
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Map
            oaCountData={oaCountData}
            listData={listData}
            selectedLocation={0}
            filters={appliedFilters}
            fetchProperties={fetchProperties}
            setListsOpen={setListsOpen}
            showLoading={showLoading}
            setShowLoading={setShowLoading}
            firstLoadCount={firstLoadCount}
            setFirstLoadCount={setFirstLoadCount}
          />
        </div>
        {/* <div className="w-full md:w-3/4">
          <LeafletComponent
            listData={listData}
            selectedLocation={0}
            filters={appliedFilters}
            fetchProperties={fetchProperties}
          />
        </div> */}
      </div>
    </div>
  );
};

export default Explore;
