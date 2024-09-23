import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { useFilterStore } from "@/stores/UseFilterStore";
import { FaCircleCheck } from "react-icons/fa6";
interface ListPanelProps {
  handleClose: (value: boolean) => void;
  selectedList: Array<any>;
  fullListCount: number;
  setListsOpen: (value: boolean) => void;
  filters: any;
}

interface Range {
  min?: number;
  max?: number;
}

const selectableHeadings = [
  "Address",
  "Postcode",
  "EPC",
  "Tenure",
  "Building Type",
  "Central Heating",
  "IMD",
  "Income",
];

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

export default function ListPanel({
  handleClose,
  selectedList,
  fullListCount,
  setListsOpen,
}: ListPanelProps) {
  const [pageIndex, setPageIndex] = useState(0);
  const [selectedHeadings, setSelectedHeadings] =
    useState<string[]>(selectableHeadings);
  const [selectedOption, setSelectedOption] = useState<string>("current");
  const [selectedAmount, setSelectedAmount] = useState<number>(
    selectedOption === "current" ? selectedList.length : fullListCount
  );
  const [listName, setListName] = useState<string>("");
  const [listsObject, setListsObject] = useState<any>({});
  const handleNextClick = () => {
    setPageIndex(pageIndex + 1);
  };

  const handleBackClick = () => {
    setPageIndex(pageIndex - 1);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);

    if (option === "current") {
      setSelectedAmount(selectedList.length);
    } else {
      setSelectedAmount(fullListCount);
    }
  };

  const handleListNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
  };

  const handleMyListsClick = () => {
    handleClose(false);
    setListsOpen(true);
  };

  const handleSaveList = (option: string) => {
    const amount = option === "current" ? selectedList.length : fullListCount;

    if (option === "current") {
      setListsObject({
        ...listsObject,
        [listName]: selectedList,
      });
    } else {
      setListsObject({
        ...listsObject,
        [listName]: fullListCount,
      });
    }

    setPageIndex(pageIndex + 1);
    saveList(amount);
  };

  // Step 1: Map to get the array of 'oa' values
  const OAvalue = selectedList.map((item) => item.oa);

  // Step 2: Use Set to remove duplicates and convert to array using Array.from()
  let uniqueOAvalue = Array.from(new Set(OAvalue));

  let uniqueID = Math.floor(Math.random() * 100);
  const saveList = async (amount: number) => {
    const filters = useFilterStore.getState().filters;
    console.log("saving filters", filters);
    console.log("zustand filters", useFilterStore.getState().filters);
    const url = "https://api-insight.susy.house/api/insights/1/dash/list/";
    const data = {
      id: null,
      idZone: 1,
      idInsightsUser: 1,
      name: listName,
      size: amount,
      insightsListFilters: [
        {
          id: null,
          idZone: 1,
          idInsightsList: null,
          dashFilterTypeEnum: "OA",
          filter: "OA",
          value: selectedOption === "current" ? uniqueOAvalue.join(",") : "",
        },
        {
          id: null,
          idZone: 1,
          idInsightsList: null,
          dashFilterTypeEnum: "EPC_ENUM",
          filter: "EPC_ENUM",
          value: convertEPCEnumsToString(filters.epcEnums),
        },
        {
          id: null,
          idZone: 1,
          idInsightsList: null,
          dashFilterTypeEnum: "CENTRAL_HEATING_TYPE_ENUM",
          filter: "CENTRAL_HEATING_TYPE_ENUM",
          value: filters.centralHeatingTypeEnums?.join(",") ?? "",
        },
        {
          id: null,
          idZone: 1,
          idInsightsList: null,
          dashFilterTypeEnum: "TENURE_TYPE_ENUM",
          filter: "TENURE_TYPE_ENUM",
          value: filters.tenureTypeEnums?.join(",") ?? "",
        },
        {
          id: null,
          idZone: 1,
          idInsightsList: null,
          dashFilterTypeEnum: "HOME_TYPE_ENUM",
          filter: "HOME_TYPE_ENUM",
          value: filters.homeTypeEnums?.join(",") ?? "",
        },
        ...(filters.imd &&
        filters.imd.min !== undefined &&
        filters.imd.max !== undefined
          ? [
              {
                id: null,
                idZone: 1,
                idInsightsList: null,
                dashFilterTypeEnum: "IMD",
                filter: "IMD",
                value: Array.from(
                  { length: filters.imd.max - filters.imd.min + 1 },
                  (_, i) => i + (filters.imd?.min ?? 0)
                ).join(","),
              },
            ]
          : []),
        ...(filters.incomeMore !== undefined &&
        filters.incomeMore.toString() !== ""
          ? [
              {
                id: null,
                idZone: 1,
                idInsightsList: null,
                dashFilterTypeEnum: "INCOME_MORE",
                filter: "INCOME_MORE",
                value: String(filters.incomeMore),
              },
            ]
          : []),
        ...(filters.incomeLess !== undefined &&
        filters.incomeLess.toString() !== ""
          ? [
              {
                id: null,
                idZone: 1,
                idInsightsList: null,
                dashFilterTypeEnum: "INCOME_LESS",
                filter: "INCOME_LESS",
                value: String(filters.incomeLess),
              },
            ]
          : []),
        ...(filters.costToEPCCmax !== undefined &&
        filters.costToEPCCmax.toString() !== ""
          ? [
              {
                id: null,
                idZone: 1,
                idInsightsList: null,
                dashFilterTypeEnum: "COST_TO_EPC_C_MAX",
                filter: "COST_TO_EPC_C_MAX",
                value: String(filters.costToEPCCmax),
              },
            ]
          : []),
        ...(filters.costToEPCCmin !== undefined &&
        filters.costToEPCCmin.toString() !== ""
          ? [
              {
                id: null,
                idZone: 1,
                idInsightsList: null,
                dashFilterTypeEnum: "COST_TO_EPC_C_MIN",
                filter: "COST_TO_EPC_C_MIN",
                value: String(filters.costToEPCCmin),
              },
            ]
          : []),
      ].filter((filter) => filter.value != null && filter.value !== ""),
    };

    console.log("Saving list data. Data being sent:", data);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Network response was not ok: ${response.statusText} - ${errorText}`
        );
      }

      const responseData = await response.json();
      console.log("User list saved successfully:", responseData);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  useEffect(() => {
    setSelectedAmount(
      selectedOption === "current" ? selectedList.length : fullListCount
    );
  }, [selectedList, fullListCount, selectedOption]);

  return (
    <div className="relative p-12 h-screen">
      <div className=" bg-white flex flex-col shadow-lg text-black w-[480px] rounded-xl h-full">
        <div className="w-full flex justify-end font-bold relative">
          <button
            className="absolute top-5 right-7 h-10 w-10 "
            onClick={() => handleClose(false)}
          >
            <IoClose className="w-full h-full" />
          </button>
        </div>

        <div className="pt-3 flex justify-between flex-col h-full">
          {pageIndex === 0 && (
            <div>
              <div className="w-full flex flex-row items-center border-b border-grey-500">
                <h3 className="mb-2 text-[20px] text-susyNavy text-RedHat font-medium p-4 px-8">
                  Create list
                </h3>
              </div>
              <p className="text-[18px] text-susyNavy text-RedHat font-medium p-5 px-8">
                Choose list content:
              </p>
              <label className="mt-2 px-8 flex flex-row items-center">
                <input
                  type="checkbox"
                  className="mr-3 rounded-full -translate-y-[2px] w-[24px] h-[24px]"
                  checked={selectedOption === "current"}
                  onChange={() => handleOptionChange("current")}
                />
                <p className="text-[18px] text-susyNavy text-RedHat font-normal flex">
                  Current map selection ({selectedList.length})
                </p>
              </label>
              <label className="px-8 flex flex-row items-center mt-6">
                <input
                  type="checkbox"
                  className="mr-3 rounded-full -translate-y-[2px] w-[24px] h-[24px]"
                  checked={selectedOption === "full"}
                  onChange={() => handleOptionChange("full")}
                />
                <p className="text-[18px] text-susyNavy text-RedHat font-normal flex ">
                  Full set of filtered results ({fullListCount})
                </p>
              </label>
            </div>
          )}

          {pageIndex === 1 && (
            <div>
              <div className="w-full flex flex-row items-center border-b border-grey-500">
                <h3 className="mb-2 text-[20px] text-susyNavy text-RedHat font-medium p-4 px-8">
                  Create list ({selectedAmount} properties)
                </h3>
              </div>
              <h3 className="font-bold mb-10"></h3>
              <p className="font-RedHat text-susyNavy text-[18px] font-medium px-8">
                Name your list
              </p>

              <div className="flex flex-col mt-2 px-8 rounded-md">
                <input
                  type="text"
                  className="border border-2 p-3 rounded-md"
                  onChange={handleListNameInput}
                />
              </div>
            </div>
          )}
          {pageIndex === 2 && (
            <div>
              <div className="w-full flex flex-row items-center border-b border-grey-500">
                <h3 className="mb-2 text-[20px] text-susyNavy text-RedHat font-medium p-4 px-8">
                  List saved
                </h3>
              </div>

              <div className="w-full p-8">
                <div className="bg-susyGreen flex flex-row p-6 py-8">
                  <FaCircleCheck className=" w-[24px] h-[24px] mr-4" />

                  <p className="">
                    <strong>{listName}</strong> list created
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex w-full gap-2 border-t-2 border-grey-500 p-8 flex-col">
            {pageIndex == 1 && (
              <button
                onClick={() => handleSaveList(selectedOption)}
                className="bg-susyPink text-black hover:bg-susyLightPink p-8 py-4 text-base flex-1 rounded-md"
              >
                <p className="text-[18px] text-susyNavy font-medium">
                  Save list
                </p>
              </button>
            )}
            {pageIndex > 0 && pageIndex < 2 && (
              <button
                onClick={handleBackClick}
                className="bg-white border-susyPink border-2 text-black hover:bg-gray-500 p-8 py-4 text-base flex-1 rounded-md"
              >
                <p className="text-[18px] text-susyNavy font-medium">
                  Previous
                </p>
              </button>
            )}
            {pageIndex < 1 && (
              <button
                onClick={handleNextClick}
                className={`bg-susyPink text-black hover:bg-gray-500 p-8 py-4 text-base flex-1 rounded-md ${
                  selectedAmount === 0
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-black text-white hover:bg-susyLightPink"
                }`}
                disabled={selectedAmount === 0}
              >
                <p className="text-[18px] text-susyNavy font-medium">Next</p>
              </button>
            )}

            {pageIndex == 2 && (
              <div className="w-full flex flex-col">
                <button
                  onClick={handleMyListsClick}
                  className="bg-susyPink text-black hover:bg-susyLightPink p-8 py-4 text-base flex-1 rounded-md"
                >
                  <p className="text-[18px] text-susyNavy font-medium">
                    Go to list{" "}
                  </p>
                </button>

                <button
                  onClick={() => handleClose(false)}
                  className="bg-white border-susyPink border-2 text-black hover:bg-gray-500 p-8 py-4 text-base flex-1 rounded-md mt-4"
                >
                  <p className="text-[18px] text-susyNavy font-medium">
                    Create another list{" "}
                  </p>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
