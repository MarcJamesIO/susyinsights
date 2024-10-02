import React, { useState, useMemo } from "react";
import { FiDownload } from "react-icons/fi";
import { BiSortAlt2 } from "react-icons/bi";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaPen } from "react-icons/fa";

interface ListItem {
  address: string;
  postcode: string;
  imd: number;
  tenureEnum: string;
  centralHeatingEnum: string;
  homeType: string;
  epcEnum: string;
  predictedIncome: number;
  costToEpcC: number;
  [key: string]: any;
}

interface SelectedListProps {
  listData: ListItem[];
  singleListInformation: any;
  setShowSingleList: (value: boolean) => void;
}

const ListView: React.FC<SelectedListProps> = ({
  listData,
  singleListInformation,
  setShowSingleList,
}) => {
  const [pageNumber, setPageNumber] = useState<number>(0);
  const [resultsPerPage, setResultsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ListItem;
    direction: "ascending" | "descending";
  } | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");

  // New state variables
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const sortList = (key: keyof ListItem) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...listData];
    if (sortConfig !== null) {
      const { key, direction } = sortConfig;
      sortableItems.sort((a, b) => {
        const valueA = a[key];
        const valueB = b[key];

        if (typeof valueA === "number" && typeof valueB === "number") {
          return direction === "ascending" ? valueA - valueB : valueB - valueA;
        }

        if (valueA < valueB) {
          return direction === "ascending" ? -1 : 1;
        }
        if (valueA > valueB) {
          return direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [listData, sortConfig]);

  const filteredData = useMemo(() => {
    if (!searchInput) return sortedData;
    return sortedData.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchInput.toLowerCase())
      )
    );
  }, [sortedData, searchInput]);

  const totalPages = Math.ceil(filteredData.length / resultsPerPage);
  const currentItems = filteredData.slice(
    pageNumber * resultsPerPage,
    (pageNumber + 1) * resultsPerPage
  );

  const handleNextPage = () => {
    if (pageNumber < totalPages - 1) {
      setPageNumber(pageNumber + 1);
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 0) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleFirstPage = () => {
    setPageNumber(0);
  };

  const handleLastPage = () => {
    setPageNumber(totalPages - 1);
  };

  const handleResultsPerPageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setResultsPerPage(Number(event.target.value));
    setPageNumber(0); // Reset to first page when changing results per page
  };

  const downloadCSV = () => {
    const csvRows = [
      [
        "Address",
        "Postcode",
        "IMD",
        "Central Heating",
        "Home Type",
        "EPC",
        "Predicted Income",
        "Cost to EPC C",
      ],
      ...listData.map((item) =>
        [
          item.address,
          item.postcode,
          item.imd,
          item.centralHeatingEnum,
          item.homeType,
          item.epcEnum,
          item.predictedIncome,
          item.costToEpcC,
        ]
          .map((field) => JSON.stringify(field))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `${singleListInformation.name}.csv`);
    a.click();
  };

  const formatCurrency = (value: number) => {
    return Math.round(value).toLocaleString();
  };

  // Handle checkbox change
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    address: string
  ) => {
    setCheckedItems((prevState) => {
      const newCheckedItems = new Set(prevState);
      if (e.target.checked) {
        newCheckedItems.add(address);
      } else {
        newCheckedItems.delete(address);
      }
      return newCheckedItems;
    });
  };

  // Get selected items
  const selectedItems = useMemo(() => {
    return listData.filter((item) => checkedItems.has(item.address));
  }, [checkedItems, listData]);

  return (
    <div className="pb-60">
      <div className="text-susyNavy font-light">
        <button onClick={() => setShowSingleList(false)} className="">
          <h1 className="text-RedHat font-medium text-susyNavy border-b-2 border-susyNavy">
            My lists
          </h1>
        </button>{" "}
        &gt; {singleListInformation.name}
      </div>
      <h1 className="font-medium text-[32px] font-SusyFont text-susyNavy mt-8 mb-8">
        List: {singleListInformation.name} ({singleListInformation.size})
      </h1>

      <div className="w-full flex justify-between items-end">
        <div className="text-black ">
          <p className="text-susyNavy font-bold mb-2">Search within list:</p>
          <div className="flex flex-row">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-susyNavy px-8 py-3 rounded-md w-[300px]"
            />
            <button className=" px-4 py-3 flex flex-row justify-center items-center ml-2 bg-susyPink hover:bg-susyLightPink rounded-md text-susyNavy">
              Go
            </button>
          </div>
        </div>
        <div className="text-black flex flex-row ">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className=" px-4 py-3 flex flew-row justify-center items-center bg-white border-susyPink border-2 mr-4 hover:bg-gray-100 rounded-md text-susyNavy relative"
          >
            {isEditing ? (
              "Cancel Changes"
            ) : (
              <>
                <FaPen className="inline-block mr-2 text-1xl" />
                Edit
              </>
            )}
          </button>

          {isEditing && (
            <button
              onClick={downloadCSV}
              className=" px-4 py-3 flex flew-row justify-center items-center bg-susyPink hover:bg-susyLightPink rounded-md text-susyNavy relative"
            >
              <FiDownload className="inline-block mr-2 text-1xl" /> Save Changes
            </button>
          )}
          {!isEditing && (
            <button
              onClick={downloadCSV}
              className=" px-4 py-3 flex flew-row justify-center items-center bg-susyPink hover:bg-susyLightPink rounded-md text-susyNavy relative"
            >
              <FiDownload className="inline-block mr-2 text-1xl" /> Download
            </button>
          )}
        </div>
      </div>
      <div className="rounded-lg mt-8  m-0">
        <div className="relative min-w-full border border-gray-200 rounded-md h-full max-h-[500px] overflow-y-scroll">
          <table className="relative min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Address Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy min-w-[350px]  w-[250px] max-w-[350px]"
                  onClick={() => sortList("address")}
                >
                  <div className="flex">
                    {isEditing && (
                      <input
                        type="checkbox"
                        className="mr-2"
                        onChange={(e) => {
                          const allAddresses = currentItems.map(
                            (item) => item.address
                          );
                          if (e.target.checked) {
                            setCheckedItems(
                              new Set([...checkedItems, ...allAddresses])
                            );
                          } else {
                            setCheckedItems(
                              new Set(
                                [...checkedItems].filter(
                                  (addr) => !allAddresses.includes(addr)
                                )
                              )
                            );
                          }
                        }}
                        checked={currentItems.every((item) =>
                          checkedItems.has(item.address)
                        )}
                      />
                    )}
                    Address
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* Postcode Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("postcode")}
                >
                  <div className="flex">
                    Postcode
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* Home Type Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("homeType")}
                >
                  <div className="flex">
                    Home Type
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* EPC Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("epcEnum")}
                >
                  <div className="flex">
                    EPC
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* Cost to EPC C Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("costToEpcC")}
                >
                  <div className="flex">
                    Cost to EPC C
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* Central Heating Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("centralHeatingEnum")}
                >
                  <div className="flex">
                    Central Heating
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* Predicted Income Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("predictedIncome")}
                >
                  <div className="flex">
                    Predicted Income
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>

                {/* IMD Column Header */}
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                  onClick={() => sortList("imd")}
                >
                  <div className="flex">
                    IMD
                    <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={`${item.address}-${item.postcode}-${index}`}>
                    {/* Address Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 w-[250px] min-w-[350px] max-w-[350px] overflow-hidden">
                      {isEditing && (
                        <input
                          className="mr-4"
                          type="checkbox"
                          onChange={(e) =>
                            handleCheckboxChange(e, item.address)
                          }
                          checked={checkedItems.has(item.address)}
                        />
                      )}
                      {item.address}
                    </td>

                    {/* Postcode Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.postcode}
                    </td>

                    {/* Home Type Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.homeType}
                    </td>

                    {/* EPC Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.epcEnum}
                    </td>

                    {/* Cost to EPC C Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.costToEpcC === 0
                        ? "NA"
                        : "£" + formatCurrency(item.costToEpcC)}
                    </td>

                    {/* Central Heating Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.centralHeatingEnum}
                    </td>

                    {/* Predicted Income Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {"£" + formatCurrency(item.predictedIncome)}
                    </td>

                    {/* IMD Cell */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.imd}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                  >
                    No items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="w-full flex justify-center mt-4 relative items-center">
        <div className="relative flex justify-center items-center">
          <button
            onClick={handleFirstPage}
            disabled={pageNumber === 0}
            className={`px-4 py-2 text-4xl ${
              pageNumber === 0 ? "text-gray-200" : "text-susyNavy"
            }`}
          >
            <FiChevronsLeft />
          </button>
          <button
            onClick={handlePreviousPage}
            disabled={pageNumber === 0}
            className={`px-4 text-4xl ${
              pageNumber === 0 ? "text-gray-200" : "text-susyNavy"
            }`}
          >
            <FiChevronLeft />
          </button>
          {Array.from({ length: 5 }, (_, i) => i + pageNumber - 2)
            .filter((page) => page >= 0 && page < totalPages)
            .map((page) => (
              <button
                key={page}
                onClick={() => setPageNumber(page)}
                className={`px-4 py-2 rounded-full mx-1 flex items-center ${
                  page === pageNumber
                    ? "bg-susyNavy text-white"
                    : "text-susyNavy hover:bg-blue-100"
                }`}
                style={{
                  width: "40px",
                  height: "40px",
                  lineHeight: "40px",
                  textAlign: "center",
                  borderRadius: "50%",
                }}
              >
                {page + 1}
              </button>
            ))}
          <button
            onClick={handleNextPage}
            disabled={pageNumber >= totalPages - 1}
            className={`px-4 py-2 text-4xl ${
              pageNumber >= totalPages - 1 ? "text-gray-200" : "text-susyNavy"
            }`}
          >
            <FiChevronRight />
          </button>
          <button
            onClick={handleLastPage}
            disabled={pageNumber >= totalPages - 1}
            className={`px-4 py-2 text-4xl  ${
              pageNumber >= totalPages - 1 ? "text-gray-200" : "text-susyNavy"
            }`}
          >
            <FiChevronsRight />
          </button>
          <div className="flex justify-center border-b border-susyNavy items-center absolute -right-40 ">
            <label className="mr-2 text-susyNavy text-sm">
              {resultsPerPage} per page:
            </label>
            <select
              value={resultsPerPage}
              onChange={handleResultsPerPageChange}
              className="border-0 w-[10px]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListView;
