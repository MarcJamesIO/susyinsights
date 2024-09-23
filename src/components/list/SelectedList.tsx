import React, { useState, useEffect, useMemo } from "react";

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
  [key: string]: any; // Additional keys as needed
}

interface SelectedListProps {
  listData: ListItem[];
}

interface SortConfig {
  key: keyof ListItem | null;
  direction: "ascending" | "descending";
}

const SelectedList: React.FC<SelectedListProps> = ({ listData }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });

  const headers = [
    { key: "address", label: "ADDRESS" },
    { key: "postcode", label: "POSTCODE" },
    { key: "imd", label: "IMD" },
    { key: "tenureEnum", label: "TENURE" },
    { key: "centralHeatingEnum", label: "CENTRAL HEATING TYPE" },
    { key: "homeType", label: "HOME TYPE" },
    { key: "epcEnum", label: "EPC" },
    { key: "predictedIncome", label: "PREDICTED INCOME" },
  ];

  const requestSort = (key: keyof ListItem) => {
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
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!]; // Use non-null assertion since key is checked
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [listData, sortConfig]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = sortedData.slice(firstItemIndex, lastItemIndex);

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const pageNumbers = () => {
    let pages = [];
    for (
      let i = Math.max(currentPage - 2, 1);
      i <= Math.min(currentPage + 2, pageCount);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  };

  const formatCurrency = (value: number) => {
    return `£${Math.round(value).toLocaleString()}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8  p-4 rounded-lg mt-8 bg-gray-100 ">
      <h1 className="text-black font-bold">
        Selected list: ({listData.length} properties selected)
      </h1>

      <div className="mt-8 flow-root">
        <div className="table-container">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header.key}
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-xs md:text-sm font-semibold text-gray-900 sm:pl-0 text-center"
                    onClick={() => requestSort(header.key as keyof ListItem)}
                    style={{ cursor: "pointer" }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.map((item, index) => (
                <tr key={index}>
                  {headers.map((header) => (
                    <td
                      key={header.key}
                      className="whitespace-nowrap py-4 pl-4 pr-3 text-xs md:text-sm text-gray-500 sm:pl-0 text-center"
                    >
                      {header.key === "predictedIncome"
                        ? formatCurrency(item[header.key])
                        : String(item[header.key] || "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <nav className="mt-4 text-black">
        <ul className="flex justify-center items-center">
          {pageNumbers().map((number) => (
            <li key={number}>
              <button
                onClick={() => paginate(number)}
                className={`px-3 py-1 mx-1 border border-black ${
                  number === currentPage
                    ? "bg-blue-500 text-white"
                    : "hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default SelectedList;
