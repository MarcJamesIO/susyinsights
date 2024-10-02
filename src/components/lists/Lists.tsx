import React, { useEffect, useState } from "react";
import LoadingPanel from "../loading-panel/LoadingPanel";
import ListView from "../list-view/ListView";
import { BiSortAlt2 } from "react-icons/bi";
import { FiDownload } from "react-icons/fi";
import { FaRegTrashAlt } from "react-icons/fa";
import { FiChevronsLeft, FiChevronsRight } from "react-icons/fi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaCopy } from "react-icons/fa";
interface List {
  insightsListFilters: any;
  name: string;
  dateRegister: string;
  insightsUser: string;
  size: string;
  id: number;
}

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

interface ListsProps {
  setIsListsOpen: (open: boolean) => void;
  isListOpen: boolean;
  setShowSingleList: (show: boolean) => void;
  showSingleList: boolean;
  setLoadingText?: (value: string) => void;
  setShowLoading: (value: boolean) => void;
}

export default function Lists({
  setIsListsOpen,
  isListOpen,
  setShowSingleList,
  showSingleList,
  setLoadingText,
  setShowLoading,
}: ListsProps) {
  const [lists, setLists] = useState<List[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof List;
    direction: "ascending" | "descending";
  }>({ key: "dateRegister", direction: "ascending" });
  const [singleListData, setSingleListData] = useState<ListItem[]>([]);
  const [singleListInformation, setSingleListInformation] = useState<List>();
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(50);

  const firstNames = [
    "Ryan",
    "Bryan",
    "George",
    "Rosie",
    "Mauro",
    "Marc",
    "Moacyr",
    "Eduardo",
  ];

  useEffect(() => {
    setIsListsOpen(true);
  }, []);

  useEffect(() => {
    setShowLoading(false);
  }, [showSingleList]);

  useEffect(() => {
    getUserList();
  }, [resultsPerPage]);

  const getAuthToken = (): string | null => {
    return localStorage.getItem("token");
  };

  const getUserList = async () => {
    const url = `https://api-insight.susy.house/api/insights/1/dash/list/by-user`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const responseData = await response.json();
      setShowLoading(false);

      // Sort the data by dateRegister in descending order (latest first)
      const sortedData = responseData.data.sort((a: List, b: List) => {
        if (a.dateRegister < b.dateRegister) return 1;
        if (a.dateRegister > b.dateRegister) return -1;
        return 0;
      });

      setLists(sortedData);
      setTotalPages(Math.ceil(sortedData.length / resultsPerPage));

      console.log("User lists fetched successfully:", sortedData);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleDuplicateList = async (list: List) => {
    console.log("Duplicate list", list);

    const url = "https://api-insight.susy.house/api/insights/1/dash/list/";

    const newFilters = list.insightsListFilters.map((filter: any) => {
      // Make a copy of the filter object and modify the necessary properties
      return {
        ...filter,
        idInsightsList: null,
        id: null,
      };
    });

    const data = {
      id: null,
      idZone: 1,
      idInsightsUser: 1,
      name: "Copy of " + list.name,
      size: list.size,
      insightsListFilters: newFilters,
    };

    console.log("Duplicating list data. Data being sent:", data);

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
      console.log("User list duplicated successfully:", responseData);
      getUserList();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleViewList = async (list: List) => {
    setLoadingText && setLoadingText("Fetching list data...");
    setShowLoading(true);
    const url =
      `https://api-insight.susy.house/api/insights/1/dash/list/fetch-insights-by-List/${list.id}` +
      "?page=0&pageSize=500000";

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const responseData = await response.json();
      if (responseData.data != null) {
        setSingleListData(responseData.data.items);
        setSingleListInformation(list);
        setShowSingleList(true);
      } else {
        console.log("No items found for list ID:", list.id);
      }
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleDeleteList = async (list: List) => {
    const url = `https://api-insight.susy.house/api/insights/1/dash/list/${list.id}`;

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      } else {
        const updatedLists = lists.filter((item) => item.id !== list.id);
      }
    } catch (error) {
      console.error("There was a problem with the duplicate operation:", error);
    }
  };

  const sortList = (key: keyof List) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }

    const sortedLists = [...lists].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1;
      }
      return 0;
    });

    setLists(sortedLists);
    setSortConfig({ key, direction });
  };

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

  return (
    <div className="bg-white w-full p-24 py-8 box-border relative ">
      {!showSingleList && (
        <>
          <h1 className="text-5xl mt-8 mb-16 text-RedHat font-medium text-susyNavy">
            My Lists
          </h1>
          <div className="relative min-w-full border border-gray-200 rounded-md h-full max-h-[500px] overflow-y-scroll">
            <table className="relative min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy w-1/3"
                    onClick={() => sortList("name")}
                  >
                    <div className="flex">
                      {" "}
                      List name{" "}
                      <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                    onClick={() => sortList("dateRegister")}
                  >
                    <div className="flex">
                      Date created{" "}
                      <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                    onClick={() => sortList("insightsUser")}
                  >
                    <div className="flex">
                      Created by{" "}
                      <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer text-RedHat text-susyNavy"
                    onClick={() => sortList("size")}
                  >
                    <div className="flex">
                      List size
                      <BiSortAlt2 className="ml-2 w-[16px] h-[16px] -translate-y-[1px]" />
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lists.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      No lists available.
                    </td>
                  </tr>
                ) : (
                  lists
                    .slice(
                      pageNumber * resultsPerPage,
                      (pageNumber + 1) * resultsPerPage
                    )
                    .map((list, index) => (
                      <tr key={index}>
                        <td
                          onClick={() => handleViewList(list)}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:cursor-pointer hover:text-gray-400"
                        >
                          <p className="border-b-2 border-susyNavy w-max font-normal">
                            {" "}
                            {list.name}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p className="font-normal text-susyNavy">
                            {" "}
                            {formatDate(list.dateRegister)}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p className="font-normal text-susyNavy">
                            {list.insightsUser}
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <p className="font-normal text-susyNavy">
                            {list.size.toLocaleString()} properties
                          </p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center font-medium text-2xl flex justify-center items-center">
                          <button
                            onClick={() => handleViewList(list)}
                            className="text-black hover:text-indigo-900"
                          >
                            <FiDownload className="w-[18px] text-susyNavy" />
                          </button>
                          <a
                            href="#"
                            className="ml-4 text-black hover:text-indigo-900"
                            onClick={() => handleDeleteList(list)}
                          >
                            <FaRegTrashAlt className="w-[14px] text-susyNavy" />
                          </a>
                          <button
                            onClick={() => handleDuplicateList(list)}
                            className="ml-4 text-black hover:text-indigo-900"
                          >
                            <FaCopy className="w-[18px] text-susyNavy" />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
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
                  pageNumber >= totalPages - 1
                    ? "text-gray-200"
                    : "text-susyNavy"
                }`}
              >
                <FiChevronRight />
              </button>
              <button
                onClick={handleLastPage}
                disabled={pageNumber >= totalPages - 1}
                className={`px-4 py-2 text-4xl  ${
                  pageNumber >= totalPages - 1
                    ? "text-gray-200"
                    : "text-susyNavy"
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
        </>
      )}
      {showSingleList && (
        <ListView
          listData={singleListData}
          singleListInformation={singleListInformation}
          setShowSingleList={setShowSingleList}
        />
      )}
    </div>
  );
}

function formatDate(isoString: any) {
  const date = new Date(isoString);

  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  function getOrdinalSuffix(day: any) {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const dayWithSuffix = day + getOrdinalSuffix(day);

  return `${dayWithSuffix} ${month} ${year}`;
}
