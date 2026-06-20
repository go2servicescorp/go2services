"use client";

import "../lib/leaflet-config";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function VancouverMap() {
  return (
    <MapContainer
      center={[49.283, -123.121]}
      zoom={14}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap"
      />

      <Marker position={[49.2866, -123.1368]}>
        <Popup>West End</Popup>
      </Marker>

      <Marker position={[49.2827, -123.1207]}>
        <Popup>Downtown</Popup>
      </Marker>

      <Marker position={[49.2796, -123.1035]}>
        <Popup>Chinatown</Popup>
      </Marker>

      <Marker position={[49.2913, -123.125]}>
        <Popup>Coal Harbour</Popup>
      </Marker>
    </MapContainer>
  );
}
