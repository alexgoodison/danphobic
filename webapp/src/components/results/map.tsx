"use client";

import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
  ScaleControl,
} from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { LogAnalysisReport } from "@/types";
import { useState } from "react";

export default function MapComponent({ report }: { report: LogAnalysisReport }) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [popupInfo, setPopupInfo] = useState<{
    id: string;
    latitude: number;
    longitude: number;
    city: string;
    country: string;
    isp: string;
    request_count: number;
  } | null>(null);

  return (
    <div className="overflow-hidden">
      <div className="mb-2 font-semibold">Map</div>
      <Map
        mapboxAccessToken={mapboxToken}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: "100%", height: 400, borderRadius: "0.75rem" }}
        initialViewState={{ latitude: 39.8283, longitude: -98.5795, zoom: 0 }}
        maxZoom={20}
        minZoom={3}>
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {report.map_markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            longitude={marker.longitude}
            latitude={marker.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopupInfo(marker);
            }}>
            <div className="flex flex-col items-center justify-center bg-pink-500 rounded-full p-2 shadow-md">
              <div className="text-xs font-bold text-white">{marker.request_count}</div>
            </div>
          </Marker>
        ))}
        {popupInfo && (
          <Popup
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            anchor="bottom"
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}>
            <div className="p-2">
              <div className="font-semibold">{popupInfo.id}</div>
              <div className="text-sm text-gray-500">
                Request Count: {popupInfo.request_count}
              </div>
              <div className="text-sm text-gray-500">
                {popupInfo.city}, {popupInfo.country}
              </div>
              <div className="text-sm text-gray-500">{popupInfo.isp}</div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
