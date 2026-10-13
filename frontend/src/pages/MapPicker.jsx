import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// CORRECTION DE L'ICÔNE LEAFLET

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",

  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",

  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// COMPOSANT POUR DETECTER LE CLIC SUR LA CARTE

function LocationMarker({ position, setPosition, onChange }) {
  useMapEvents({
    click(e) {
      const latitude = e.latlng.lat;
      const longitude = e.latlng.lng;

      const newPosition = {
        lat: latitude,
        lng: longitude,
      };

      setPosition(newPosition);

      if (onChange) {
        onChange({
          latitude,
          longitude,
        });
      }
    },
  });

  if (!position) {
    return null;
  }

  return (
    <Marker position={[position.lat, position.lng]} />
  );
}

// MAP PICKER

export default function MapPicker({
  latitude = "",
  longitude = "",
  onChange,
}) {
  // POSITION PAR DEFAUT

  const defaultLatitude =
    latitude !== "" && latitude !== null
      ? Number(latitude)
      : -15.7167;

  const defaultLongitude =
    longitude !== "" && longitude !== null
      ? Number(longitude)
      : 46.3170;

  const [position, setPosition] = useState(
    latitude !== "" && longitude !== ""
      ? {
          lat: Number(latitude),
          lng: Number(longitude),
        }
      : null
  );

  // SYNCHRONISATION AVEC LE FORMULAIRE

  useEffect(() => {
    if (
      latitude !== "" &&
      longitude !== "" &&
      latitude !== null &&
      longitude !== null
    ) {
      setPosition({
        lat: Number(latitude),
        lng: Number(longitude),
      });
    }
  }, [latitude, longitude]);

  // CHANGEMENT MANUEL

  function handleLatitudeChange(e) {
    const value = e.target.value;

    const newLatitude =
      value === "" ? "" : Number(value);

    onChange?.({
      latitude: newLatitude,
      longitude:
        longitude === ""
          ? ""
          : Number(longitude),
    });

    if (
      value !== "" &&
      longitude !== ""
    ) {
      setPosition({
        lat: Number(value),
        lng: Number(longitude),
      });
    }
  }

  function handleLongitudeChange(e) {
    const value = e.target.value;

    const newLongitude =
      value === "" ? "" : Number(value);

    onChange?.({
      latitude:
        latitude === ""
          ? ""
          : Number(latitude),

      longitude: newLongitude,
    });

    if (
      value !== "" &&
      latitude !== ""
    ) {
      setPosition({
        lat: Number(latitude),
        lng: Number(value),
      });
    }
  }

  // RENDU

  return (
    <div className="space-y-4">

      {/*CARTE*/}

      <div className="rounded-xl overflow-hidden border border-gray-200">

        <MapContainer
          center={[
            position?.lat ?? defaultLatitude,
            position?.lng ?? defaultLongitude,
          ]}
          zoom={6}
          scrollWheelZoom={true}
          style={{
            height: "350px",
            width: "100%",
          }}
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <LocationMarker
            position={position}
            setPosition={setPosition}
            onChange={onChange}
          />

        </MapContainer>

      </div>

      {/*COORDONNEES*/}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* LATITUDE */}

        <div>

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Latitude
          </label>

          <input
            type="number"
            step="any"
            value={latitude}
            onChange={handleLatitudeChange}
            placeholder="Ex : -15.7167"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all bg-white"
          />

        </div>

        {/* LONGITUDE */}

        <div>

          <label className="block text-sm font-medium text-haigana-dark mb-1">
            Longitude
          </label>

          <input
            type="number"
            step="any"
            value={longitude}
            onChange={handleLongitudeChange}
            placeholder="Ex : 46.3170"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-haigana-blue focus:ring-2 focus:ring-haigana-blue/20 outline-none transition-all bg-white"
          />

        </div>

      </div>

      {/*INFORMATION*/}

      <div className="bg-haigana-bg/50 rounded-xl px-4 py-3">

        <p className="text-sm text-gray-600">

          Cliquez directement sur la carte pour
          sélectionner la position du véhicule.

        </p>

        {position && (

          <p className="text-xs text-gray-500 mt-2">

            Position sélectionnée :
            <span className="font-medium ml-1">

              {position.lat.toFixed(6)}
              {" , "}
              {position.lng.toFixed(6)}

            </span>

          </p>

        )}

      </div>

    </div>
  );
}