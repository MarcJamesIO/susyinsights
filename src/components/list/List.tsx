import React, { useState, useEffect } from "react";
import Papa from "papaparse";

interface Props {
  filters: {
    presets?: { selections: string[] };
    epc?: { min: number; max: number };
    imd?: { min: number; max: number };
    centralHeating?: { selections: string[] };
    tenure?: { selections: string[] };
    archetype?: { selections: string[] };
    income?: { selections: string[] };
  };
  onListDataChange: (data: any[]) => void; // Define a more specific type based on the actual data structure
}

interface SortConfig {
  key: string | null;
  direction: "ascending" | "descending";
}

export default function List(props: Props) {
  const [originalData, setOriginalData] = useState<any[]>([]); // Specify a more precise type if possible
  const [dummyData, setDummyData] = useState<any[]>([]); // Specify a more precise type if possible
  const [csvData, setCsvData] = useState<any[]>([]); // Specify a more precise type if possible
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });

  useEffect(() => {
    const fetchCSV = async () => {
      const response = await fetch("./EPC_AVG_PER_OA.csv");
      const csvText = await response.text();
      Papa.parse(csvText, {
        header: true,
        complete: function (results: any) {
          const data = results.data as any[]; // Specify a more precise type if possible

          setOriginalData(data);
          setCsvData(data);
          console.log(data);

          let dummyData = data.flatMap((item, i) => {
            return Array.from({ length: getRandomNumber(1, 10) }, () => ({
              OA: item.OA,
              CENTRAL_HEATING_TYPE: getRandomCentralHeatingTypes(),
              TENURE: getRandomTenureTypes(),
              PREDICTED_INCOME: getRandomNumber(10000, 60000),
              INCOME_TO_STRING: formatIncomeToPounds(item.PREDICTED_INCOME),
              SAP_RATING: getRandomNumber(1, 7),
              HEATING_TYPE: getRandomCentralHeatingTypes(),
              EPC_CURRENT: getEPCRating(getRandomNumber(0, 6)),
              IMD: getRandomNumber(1, 10),
              PROPERTY_ARCHETYPE: getPropertyArcheType(),
              ADDRESS: "N/A",
              POSTCODE: "N/A",
            }));
          });

          setDummyData(dummyData);
        },
      });
    };
    fetchCSV();
  }, []);

  useEffect(() => {
    let filteredData = dummyData;

    if (props.filters.presets && props.filters.presets.selections.length) {
      filteredData = filteredData.filter((item) => {
        const epcCurrent = item.SAP_RATING;
        const includesCentralHeatingType =
          item.CENTRAL_HEATING_TYPE.includes("Electric") ||
          item.CENTRAL_HEATING_TYPE.includes("Other");
        const isOwnerOccupied = item.TENURE.includes("Owner-Occupied");
        const imd = item.IMD;
        const predictedIncome = parseFloat(item.PREDICTED_INCOME);

        const passesPreviousFilters =
          epcCurrent >= 4 &&
          epcCurrent <= 7 &&
          includesCentralHeatingType &&
          isOwnerOccupied;

        return passesPreviousFilters && (imd < 4 || predictedIncome <= 36000);
      });
    } else {
      if (props.filters.epc) {
        const { min, max } = props.filters.epc;

        filteredData = filteredData.filter((item) => {
          const epcCurrent = item.SAP_RATING;
          return epcCurrent >= min && epcCurrent <= max;
        });
      }

      if (props.filters.imd) {
        const { min, max } = props.filters.imd;

        filteredData = filteredData.filter((item) => {
          const imdCurrent = item.IMD;
          return imdCurrent >= min && imdCurrent <= max;
        });
      }

      if (
        props.filters.centralHeating &&
        props.filters.centralHeating.selections.length
      ) {
        filteredData = filteredData.filter((item) =>
          props.filters.centralHeating?.selections.includes(
            item.CENTRAL_HEATING_TYPE
          )
        );
      }

      if (props.filters.tenure && props.filters.tenure.selections.length) {
        filteredData = filteredData.filter((item) =>
          props.filters.tenure?.selections.includes(item.TENURE)
        );
      }
      if (
        props.filters.archetype &&
        props.filters.archetype.selections.length
      ) {
        filteredData = filteredData.filter((item) =>
          props.filters.archetype?.selections.includes(item.PROPERTY_ARCHETYPE)
        );
      }
      if (props.filters.income) {
        const { selections } = props.filters.income;

        if (
          (selections.includes("36000 less") &&
            selections.includes("36000 more")) ||
          selections.length === 0
        ) {
        } else if (selections.includes("36000 less")) {
          filteredData = filteredData.filter(
            (item) => parseFloat(item.PREDICTED_INCOME) <= 36000
          );
        } else if (selections.includes("36000 more")) {
          filteredData = filteredData.filter(
            (item) => parseFloat(item.PREDICTED_INCOME) > 36000
          );
        }
      }
    }

    setCsvData(filteredData);

    props.onListDataChange(filteredData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.filters, originalData, dummyData]);

  const headers = [
    { key: "ADDRESS", label: "ADDRESS" },
    { key: "POSTCODE", label: "POSTCODE" },
    { key: "IMD", label: "IMD" },
    { key: "TENURE", label: "TENURE" },
    { key: "CENTRAL_HEATING_TYPE", label: "CENTRAL HEATING TYPE" },
    { key: "PROPERTY_ARCHETYPE", label: "PROPERTY ARCHETYPE" },
    { key: "EPC_CURRENT", label: "EPC" },
    { key: "INCOME_TO_STRING", label: "PREDICTED INCOME" },
  ];

  const requestSort = (key: any) => {
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

  const sortedData = React.useMemo(() => {
    let sortableItems = [...csvData];

    if (sortConfig.key !== null) {
      sortableItems.sort((a: any, b: any) => {
        const key = sortConfig.key as any; // Cast sortConfig.key to any to avoid type checking
        if (a[key] < b[key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[key] > b[key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [csvData, sortConfig]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = sortedData.slice(firstItemIndex, lastItemIndex);

  const pageCount = Math.ceil(sortedData.length / itemsPerPage);

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

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

  return (
    <div className="w-full px-16 md:px-4 md:pr-16">
      <div className="p-4 rounded-lg mt-8 bg-gray-100  lg:px-8 w-full">
        <h1 className="text-black font-bold">Filtered list: </h1>

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
                      onClick={() => requestSort(header.key)}
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
                        {String(item[header.key])}
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
            <li>
              <button
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1  bg-black text-white text-sm hover:bg-blue-500  disabled:opacity-50"
              >
                First
              </button>
            </li>
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 mx-1  bg-black text-white text-sm hover:bg-blue-500  disabled:opacity-50"
              >
                Previous
              </button>
            </li>
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
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === pageCount}
                className="px-3 py-1 mx-1 bg-black text-white text-sm hover:bg-blue-500 disabled:opacity-50"
              >
                Next
              </button>
            </li>
            <li>
              <button
                onClick={() => paginate(pageCount)}
                disabled={currentPage === pageCount}
                className="px-3 py-1 mx-1 bg-black text-white text-sm hover:bg-blue-500 disabled:opacity-50"
              >
                Last
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
function getRandomCentralHeatingTypes(): string {
  const heatingTypes = ["Heat Pump", "Gas", "Electric", "Other"];
  return heatingTypes[Math.floor(Math.random() * heatingTypes.length)];
}

function getRandomTenureTypes(): string {
  const tenureTypes = [
    "Owner-Occupied",
    "Rented (Social)",
    "Rented (Private)",
    "Unknown",
  ];
  return tenureTypes[Math.floor(Math.random() * tenureTypes.length)];
}

function getEPCRating(index: number): string {
  const epcRatings = ["A", "B", "C", "D", "E", "F", "G"];
  return epcRatings[index];
}

function getPropertyArcheType(): string {
  const propertyArcheTypes = [
    "Detached",
    "Semi-Detached",
    "End-Terrace",
    "Mid-Terrace",
    "Enclosed Mid-Terrace",
    "Enclosed End-Terrace",
    "Unknown",
  ];
  return propertyArcheTypes[
    Math.floor(Math.random() * propertyArcheTypes.length)
  ];
}

function formatIncomeToPounds(income: number): string {
  if (income === undefined) {
    return "N/A"; // Return "N/A" or some default value if income is undefined
  }
  return `£${income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
