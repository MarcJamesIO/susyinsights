import { create, StateCreator } from "zustand";
import { PropertyFilter } from "../types/types";

const initialFilters: PropertyFilter = {
  predictedEligibility: [],
  epcEnums: { min: 1, max: 7 },
  centralHeatingTypeEnums: [],
  tenureTypeEnums: [],
  homeTypeEnums: [],
  buildingTypeEnums: [],
  imd: { min: 1, max: 10 },
  incomeLess: undefined,
  incomeMore: undefined,
};

interface FilterStore {
  filters: PropertyFilter;
  setFilters: (filters: PropertyFilter) => void;
  clearFilters: () => void;
}

const logger =
  (config: StateCreator<FilterStore>): StateCreator<FilterStore> =>
  (set, get, api) =>
    config(
      (args) => {
        console.log("State change:", args);
        set(args);
      },
      get,
      api
    );

export const useFilterStore = create<FilterStore>(
  logger((set) => ({
    filters: initialFilters,
    setFilters: (filters: PropertyFilter) => set({ filters }),
    clearFilters: () => set({ filters: initialFilters }),
  }))
);
