import { useEffect, useRef, useState, useCallback } from "react";
import { Link, Outlet, useNavigate, useParams } from "react-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getLocations, getSessionLocations } from "../data";
import { NoUserFallback } from "../components/NoUserFallback";
import "./map.css";


const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export const clientLoader = async ({ request }) => {
  try {
    let userId = new URL(request.url).searchParams.get("user");

    if (userId) {
      localStorage.setItem('portal_user_id', userId);
    } else {
      userId = localStorage.getItem('portal_user_id');
    }

    if (!userId || isNaN(Number(userId))) {
      return { locations: [], session: null, userId: null, noUser: true };
    }

    // QR code flow — load the user's personalised locations
    const { session, locations } = await getSessionLocations(userId);
    return { locations, session, userId, noUser: false };
  } catch (error) {
    console.error("Failed to load locations:", error);
    return { locations: [], session: null, userId: null, noUser: true };
  }
};

export default function MapPage({ loaderData }) {
  const { locations, session, userId, noUser } = loaderData;

  if (noUser) {
    return <NoUserFallback />;
  }

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

  // Auto-select the first location if none is selected on load
  useEffect(() => {
    if (locations && locations.length > 0 && !params.locationId) {
      const firstLoc = locations[0];
      const userParam = userId ? `?user=${userId}` : "";
      navigate(`/map/${firstLoc.id}${userParam}`, { replace: true });
    }
  }, [locations, params.locationId, navigate, userId]);

  const isInitialFitDone = useRef(false);
  const previousLocationId = useRef(null);

  // Zoom/pan map based on active location selection
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !locations || locations.length === 0) return;

    // Wait until params.locationId is resolved (either loaded or redirected)
    if (!params.locationId) return;

    const activeLocId = String(params.locationId);

    // 1. Initial fit: fit bounds to show all spots above the collapsed sheet
    if (!isInitialFitDone.current) {
      isInitialFitDone.current = true;
      previousLocationId.current = activeLocId;

      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          bounds.extend([parseFloat(loc.longitude), parseFloat(loc.latitude)]);
        }
      });
      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, {
          padding: { top: 60, bottom: 220, left: 60, right: 60 },
          maxZoom: 15,
          animate: false
        });
      }
      return;
    }

    // 2. Subsequent switches (via swiping): zoom in on the active location if it changed
    if (activeLocId !== previousLocationId.current) {
      previousLocationId.current = activeLocId;

      const activeLoc = locations.find((l) => String(l.id) === activeLocId);
      if (activeLoc && activeLoc.latitude && activeLoc.longitude) {
        mapRef.current.easeTo({
          center: [parseFloat(activeLoc.longitude), parseFloat(activeLoc.latitude)],
          zoom: 15.5,
          padding: { top: 60, bottom: 220, left: 60, right: 60 },
          duration: 1000
        });
      }
    }
  }, [params.locationId, mapLoaded, locations]);

  // Initialize MapLibre map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    let initialBounds = null;
    if (locations && locations.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      locations.forEach((loc) => {
        if (loc.latitude && loc.longitude) {
          bounds.extend([parseFloat(loc.longitude), parseFloat(loc.latitude)]);
        }
      });
      if (!bounds.isEmpty()) {
        initialBounds = bounds;
      }
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      ...(initialBounds
        ? { bounds: initialBounds, fitBoundsOptions: { padding: { top: 60, bottom: 220, left: 60, right: 60 }, maxZoom: 15 } }
        : { center: ANTWERP_CENTER, zoom: ANTWERP_ZOOM }
      ),
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
  }, [locations]);

  // Create marker DOM element
  const createMarkerElement = useCallback((location, isActive) => {
    const el = document.createElement("div");
    el.className = `map-marker${isActive ? " map-marker--active" : ""}`;
    el.innerHTML = `<div class="map-marker__icon"></div>`;
    el.addEventListener("click", () => {
      // 1. Zoom in immediately on the clicked marker
      if (mapRef.current && location.latitude && location.longitude) {
        mapRef.current.easeTo({
          center: [parseFloat(location.longitude), parseFloat(location.latitude)],
          zoom: 15.5,
          padding: { top: 60, bottom: 220, left: 60, right: 60 },
          duration: 1000
        });
      }
      // 2. Update previous location Ref so the useEffect knows we already panned here
      previousLocationId.current = String(location.id);

      // 3. Keep user param in the URL when navigating to a location detail
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
      <Outlet context={{ userPosition, userId, locations }} />
    </div>
  );
}

export function meta() {
  return [
    { title: "Map — The Portal" },
    { name: "description", content: "Explore your personalised Antwerp locations." },
  ];
}