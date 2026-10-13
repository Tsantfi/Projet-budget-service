import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Correctif standard : Leaflet ne trouve pas ses icones par defaut une fois bundle par Vite.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Centre par defaut : Mahajanga, region Boeny.
const DEFAULT_CENTER = [-15.7167, 46.3167];

export default function MapPicker({ latitude, longitude, onChange, height = 280 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) return;

    const hasPoint = latitude != null && longitude != null;
    const initialCenter = hasPoint ? [latitude, longitude] : DEFAULT_CENTER;

    const map = L.map(containerRef.current).setView(initialCenter, hasPoint ? 14 : 8);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    function placeMarker(lat, lng) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current.getLatLng();
          onChange(pos.lat, pos.lng);
        });
      }
    }

    if (hasPoint) {
      placeMarker(latitude, longitude);
    }

    map.on("click", (e) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      onChange(e.latlng.lat, e.latlng.lng);
    });

    // Vite/Tailwind peuvent monter la carte dans un conteneur pas encore
    // dimensionne (ex: modale) : on force un recalcul de la taille.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-lg overflow-hidden border border-gray-200"
    />
  );
}