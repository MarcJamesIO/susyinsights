import create from "zustand";

interface Property {
  id: string;
  oa: string;
  // Define other properties according to your API response
}

interface SelectedPropertiesStore {
  selectedProperties: Property[];
  totalSelectedProperties: number;
  addProperties: (properties: Property[]) => void;
  removeProperties: (oaCode: string) => void;
  clearProperties: () => void;
}

export const UseSelectedPropertiesStore = create<SelectedPropertiesStore>(
  (set) => ({
    selectedProperties: [],
    totalSelectedProperties: 0,
    addProperties: (properties) =>
      set((state) => ({
        selectedProperties: [...state.selectedProperties, ...properties],
        totalSelectedProperties:
          state.totalSelectedProperties + properties.length,
      })),
    removeProperties: (oaCode) =>
      set((state) => {
        const remainingProperties = state.selectedProperties.filter(
          (property) => property.oa !== oaCode
        );
        return {
          selectedProperties: remainingProperties,
          totalSelectedProperties: remainingProperties.length,
        };
      }),
    clearProperties: () =>
      set({ selectedProperties: [], totalSelectedProperties: 0 }),
  })
);
