import { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getLocations } from "../data";
import "./map.css";

// Antwerp center coordinates
const ANTWERP_CENTER = [4.4025, 51.2194];
const ANTWERP_ZOOM = 13;

// Free dark basemap style (CARTO Dark Matter - no API key needed)
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

export const clientLoader = async () => {
  try {
    const locations = await getLocations();
    return { locations };
  } catch (error) {
    console.error("Failed to load locations:", error);
    return { locations: [] };
  }
};

export default function MapPage({ loaderData }) {
  const { locations } = loaderData;
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const navigate = useNavigate();
  const params = useParams();

  // Get user's current position
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          // Default to Antwerp center if geolocation fails
          setUserPosition({
            lat: ANTWERP_CENTER[1],
            lng: ANTWERP_CENTER[0],
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserPosition({
        lat: ANTWERP_CENTER[1],
        lng: ANTWERP_CENTER[0],
      });
    }
  }, []);

  // Initialize MapLibre map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: ANTWERP_CENTER,
      zoom: ANTWERP_ZOOM,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Create marker DOM element
  const createMarkerElement = useCallback((location, isActive) => {
    const el = document.createElement("div");
    el.className = `map-marker${isActive ? " map-marker--active" : ""}`;
    el.innerHTML = `
      <div class="map-marker__pulse"></div>
      <div class="map-marker__pin">
        <div class="map-marker__inner"></div>
      </div>
    `;
    el.addEventListener("click", () => {
      navigate(`/map/${location.id}`);
    });
    return el;
  }, [navigate]);

  // Add location markers to the map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !locations?.length) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const activeId = params.locationId;

    locations.forEach((location) => {
      if (!location.latitude || !location.longitude) return;

      const isActive = String(location.id) === String(activeId);
      const el = createMarkerElement(location, isActive);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([parseFloat(location.longitude), parseFloat(location.latitude)])
        .addTo(mapRef.current);

      markersRef.current.push(marker);
    });
  }, [mapLoaded, locations, params.locationId, createMarkerElement]);

  // Add user position marker
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !userPosition) return;

    const el = document.createElement("div");
    el.className = "user-marker";
    el.innerHTML = `
      <div class="user-marker__ring"></div>
      <div class="user-marker__dot"></div>
    `;

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([userPosition.lng, userPosition.lat])
      .addTo(mapRef.current);

    return () => marker.remove();
  }, [mapLoaded, userPosition]);

  return (
    <div className="map-page" id="map-screen">
      {/* Back to intro */}
      <Link to="/" className="map-page__back" id="back-button">
        <span className="map-page__back-arrow">←</span>
        Back
      </Link>

      {/* Map */}
      <div ref={mapContainerRef} className="map-page__map" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="map-page__loading">
          <div className="map-page__loading-spinner" />
          <span className="map-page__loading-text">Loading map…</span>
        </div>
      )}

      {/* Detail panel outlet (rendered when a location is selected) */}
      <Outlet context={{ userPosition }} />
    </div>
  );
}

export function meta() {
  return [
    { title: "Map — The Portal" },
    { name: "description", content: "Explore 6 hidden locations on the Antwerp map." },
  ];
}
