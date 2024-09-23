import { create, StateCreator } from "zustand";

// Define your interface for OAData
interface OAData {
  id: string;
  total: number; // Assuming 'total' is part of OAData
  // Add other relevant fields for property data
}

// Update the OACountStore interface to include totalSum and setTotalSum
interface OACountStore {
  OACounts: OAData[];
  totalSum: number; // Add totalSum property
  setProperties: (oas: OAData[]) => void;
  setTotalSum: (sum: number) => void; // Add setTotalSum method
  clearProperties: () => void;
}

// Define a logging middleware
const logger =
  (config: StateCreator<OACountStore>): StateCreator<OACountStore> =>
  (set, get, api) =>
    config(
      (args) => {
        console.log("State change:", args);
        set(args);
      },
      get,
      api
    );

// Create the store with the logger middleware
export const useOACountStore = create<OACountStore>(
  logger((set) => ({
    OACounts: [],
    totalSum: 0, // Initialize totalSum to 0
    setProperties: (oas: OAData[]) => set({ OACounts: oas }),
    setTotalSum: (sum: number) => set({ totalSum: sum }), // Implement setTotalSum
    clearProperties: () => set({ OACounts: [], totalSum: 0 }), // Clear both OACounts and totalSum
  }))
);
