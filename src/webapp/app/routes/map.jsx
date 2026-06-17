import { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getLocations, getSessionLocations } from "../data";
import "./map.css";

// Antwerp center coordinates
const ANTWERP_CENTER = [4.4025, 51.2194];
const ANTWERP_ZOOM = 13;

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const clientLoader = async ({ request }) => {
  try {
    const userId = new URL(request.url).searchParams.get("user");

    if (userId) {
      // QR code flow — load the user's personalised locations
      const { session, locations } = await getSessionLocations(userId);
      return { locations, session, userId };
    }

    // Direct visit — load all locations
    const locations = await getLocations();
    return { locations, session: null, userId: null };
  } catch (error) {
    console.error("Failed to load locations:", error);
    return { locations: [], session: null, userId: null };
  }
};

export default function MapPage({ loaderData }) {
  const { locations, session, userId } = loaderData;
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
    el.innerHTML = `<div class="map-marker__icon"></div>`;
    el.addEventListener("click", () => {
      // Keep user param in the URL when navigating to a location detail
      const userParam = userId ? `?user=${userId}` : "";
      navigate(`/map/${location.id}${userParam}`);
    });
    return el;
  }, [navigate, userId]);

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

    // If session locations, fit the map to show all of them
    if (session && locations.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          bounds.extend([parseFloat(loc.longitude), parseFloat(loc.latitude)]);
        }
      });
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }
  }, [mapLoaded, locations, params.locationId, createMarkerElement, session]);

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
      {/* Back button — goes back to intro with user param if available */}
      <Link
        to={userId ? `/intro?user=${userId}` : "/"}
        className="map-page__back"
        id="back-button"
      >
        <span className="map-page__back-arrow">←</span>
        Back
      </Link>

      {/* Session badge — shown when viewing personalised locations */}
      {session && (
        <div className="map-page__session-badge">
          <span>
            {session.primary_category?.name?.toLowerCase() === "style" ? "👗" : "🍽"}
          </span>
          <span>{session.traveler_type?.name}</span>
          <span>· {locations.length} spots</span>
        </div>
      )}

      {/* Map */}
      <div ref={mapContainerRef} className="map-page__map" />

      {/* Loading overlay */}
      {!mapLoaded && (
        <div className="map-page__loading">
          <div className="map-page__loading-spinner" />
          <span className="map-page__loading-text">Loading map…</span>
        </div>
      )}

      {/* Detail panel outlet */}
      <Outlet context={{ userPosition, userId }} />
    </div>
  );
}

export function meta() {
  return [
    { title: "Map — The Portal" },
    { name: "description", content: "Explore your personalised Antwerp locations." },
  ];
}