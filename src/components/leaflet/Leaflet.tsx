"use client";
import React, { useEffect } from "react";
import { map, latLng, tileLayer, MapOptions, Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import Head from "next/head";
import L, { GeoJSON, LeafletEvent, PathOptions, Layer } from "leaflet";
import "./plugins/smooth-zoom"; // Correct path to your plugin

import { Feature, FeatureCollection, Geometry } from "geojson";

interface FeatureProperties {
  oa?: string;
  name?: string;
  data?: {
    oa?: string;
    total?: number;
  };
  [key: string]: any;
}

interface LeafletProps {
  listData: { oa: string; [key: string]: any }[];
  selectedLocation: number;
  filters: any;
  fetchProperties: (options: any) => Promise<any>;
}

const LeafletComponent: React.FC<LeafletProps> = ({
  listData,
  selectedLocation,
  filters,
  fetchProperties,
}: LeafletProps) => {
  useEffect(() => {
    const options: MapOptions = {
      center: latLng(51.456217, -2.587369),
      zoom: 12,
      scrollWheelZoom: false,
      smoothWheelZoom: true,
      smoothSensitivity: 12,
    };

    const mymap: LeafletMap = map("map", options);

    (mymap.options as any).smoothWheelZoom = true;
    (mymap.options as any).smoothSensitivity = 1;

    tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mymap);

    mymap.addHandler("smoothWheelZoom", (L.Map as any).SmoothWheelZoom);

    const getColor = (total?: number) => {
      if (total === undefined) {
        return "#ffffff"; // white for undefined total
      }

      switch (true) {
        case total === 0:
          return "#fcf8bb"; // yellowish
        case total > 0 && total <= 30:
          return "#fcebcf"; // light orange
        case total > 30 && total <= 60:
          return "#f2b56a"; // orange
        case total > 60 && total <= 90:
          return "#f09fa7"; // pinkish
        case total > 90 && total <= 120:
          return "#e76f68"; // reddish
        case total > 120:
          return "#f2b56a"; // orange again
        default:
          return "#f2b56a"; // default color
      }
    };

    // Function to set the style of each feature
    const geojsonStyle = (
      feature?: Feature<Geometry, FeatureProperties>
    ): PathOptions => {
      return {
        color: getColor(feature?.properties.data?.total),
        weight: 0.5,
        opacity: 1,
      };
    };

    const highlightFeature = (e: LeafletEvent) => {
      const layer = e.target as L.Path;
      layer.setStyle({
        weight: 5,
        color: "#666",
        dashArray: "",
        fillOpacity: 0.7,
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
    };

    const resetHighlight = (e: LeafletEvent) => {
      const layer = e.target as L.Path;
      geojsonLayer.resetStyle(layer);
    };

    const zoomToFeature = (e: LeafletEvent) => {
      const layer = e.target as Layer;
      if ((layer as any).getBounds) {
        mymap.fitBounds((layer as L.Polygon).getBounds());
      }
    };

    const onEachFeature = (
      feature: Feature<Geometry, FeatureProperties>,
      layer: Layer
    ) => {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature,
      });

      if (feature.properties && feature.properties.name) {
        layer.bindPopup(feature.properties.name);
      }
    };

    let geojsonLayer: GeoJSON<any>;

    fetch("/OA_2021_Bristol.geojson")
      .then((response) => response.json())
      .then((data: FeatureCollection<Geometry, FeatureProperties>) => {
        console.log("GeoJSON Data:", data);
        // Check if data is valid
        if (!data || !data.features) {
          throw new Error("Invalid GeoJSON data");
        }
        // Update features before adding to map
        data.features.forEach((feature) => {
          const oaCodeFeature = feature.properties.OA21CD?.trim().toUpperCase();
          const matchingRecord = listData.find(
            (record) => record.oa.trim().toUpperCase() === oaCodeFeature
          );

          if (matchingRecord) {
            feature.properties.data = matchingRecord;
          }
        });

        geojsonLayer = L.geoJSON(data, {
          style: geojsonStyle,
          onEachFeature: onEachFeature,
        }).addTo(mymap);
      })
      .catch((error) => console.error("Error loading GeoJSON data:", error));

    return () => {
      mymap.remove();
    };
  }, [listData, selectedLocation, filters]);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
      </Head>
      <div className="w-full h-full relative w-full px-16 md:px-4 md:pr-16">
        <div
          id="map"
          style={{ height: "700px", width: "100%" }}
          className="shadow-lg mt-8"
        ></div>
      </div>
    </>
  );
};

export default LeafletComponent;
