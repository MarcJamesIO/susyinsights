import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import KeySlider from "../keyslider/KeySlider";
import LoadingPanel from "../loading-panel/LoadingPanel";
import ListPanel from "../list-panel/ListPanel";
import { AnimatePresence, motion } from "framer-motion";
import { UseSelectedPropertiesStore } from "@/stores/UseSelectedPropertiesStore";
import { useFilterStore } from "@/stores/UseFilterStore";
import SelectedList from "../list/SelectedList";
import * as turf from "@turf/turf";
import { Geometry } from "geojson";

const showUK = false;

interface OaCountDataItem {
  oa: string;
  total: number;
}

interface MapProps {
  listData: any;
  selectedLocation: number;
  oaCountData: OaCountDataItem[];
  filters: any;
  fetchProperties: (options: any) => Promise<any>;
  setListsOpen: (value: boolean) => void;
  setShowLoading: (value: boolean) => void;
  showLoading: boolean;
  firstLoadCount: number;
  setFirstLoadCount: (value: number) => void;
}

const colors = [
  "#FFF2F2",
  "#F6E3F2",
  "#C9C2E4",
  "#5D61B6",
  "#353EA4",
  "#202562",
];

const hoverColor = "#744EC5";

const Map: React.FC<MapProps> = ({
  listData,
  selectedLocation,
  filters,
  fetchProperties,
  setListsOpen,
  oaCountData,
  setShowLoading,
  showLoading,
  firstLoadCount,
  setFirstLoadCount,
}) => {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState<string>("");
  const [selectedFeatures, setSelectedFeatures] = useState<
    Record<string, boolean>
  >({});
  const [selectedList, setSelectedList] = useState<string[]>([]);
  const [filtersApplied, setFiltersApplied] = useState<boolean>(false);
  const [matchedGeoCodes, setMatchedGeoCodes] = useState<string[]>([]);
  const [unmatchedGeoCodes, setUnmatchedGeoCodes] = useState<string[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [openListPanel, setOpenListPanel] = useState<boolean>(false);
  const [listDataLength, setListDataLength] = useState<number>(0);
  const [intervals, setIntervals] = useState<number[]>([]);
  const [maxProperties, setMaxProperties] = useState<number>(0);
  const [currentHoveredCount, setCurrentHoveredCount] = useState<number>(0);

  let idleProcessed = false;
  const addProperties = UseSelectedPropertiesStore(
    (state) => state.addProperties
  );
  const removeProperties = UseSelectedPropertiesStore(
    (state) => state.removeProperties
  );
  const clearProperties = UseSelectedPropertiesStore(
    (state) => state.clearProperties
  );
  const selectedProperties = UseSelectedPropertiesStore(
    (state) => state.selectedProperties
  );
  const totalSelectedProperties = UseSelectedPropertiesStore(
    (state) => state.totalSelectedProperties
  );

  const latestSelectedFeatures = useRef(selectedFeatures);

  useEffect(() => {
    latestSelectedFeatures.current = selectedFeatures;
  }, [selectedFeatures]);

  useEffect(() => {
    console.log("OACOUNT DATA", oaCountData);
    const maxProperties = getMaxProperties(oaCountData);
    const intervals = generateColorIntervals(maxProperties, 6);
    setMaxProperties(maxProperties);
    setIntervals(intervals);
  }, [oaCountData]);

  mapboxgl.accessToken =
    "pk.eyJ1IjoibWFyY3N1c3kiLCJhIjoiY2xzMWsyaWliMDl6MjJzbWs0ejFxZXg4YyJ9.W_WMmSrIenJdMNSzP6WoEw";

  const getMaxProperties = (data: OaCountDataItem[]) => {
    const max = data.reduce((max, item) => Math.max(max, item.total), 0);
    console.log("Max properties calculated:", max);
    return max;
  };

  const generateColorIntervals = (maxValue: number, intervals: number) => {
    const step = Math.ceil(maxValue / intervals);
    const intervalsArray = Array.from(
      { length: intervals },
      (_, i) => step * (i + 1)
    );
    console.log("Color intervals generated:", intervalsArray);
    return intervalsArray;
  };

  const getColorBasedOnCount = (count: number) => {
    if (count === 0) return colors[0];
    if (count <= intervals[0]) return colors[1];
    if (count <= intervals[1]) return colors[2];
    if (count <= intervals[2]) return colors[3];
    if (count <= intervals[3]) return colors[4];
    if (count <= intervals[4]) return colors[5];
    return colors[5];
  };

  useEffect(() => {
    if (
      !mapContainerRef.current ||
      maxProperties === 0 ||
      intervals.length === 0
    )
      return;

    setFirstLoadCount(firstLoadCount + 1);

    console.log("Creating map");
    let _center = [-2.587369, 51.456217] as [number, number];
    let _zoom = 10.5;

    if (showUK) {
      _center = [-4.204895, 53.816736];
      _zoom = 5.6;
    }
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/marcsusy/cly5z6gn600cv01pnahlk379i",
      center: _center,
      zoom: _zoom,
    });

    if (firstLoadCount > 0) {
      mapRef.current.on("load", () => {
        console.log("Map loaded");

        mapRef.current?.addSource("city-boundaries", {
          type: "vector",
          url: "mapbox://marcsusy.3mw4sw1t",
        });

        mapRef.current?.addSource("district-boundaries", {
          type: "vector",
          url: "mapbox://marcsusy.107b323f",
        });

        mapRef.current?.addSource("WECA-boundaries", {
          type: "vector",
          url: "mapbox://marcsusy.5rfq8m6c",
        });

        if (showUK) {
          mapRef.current?.addSource("counties", {
            type: "vector",
            url: "mapbox://marcsusy.3oglf06p",
          });
        }

        mapRef.current?.addLayer(
          {
            id: "heatmap-layer",
            type: "fill",
            source: "city-boundaries",
            "source-layer": "reprojected_OA_w_ids",
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                hoverColor,
                ["boolean", ["feature-state", "selected"], false],
                hoverColor,
                ["==", ["feature-state", "count"], null],
                colors[0],
                ["<=", ["feature-state", "count"], intervals[0]],
                colors[0],
                ["<=", ["feature-state", "count"], intervals[1]],
                colors[1],
                ["<=", ["feature-state", "count"], intervals[2]],
                colors[2],
                ["<=", ["feature-state", "count"], intervals[3]],
                colors[3],
                [">", ["feature-state", "count"], intervals[4]],
                colors[4],
                colors[5],
              ],
              "fill-opacity": [
                "case",
                ["==", ["feature-state", "count"], null],
                0.1,
                ["==", ["feature-state", "count"], 0],
                0,
                0.9, // Default value to avoid undefined
              ],
            },
            filter: ["==", "$type", "Polygon"],
          },
          "road-simple"
        );

        mapRef.current?.addLayer(
          {
            id: "heatmap-border-layer",
            type: "line",
            source: "city-boundaries",
            "source-layer": "reprojected_OA_w_ids",
            paint: {
              "line-color": "#F6E3F2",
              "line-width": 1,
              "line-opacity": [
                "case",
                ["==", ["feature-state", "count"], 0], // Check if count is 0
                0, // If count is 0, make the border fully transparent
                ["boolean", ["feature-state", "selected"], false], // If selected, fully opaque
                1,
                1, // Default opacity for non-selected features
              ],
            },
            filter: ["==", "$type", "Polygon"],
          },
          "road-simple"
        );

        mapRef.current?.addLayer({
          id: "hover-outline",
          type: "line",
          source: "city-boundaries",
          "source-layer": "reprojected_OA_w_ids",
          paint: {
            "line-color": "#ffffff",
            "line-width": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              3,
              0,
            ],
            "line-opacity": [
              "case",
              ["boolean", ["feature-state", "hover"], false],
              1,
              0,
            ],
          },
          filter: ["==", "$type", "Polygon"],
        });

        mapRef.current?.addLayer({
          id: "border-layer",
          type: "line",
          source: "city-boundaries",
          "source-layer": "reprojected_OA_w_ids",
          paint: {
            "line-color": "#FF8080",
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

        mapRef.current?.addLayer(
          {
            id: "buildings",
            source: "composite",
            "source-layer": "building",
            type: "fill",
            minzoom: 14,
            paint: {
              "fill-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false], // Optional hover color logic
                hoverColor,
                ["boolean", ["feature-state", "selected"], false], // Optional selected color logic
                hoverColor,
                ["==", ["feature-state", "count"], null],
                colors[0],
                ["==", ["feature-state", "count"], intervals[0]],
                colors[1],
                ["<=", ["feature-state", "count"], intervals[1]],
                colors[2],
                ["<=", ["feature-state", "count"], intervals[2]],
                colors[3],
                ["<=", ["feature-state", "count"], intervals[3]],
                colors[4],
                [">", ["feature-state", "count"], intervals[4]],
                colors[5],
                colors[5], // Default color
              ],
              "fill-opacity": [
                "case",
                ["==", ["feature-state", "count"], null],
                0.1,
                ["==", ["feature-state", "count"], 0],
                0,
                1, // Default value to avoid undefined
              ],
            },
          },
          "road-simple"
        );

        mapRef.current?.addLayer({
          id: "WECA-border-layer",
          type: "line",
          source: "WECA-boundaries",
          "source-layer": "WECA_w_ids",
          paint: {
            "line-color": "#5D61B6",
            "line-width": 1,
            "line-opacity": 1,
          },
          filter: ["==", "$type", "Polygon"],
        });

        if (showUK) {
          mapRef.current?.addLayer(
            {
              id: "counties-layer",
              type: "fill",
              source: "counties",
              "source-layer": "lad_w_ids", // Make sure this matches your tileset's source layer
              paint: {
                "fill-color": [
                  "case",
                  ["boolean", ["feature-state", "hover"], false], // If hovered
                  "#C9C2E4", // Use hoverColor when hovered

                  // Default color logic
                  ["get", "susycolor"], // Otherwise, use 'susycolor' property
                ],
                "fill-opacity": 0.6,
              },
              filter: ["==", "$type", "Polygon"],
            },
            "settlement-subdivision-label"
          );

          mapRef.current?.addLayer(
            {
              id: "counties-border-layer",
              type: "line",
              source: "counties",
              "source-layer": "lad_w_ids",
              paint: {
                "line-color": "#202562",
                "line-width": 1,
                "line-opacity": [
                  "case",
                  ["boolean", ["feature-state", "selected"], false],
                  1,
                  1,
                ],
              },
              filter: ["==", "$type", "Polygon"],
            },
            "settlement-subdivision-label"
          );
        }

        mapRef.current?.on("idle", () => {
          if (idleProcessed) return;
          idleProcessed = true;
          setTotalProperties(0);
          const features = mapRef.current?.queryRenderedFeatures(undefined, {
            layers: ["heatmap-layer"],
          });

          const buildingFeatures = mapRef.current?.queryRenderedFeatures(
            undefined,
            {
              layers: ["buildings"],
            }
          );

          features?.forEach((feature) => {
            const oaCodeFeature =
              feature.properties?.OA21CD?.trim().toUpperCase() ?? "";
            const matchingRecord = oaCountData.find(
              (record) => record.oa.trim().toUpperCase() === oaCodeFeature
            );
            if (matchingRecord) {
              const count = matchingRecord.total;
              const color = getColorBasedOnCount(count);

              setTotalProperties((prevTotal) => {
                const newTotal = prevTotal + matchingRecord.total;
                return newTotal;
              });

              mapRef.current?.setFeatureState(
                {
                  source: "city-boundaries",
                  sourceLayer: "reprojected_OA_w_ids",
                  id: feature.id,
                },
                { count, color }
              );

              // buildingFeatures?.forEach((buildingFeature) => {
              //   if (
              //     turf.booleanIntersects(
              //       buildingFeature.geometry as Geometry,
              //       feature.geometry as Geometry
              //     )
              //   ) {
              //     console.log("Building feature intersects with OA feature");
              //     mapRef.current?.setFeatureState(
              //       {
              //         source: "composite",
              //         sourceLayer: "building",
              //         id: buildingFeature.id,
              //       },
              //       { count }
              //     );
              //   }
              // });
            } else {
              mapRef.current?.setFeatureState(
                {
                  source: "city-boundaries",
                  sourceLayer: "reprojected_OA_w_ids",
                  id: feature.id,
                },
                { count: 0, color: "#FFF2F2" }
              );
            }
          });

          setShowLoading(false);
          setMatchedGeoCodes(
            features?.map(
              (feature) =>
                feature.properties?.OA21CD?.trim().toUpperCase() ?? ""
            ) || []
          );
          setUnmatchedGeoCodes(
            features
              ?.filter(
                (feature) =>
                  !oaCountData.find(
                    (record) =>
                      record.oa.trim().toUpperCase() ===
                      feature.properties?.OA21CD?.trim().toUpperCase()
                  )
              )
              .map(
                (feature) =>
                  feature.properties?.OA21CD?.trim().toUpperCase() ?? ""
              ) || []
          );
        });

        let hoveredStateId: string | null = null;

        mapRef.current?.on("mousemove", "heatmap-layer", (e) => {
          if (!mapRef.current) return;
          if (e.features && e.features.length > 0) {
            if (hoveredStateId !== null) {
              mapRef.current.setFeatureState(
                {
                  source: "city-boundaries",
                  sourceLayer: "reprojected_OA_w_ids",
                  id: hoveredStateId,
                },
                { hover: false }
              );
            }
            hoveredStateId = e.features[0].id as string;

            mapRef.current.setFeatureState(
              {
                source: "city-boundaries",
                sourceLayer: "reprojected_OA_w_ids",
                id: hoveredStateId,
              },
              { hover: true }
            );

            const count = e.features[0].state.count;

            setCurrentHoveredCount(count);
          }
        });

        mapRef.current?.on("mouseleave", "heatmap-layer", () => {
          if (!mapRef.current) return;
          if (hoveredStateId !== null) {
            mapRef.current.setFeatureState(
              {
                source: "city-boundaries",
                sourceLayer: "reprojected_OA_w_ids",
                id: hoveredStateId,
              },
              { hover: false }
            );
          }
          hoveredStateId = null;
          setCurrentHoveredCount(0);
        });

        if (showUK) {
          mapRef.current?.on("mousemove", "counties-layer", (e) => {
            if (!mapRef.current) return;
            if (e.features && e.features.length > 0) {
              if (hoveredStateId !== null) {
                mapRef.current.setFeatureState(
                  {
                    source: "counties",
                    sourceLayer: "lad_w_ids",
                    id: hoveredStateId,
                  },
                  { hover: false }
                );
              }
              hoveredStateId = e.features[0].id as string;

              mapRef.current.setFeatureState(
                {
                  source: "counties",
                  sourceLayer: "lad_w_ids",
                  id: hoveredStateId,
                },
                { hover: true }
              );

              const name = e.features[0].properties?.LAD13NM;

              console.log("Hovered county:", name);
            }
          });

          mapRef.current?.on("mouseleave", "counties-layer", () => {
            if (!mapRef.current) return;
            if (hoveredStateId !== null) {
              mapRef.current.setFeatureState(
                {
                  source: "counties",
                  sourceLayer: "lad_w_ids",
                  id: hoveredStateId,
                },
                { hover: false }
              );
            }
            hoveredStateId = null;
          });
        }
        mapRef?.current?.on("click", "heatmap-layer", handleClick);

        clearSelection();
        setListDataLength(listData.length);
      });
    }

    setTimeout(() => {
      setShowLoading(false);
    }, 1000);
    return () => {
      mapRef.current?.off("idle", () => {
        idleProcessed = true;
      });
      mapRef.current?.remove();
    };
  }, [intervals, maxProperties, filtersApplied]);

  const handleClick = useCallback(
    async (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
      if (!e.features || !e.features.length || !mapRef.current) return;

      const feature = e.features[0];
      const oaCodeFeature = feature.properties?.OA21CD?.trim().toUpperCase();
      const featureId = feature.id as string;

      setSelectedFeatures((prevSelectedFeatures) => {
        const isSelected = !prevSelectedFeatures[featureId];
        const newSelectedFeatures = {
          ...prevSelectedFeatures,
          [featureId]: isSelected,
        };

        mapRef.current?.setFeatureState(
          {
            source: "city-boundaries",
            sourceLayer: "reprojected_OA_w_ids",
            id: featureId,
          },
          { selected: isSelected }
        );

        return newSelectedFeatures;
      });

      console.log(
        `Feature ${oaCodeFeature} clicked. Selected: ${!latestSelectedFeatures
          .current[featureId]}`
      );

      const isSelected = !latestSelectedFeatures.current[featureId];
      if (isSelected) {
        const f = useFilterStore.getState().filters;
        try {
          const selectedData = await fetchProperties({
            endpoint: "by-params",
            oa: oaCodeFeature,
            page: 0,
            pageSize: 1000,
            filters: f,
          });
          console.log("Selected data:", selectedData);

          if (selectedData.data?.items.length > 0) {
            addProperties(selectedData.data.items);
            setSelectedList((prevSelectedList) => [
              ...prevSelectedList,
              oaCodeFeature,
            ]);
          }
        } catch (error) {
          console.error("Error fetching properties:", error);
        }
      } else {
        removeProperties(oaCodeFeature);
        setSelectedList((prevSelectedList) =>
          prevSelectedList.filter((code) => code !== oaCodeFeature)
        );
      }
    },
    [fetchProperties, addProperties, removeProperties]
  );

  const clearSelection = useCallback(() => {
    Object.keys(selectedFeatures).forEach((featureId) => {
      if (selectedFeatures[featureId]) {
        mapRef.current?.setFeatureState(
          {
            source: "city-boundaries",
            sourceLayer: "reprojected_OA_w_ids",
            id: featureId,
          },
          { selected: false }
        );
      }
    });

    clearProperties();
    setSelectedList([]);
    setSelectedText("");
    setSelectedFeatures({});
    console.log("Selection cleared");
  }, [selectedFeatures, clearProperties]);

  return (
    <div className="relative cursor-pointer">
      <div className="relative w-full">
        <div
          className="relative h-full w-full mb-6 overflow-hidden"
          ref={mapContainerRef}
          style={{ height: "100vh", width: "" }}
        >
          {filtersApplied && (
            <div className="absolute w-full flex justify-center bottom-6">
              <KeySlider value={totalSelectedProperties} text={selectedText} />
            </div>
          )}
          {showLoading && <LoadingPanel loadingText="Fetching data..." />}
        </div>

        <div className="w-full">
          {/* <SelectedList listData={selectedProperties} /> */}
        </div>
      </div>

      {firstLoadCount > 1 && (
        <div className="absolute bg-white z-100 top-4 right-12 text-black flex gap-4 justify-start mt-10 mb-4 p-8 rounded-sm flex-col w-70 shadow-lg max-w-[300px]">
          <h2 className="mb-2 text-base">
            There are <strong>{totalProperties} total properties</strong> in
            this area.
            <br />
            {selectedList.length > 0 && (
              <div className="flex flex-col w-full mt-4">
                <p className="text-base">
                  {selectedProperties.length} properties selected
                </p>

                <a
                  className="font-bold underline text-susyBlue text-base"
                  href="#"
                  onClick={clearSelection}
                >
                  Clear Selection
                </a>
              </div>
            )}
            <br />
            Number of <strong>properties per OA:</strong>
          </h2>
          <div className="w-full flex flex-col mb-4">
            <div className="w-full flex flex-row items-center mb-4">
              <div
                className={`bg-gray-300 rounded-full w-[18px] h-[18px] mr-4 transition-transform duration-200 ${
                  currentHoveredCount === 0 || currentHoveredCount == null
                    ? "transform scale-150"
                    : ""
                }`}
              ></div>
              <p
                className={`text-gray-500 ${
                  currentHoveredCount === 0 || currentHoveredCount == null
                    ? "font-bold"
                    : ""
                }`}
              >
                No data
              </p>
            </div>

            {intervals.map((interval, index) => {
              const previousInterval = index > 0 ? intervals[index - 1] + 1 : 0; // Add 1 to the previous interval to avoid overlap
              const isCurrentHovered =
                currentHoveredCount > previousInterval &&
                currentHoveredCount <= interval;

              return (
                <div
                  key={index}
                  className="w-full flex flex-row items-center mb-4"
                >
                  <div
                    style={{ backgroundColor: colors[index] }}
                    className={`rounded-full w-[18px] h-[18px] mr-4 transition-transform duration-200 ${
                      isCurrentHovered ? "transform scale-150" : ""
                    }`}
                  ></div>
                  <p
                    className={`text-gray-500 ${
                      isCurrentHovered ? "font-bold" : ""
                    }`}
                  >
                    {isCurrentHovered
                      ? currentHoveredCount
                      : `${previousInterval} - ${interval}`}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mb-4 flex-col flex md:mb-0 md:items-center">
            <button
              onClick={() => setOpenListPanel(true)}
              className="bg-susyPink text-susyNavy w-full py-3 rounded font-normal hover:bg-susyLightPink"
            >
              Create a list
            </button>
          </div>
        </div>
      )}
      <AnimatePresence>
        {openListPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black w-full h-full z-50 pointer-events-none"
          ></motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openListPanel && (
          <motion.div
            key="listPanel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4 }}
            className="fixed overflow-hidden top-0 left-0 w-full h-full z-50 flex justify-end"
          >
            <ListPanel
              handleClose={() => setOpenListPanel(false)}
              selectedList={selectedProperties}
              fullListCount={totalProperties}
              setListsOpen={setListsOpen}
              filters={filters}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Map;
