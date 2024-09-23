"use client";
import React, { useEffect, useRef, useMemo, useState } from "react";
import mapboxgl from "mapbox-gl";
import KeySlider from "../keyslider/KeySlider";
import { CSVLink, CSVDownload } from "react-csv";
import SelectedList from "../list/SelectedList";

const tilesets = ["mapbox://marcsusy.dnu93okr"];

const sourceLayers = ["Bristol-7d2owf"];

interface MapProps {
  listData: any[]; // You should define a more specific type based on the structure of listData items
  selectedLocation: number;
  filters: any; // Define a specific type for filters if possible
}

const Map: React.FC<MapProps> = ({ listData, selectedLocation, filters }) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [hoverText, setHoverText] = useState<string>("");
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, boolean>
  >({});
  const [selectedList, setSelectedList] = useState<any[]>([]); // Define a specific type if possible
  const [totalSelectedProperties, setTotalSelectedProperties] =
    useState<number>(0);
  const [selectedProperties, setSelectedProperties] = useState<any[]>([]); // Define a specific type if possible
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
  const [mapIdleCounter, setMapIdleCounter] = useState<number>(0);
  const [mouseX, setMouseX] = useState<number>(0);

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFyY3N1c3kiLCJhIjoiY2xzMWsyaWliMDl6MjJzbWs0ejFxZXg4YyJ9.W_WMmSrIenJdMNSzP6WoEw";

  useEffect(() => {
    if (listData && listData.length > 0) {
      console.log("listData is ready");
    }
  }, [listData]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-2.587369, 51.456217],
      zoom: 12,
      pitch: 0,
    });

    mapRef.current.doubleClickZoom.disable();

    mapRef.current.on("load", function () {
      const sourceId = "city-boundaries";
      mapRef.current?.addSource(sourceId, {
        type: "vector",
        url: tilesets[0],
      });

      mapRef.current?.addLayer({
        id: "heatmap-layer",
        type: "fill",
        source: sourceId,
        "source-layer": sourceLayers[0],
        paint: {
          "fill-color": [
            "case",
            ["==", ["feature-state", "count"], 0],
            "#fcf8bb",
            ["<=", ["feature-state", "count"], 3],
            "#fcebcf",
            ["<=", ["feature-state", "count"], 6],
            "#f2b56a",
            ["<=", ["feature-state", "count"], 9],
            "#f09fa7",
            [">", ["feature-state", "count"], 9],
            "#e76f68",
            "#f2b56a",
          ],
          "fill-opacity": [
            "case",
            ["==", ["feature-state", "count"], 0],
            0,
            ["boolean", ["feature-state", "count"], false],
            0,
            0.4,
          ],
        },
        filter: ["==", "$type", "Polygon"],
      });

      mapRef.current?.addLayer({
        id: "border-layer",
        type: "line",
        source: sourceId,
        "source-layer": sourceLayers[0],
        paint: {
          "line-color": "#000000",
          "line-width": 3,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            1,
            0,
          ],
        },
        filter: ["==", "$type", "Polygon"],
      });

      mapRef.current?.addLayer({
        id: "default-border-layer",
        type: "line",
        source: sourceId,
        "source-layer": sourceLayers[0],
        paint: {
          "line-color": "#8E41C7",
          "line-width": 1,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "selected"], false],
            1,
            0,
          ],
        },
        filter: ["==", "$type", "Polygon"],
      });

      console.log("Map loaded");
    });

    let initalStyleApplied = false;
    mapRef.current?.on("idle", function () {
      if (!initalStyleApplied) {
        const features = mapRef.current?.queryRenderedFeatures(undefined, {
          layers: ["heatmap-layer"],
        });

        features?.forEach((feature) => {
          mapRef.current?.setFeatureState(
            {
              source: "city-boundaries",
              sourceLayer: sourceLayers[0],
              id: feature.id,
            },
            { count: 0 }
          );
        });

        initalStyleApplied = true;
      }

      setMapIdleCounter((prevCounter) => prevCounter + 1);
    });

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (!listData || listData.length === 0) {
      console.log("No data ready yet.");
      return;
    }

    console.log("List data ready");

    if (Object.keys(filters).length === 0) {
      setFiltersApplied(false);
    } else {
      if (
        filters.archetype.selections.length == 0 &&
        filters.centralHeating.selections.length == 0 &&
        filters.income.selections.length == 0 &&
        filters.presets.selections.length == 0 &&
        filters.tenure.selections.length == 0 &&
        filters.epc.min == 1 &&
        filters.epc.max == 7 &&
        filters.imd.min == 1 &&
        filters.imd.max == 10
      ) {
        setFiltersApplied(false);
      } else {
        setFiltersApplied(true);
      }
    }

    if (mapRef.current && mapRef.current.isStyleLoaded()) {
      const features = mapRef.current.queryRenderedFeatures(undefined, {
        layers: ["heatmap-layer"],
      });

      features.forEach((feature) => {
        const oaCodeFeature = feature.properties
          ? feature.properties["geo_code"].trim().toUpperCase()
          : "";

        const matchingRecords = listData.filter(
          (record) => record.OA.trim().toUpperCase() === oaCodeFeature
        );

        let count = 0;

        if (filtersApplied) count = matchingRecords.length;

        const matchingRecord = listData.find(
          (record) => record.OA.trim().toUpperCase() === oaCodeFeature
        );

        if (matchingRecord !== undefined) {
          mapRef.current?.setFeatureState(
            {
              source: "city-boundaries",
              sourceLayer: sourceLayers[0],
              id: feature.id,
            },
            { count: count }
          );
        } else {
          mapRef.current?.setFeatureState(
            {
              source: "city-boundaries",
              sourceLayer: sourceLayers[0],
              id: feature.id,
            },
            { count: 0 }
          );
        }
      });
    } else {
    }
  }, [listData, filters, filtersApplied, mouseX]);

  // useEffect(() => {
  //   const onMouseMove = (e: any) => {
  //     setMouseX(e.point.x);
  //   };

  //   mapRef.current?.on("mousemove", onMouseMove);

  //   return () => {
  //     mapRef.current?.off("mousemove", onMouseMove);
  //   };
  // }, []);

  // useEffect(() => {
  //   let lastZoom = mapRef.current?.getZoom() || 0;

  //   mapRef.current?.on("zoom", () => {
  //     const currentZoom = mapRef.current?.getZoom() || 0;
  //     if (currentZoom > lastZoom) {
  //     } else {
  //       // zoom out
  //     }
  //     setMouseX((prevMouseX) => prevMouseX + 1);
  //     lastZoom = currentZoom;

  //   });
  // }, []);

  useEffect(() => {
    const handleClick = (e: any) => {
      if (e.features.length) {
        const feature = e.features[0];
        const oaCodeFeature = feature.properties["geo_code"];
        const featureId = feature.id;

        setSelectedFeatures((prevSelectedFeatures) => {
          const isSelected = !prevSelectedFeatures[featureId];
          const newSelectedFeatures = {
            ...prevSelectedFeatures,
            [featureId]: isSelected,
          };

          mapRef.current?.setFeatureState(
            {
              source: "city-boundaries",
              sourceLayer: sourceLayers[0],
              id: featureId,
            },
            { selected: isSelected }
          );

          setSelectedList((prevSelectedList) => {
            const filteredList = listData.filter(
              (record) => record.OA.trim().toUpperCase() === oaCodeFeature
            );
            return isSelected
              ? [...prevSelectedList, ...filteredList].filter(
                  (v, i, a) => a.findIndex((t) => t.OA === v.OA) === i
                )
              : prevSelectedList.filter(
                  (record) => record.OA.trim().toUpperCase() !== oaCodeFeature
                );
          });

          return newSelectedFeatures;
        });
      }
    };

    mapRef.current?.on("click", "heatmap-layer", handleClick);

    return () => {
      mapRef.current?.off("click", "heatmap-layer", handleClick);
    };
  }, [listData, selectedList]);

  const clearSelection = () => {
    Object.keys(selectedFeatures).forEach((featureId) => {
      if (selectedFeatures[featureId]) {
        mapRef.current?.setFeatureState(
          {
            source: `city-boundaries${0}`,
            sourceLayer: sourceLayers[0],
            id: featureId,
          },
          { selected: false }
        );
      }
    });

    setSelectedList([]);
    setSelectedProperties([]);
    setSelectedText("");
    setSelectedFeatures({});
    setTotalSelectedProperties(0);
  };

  useEffect(() => {
    const matchedRecords = listData.filter((record) =>
      selectedList.some(
        (selectedItem) =>
          selectedItem.OA.trim().toUpperCase() ===
          record.OA.trim().toUpperCase()
      )
    );

    const newArray = [...matchedRecords];

    setSelectedProperties(newArray);

    const totalHouseCount = newArray.length;

    setTotalSelectedProperties(totalHouseCount);

    const newText = `Selected ${totalHouseCount} properties from ${selectedList.length} Output Areas.`;

    setSelectedText(newText);
  }, [selectedList, listData]);

  // useEffect(() => {
  //   const center = locationLats[selectedLocation];
  //   mapRef.current?.flyTo({
  //     center: center,
  //     essential: true,
  //     speed: 1,
  //   });
  // }, [selectedLocation]);

  useEffect(() => {}, [selectedList]);

  return (
    <div className="relative w-full px-16 md:px-4 md:pr-16">
      <div className="w-full text-black flex flex-col md:flex-row gap-4 justify-start mt-10 mb-4 md:items-end md:justify-between">
        <h2 className="mb-2">
          <strong>Map of filtered results</strong> ({listData.length}
          &nbsp;properties)&nbsp;&nbsp;
          {selectedList.length > 0 && (
            <a
              className="font-bold underline text-susyBlue"
              href="#"
              onClick={clearSelection}
            >
              Clear Selection
            </a>
          )}
        </h2>

        <div className="mb-4 flex-col flex md:flex-row md:mb-0 md:items-center">
          {" "}
          <CSVLink
            className="bg-susyPink text-susyNavy px-12 py-4 text-sm hover:susyLightPink mb-4 font-medium md:mr-6 md:mb-0 text-center hover:bg-susyLightPink"
            data={listData}
            filename={"PRAHEP-filtered-list.csv"}
          >
            Download Filtered Data
          </CSVLink>
          <CSVLink
            className="bg-susyPink text-susyNavy px-12 py-4 text-sm hover:susyLightPink font-medium text-center hover:bg-susyLightPink"
            data={selectedProperties}
            style={
              selectedList.length > 0
                ? { pointerEvents: "auto" }
                : {
                    backgroundColor: "gray",
                    color: "lightgrey",
                    pointerEvents: "none",
                  }
            }
            filename={"PRAHEP-selected-list.csv"}
          >
            Download Selected Data
          </CSVLink>
        </div>
      </div>

      <div
        className="relative h-full w-full mb-6 bg-red-500"
        ref={mapContainerRef}
        style={{ height: "60vh", width: "100%" }}
      >
        {filtersApplied && (
          <div className="absolute w-full flex justify-center bottom-6">
            {" "}
            {<KeySlider value={totalSelectedProperties} text={selectedText} />}
          </div>
        )}
      </div>

      <SelectedList listData={selectedProperties} />
    </div>
  );
};

export default Map;
