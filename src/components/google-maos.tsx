"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
} from "@vis.gl/react-google-maps";

const locations = [
  { id: 1, lat: 49.2827, lng: -123.1207, label: "Room 1 - Vancouver" },
  { id: 2, lat: 49.249, lng: -123.0, label: "Room 2 - Burnaby" },
  { id: 3, lat: 49.1666, lng: -122.8497, label: "Room 3 - Surrey" },
];

export function RoomsMap() {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <Map
        defaultCenter={{ lat: 49.2827, lng: -123.1207 }}
        defaultZoom={11}
        mapId="rooms-map"
        className="w-full h-[400px] rounded-2xl"
      >
        {locations.map((loc) => (
          <AdvancedMarker
            key={loc.id}
            position={{ lat: loc.lat, lng: loc.lng }}
            title={loc.label}
          >
            <Pin background="#0ABDAD" borderColor="#09a89a" glyphColor="#fff" />
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
