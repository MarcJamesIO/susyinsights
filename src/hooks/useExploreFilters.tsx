import { useEffect, useState, useCallback } from "react";

interface Range {
  min?: number;
  max?: number;
}

interface PropertyFilter {
  predictedEligibility?: string[];
  epcEnums?: Range;
  centralHeatingTypeEnums?: string[];
  tenureTypeEnums?: string[];
  homeTypeEnums?: string[];
  buildingTypeEnums?: string[];
  imd?: Range;
  incomeLess?: number;
  incomeMore?: number;
  costToEPCCmin?: number;
  costToEPCCmax?: number;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

interface ListDataType {
  oa: string;
  total: number;
}

interface UseExploreFiltersResult {
  filters: PropertyFilter;
  listData: ListDataType[];
  error: string | null;
  setFilters: (filters: PropertyFilter) => void;
  fetchProperties: (options?: {
    endpoint?: string;
    oa?: string;
    page?: number;
    pageSize?: number;
    filters?: PropertyFilter;
  }) => Promise<void>;
}

const API_URL = "https://api-insight.susy.house/api/insights/dash/";

const getAuthToken = (): string | null => {
  const token = localStorage.getItem("token");

  return localStorage.getItem("token");
};

const convertEPCEnumsToString = (epcEnums?: Range): string => {
  if (!epcEnums || epcEnums.min == null || epcEnums.max == null) {
    return "";
  }
  const letters = Array.from(
    { length: epcEnums.max - (epcEnums.min ?? 0) + 1 },
    (_, k) => String.fromCharCode(65 + (epcEnums.min ?? 0) + k - 1)
  );
  return letters.join(",");
};

const convertIMDRangeToString = (imdRange?: Range): string => {
  if (!imdRange || imdRange.min == null || imdRange.max == null) {
    return "";
  }
  const rangeArray = Array.from(
    { length: imdRange.max - (imdRange.min ?? 0) + 1 },
    (_, k) => (imdRange.min ?? 0) + k
  );
  return rangeArray.join(",");
};

const useExploreFilters = (): UseExploreFiltersResult => {
  const [filters, setFilters] = useState<PropertyFilter>({
    predictedEligibility: [],
    epcEnums: { min: 1, max: 7 },
    centralHeatingTypeEnums: [],
    tenureTypeEnums: [],
    homeTypeEnums: [],
    buildingTypeEnums: [],
    imd: { min: 1, max: 10 },
    incomeLess: 0,
    incomeMore: 100000,
    costToEPCCmin: 0,
    costToEPCCmax: 100000,
    page: 0,
    pageSize: 30,
  });

  const [listData, setListData] = useState<ListDataType[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(
    async (options?: {
      endpoint?: string;
      oa?: string;
      page?: number;
      pageSize?: number;
      filters?: PropertyFilter;
    }) => {
      try {
        const params = new URLSearchParams();
        const activeFilters = options?.filters || filters;

        const addParam = (key: string, value: any) => {
          if (
            value != null &&
            value !== "" &&
            (!Array.isArray(value) || value.length > 0)
          ) {
            if (Array.isArray(value)) {
              params.append(key, value.join(","));
            } else if (
              typeof value === "object" &&
              "min" in value &&
              "max" in value
            ) {
              const rangeValue = `${value.min},${value.max}`;
              params.append(key, rangeValue);
            } else {
              params.append(key, value.toString());
            }
          }

          if (key === "centralHeatingTypeEnums" && value == undefined) {
            value = ["GAS", "HEAT_PUMP", "ELECTRIC", "OTHER"];
            params.append(key, value.join(","));
          }

          if (key === "tenureTypeEnums" && value == undefined) {
            value = ["OWN_OCCUPIED", "RENTED_SOCIAL", "RENTED_PRIVATE"];
            params.append(key, value.join(","));
          }
        };

        addParam("epcEnums", convertEPCEnumsToString(activeFilters.epcEnums));
        addParam(
          "centralHeatingTypeEnums",
          activeFilters.centralHeatingTypeEnums
        );
        addParam("tenureTypeEnums", activeFilters.tenureTypeEnums);
        addParam("homeTypesEnums", activeFilters.homeTypeEnums);
        addParam("buildingTypeEnums", activeFilters.buildingTypeEnums);
        addParam("imd", convertIMDRangeToString(activeFilters.imd));
        addParam("incomeLess", activeFilters.incomeLess);
        addParam("incomeMore", activeFilters.incomeMore);
        addParam("costToEPCCmin", activeFilters.costToEPCCmin);
        addParam("costToEPCCmax", activeFilters.costToEPCCmax);

        if (options?.endpoint === "by-params") {
          addParam("oa", options.oa);
          addParam("page", options.page);
          addParam("pageSize", options.pageSize);
        }

        const queryString = params.toString();
        const token = getAuthToken();

        if (!token) {
          setError("Missing authorization token");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const apiGET = `${API_URL}${
          options?.endpoint ?? "total-oa-by-params"
        }?${queryString}`;

        console.log("API GET:", apiGET);
        const response = await fetch(apiGET, {
          headers,
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          setError(`Error: ${response.statusText}, Details: ${errorMessage}`);
          return;
        }

        const data = await response.json();
        console.log("API response:", data);

        if (options?.endpoint !== "by-params") {
          console.log("Setting list data BY-PARAMS:", data.data);
          setListData(data.data || []);
        }
        setError(null);

        console.log("Fetch properties is returning: ", data);
        return data;
      } catch (err) {
        setError(`An error occurred: ${err}`);
      }
    },
    [filters]
  );

  return {
    filters,
    listData,
    error,
    setFilters,
    fetchProperties,
  };
};

export default useExploreFilters;
