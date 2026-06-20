import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, Outlet, useNavigate, useParams } from "react-router";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getLocations, getSessionLocations } from "../data";
import { NoUserFallback } from "../components/NoUserFallback";
import "./map.css";

// Fallbacks die in je code stonden, hier voor de zekerheid gedefinieerd
const ANTWERP_CENTER = [4.4025, 51.2194];
const ANTWERP_ZOOM = 13;
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

    const { session, locations, sessionPhotos } = await getSessionLocations(userId);
    return { locations, session, userId, sessionPhotos, noUser: false };
  } catch (error) {
    console.error("Failed to load locations:", error);
    return { locations: [], session: null, userId: null, noUser: true };
  }
};

export default function MapPage({ loaderData }) {
  const { locations, session, userId, noUser, sessionPhotos } = loaderData;

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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
    if (!params.locationId) return;

    const activeLocId = String(params.locationId);

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

  // Initialize MapLibre map & Apply custom vector styling
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

    map.on("styledata", () => {
      // 1. Water zachtblauw maken
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", "#74a3cc");
      }

      // 2. Land/Achtergrond zacht oranje-beige maken
      if (map.getLayer("background")) {
        map.setPaintProperty("background", "background-color", "#fff2e0");
      }

      // 3. DYNAMISCH ALLE WEGEN PAKKEN EN GEEL KLEUREN
      const allLayers = map.getStyle().layers;

      allLayers.forEach((layer) => {
        // Check of de laag over wegen gaat en een lijn is
        if (
          layer.type === "line" &&
          (layer.id.includes("road") || layer.id.includes("highway") || layer.id.includes("rail"))
        ) {
          try {
            // Dit geeft de wegen die felle, warme oranje-gele kleur uit Screenshot 2026-06-19 at 11.59.43.jpg
            map.setPaintProperty(layer.id, "line-color", "#f7c247bf");
          } catch (e) {
            // Soms weigert een specifieke laag, dit voorkomt dat de code vastloopt
            console.warn(`Kon kleur voor laag ${layer.id} niet aanpassen`, e);
          }
        }
      });

      // 4. Onnodige rommel verbergen voor die cleane look
      // We lopen hier ook doorheen voor het geval de namen net anders zijn
      allLayers.forEach((layer) => {
        if (
          layer.id.includes("building") ||
          layer.id.includes("poi") ||
          layer.id.includes("label") ||
          layer.id.includes("park") ||
          layer.id.includes("leisure")
        ) {
          // Zorg dat we niet per ongeluk de wegen-labels of water verbergen
          if (!layer.id.includes("water") && !layer.id.includes("road")) {
            try {
              map.setLayoutProperty(layer.id, "visibility", "none");
            } catch (e) { }
          }
        }
      });
    });
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

    const matchingPhotoObj = (sessionPhotos || []).find(p => p.location_id === location.keyID);
    const hasPhoto = matchingPhotoObj?.photo && matchingPhotoObj.photo.trim() !== "";
    const photoSrc = hasPhoto ? matchingPhotoObj.photo : (location.image || "");

    let html = `<div class="map-marker__icon"></div>`;
    if (isActive && photoSrc) {
      html = `
        <div class="map-marker__square">
          <img src="${photoSrc}" alt="${location.name}" />
        </div>
        <div class="map-marker__icon"></div>
      `;
    }
    el.innerHTML = html;

    el.addEventListener("click", (e) => {
      e.stopPropagation();

      if (mapRef.current && location.latitude && location.longitude) {
        mapRef.current.easeTo({
          center: [parseFloat(location.longitude), parseFloat(location.latitude)],
          zoom: 15.5,
          padding: { top: 60, bottom: 220, left: 60, right: 60 },
          duration: 1000
        });
      }

      if (!isActive) {
        previousLocationId.current = String(location.id);
        const userParam = userId ? `?user=${userId}` : "";
        navigate(`/map/${location.id}${userParam}`);
      }
    });

    el.addEventListener("dblclick", (e) => {
      e.stopPropagation();
      e.preventDefault();
    });

    return el;
  }, [navigate, userId, sessionPhotos]);

  // Add location markers to the map
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !locations?.length) return;

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

  // Add user position marker (Perfect blauw bolletje zoals in screenshot!)
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

  const getGoogleMapsAllUrl = () => {
    if (!locations || locations.length === 0) return "#";
    const waypoints = locations.map(l => encodeURIComponent(`${l.name}, ${l.address}, Antwerp`)).join('/');
    return `https://www.google.com/maps/dir/${waypoints}`;
  };

  return (
    <div className="map-page" id="map-screen">
      <div ref={mapContainerRef} className="map-page__map" />

      {locations && locations.length > 0 && (
        <a
          href={getGoogleMapsAllUrl()}
          onClick={(e) => {
            e.preventDefault();
            setShowConfirmModal(true);
          }}
          className="map-page__gmaps-button"
          id="google-maps-all-locations"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M4.45605 0.0996094H23.543C25.9449 0.0996094 27.8995 2.05427 27.8994 4.45605V23.5439C27.8992 25.9456 25.9448 27.8994 23.543 27.8994H4.45605C2.05438 27.8994 0.099809 25.9456 0.0996094 23.5439V4.45605C0.0996177 2.05426 2.05427 0.0996094 4.45605 0.0996094ZM13.9287 15.2979L3.4248 25.8018L3.31934 25.9082L3.45703 25.9648C3.76502 26.0923 4.10245 26.1641 4.45605 26.1641H23.543C23.8966 26.1641 24.234 26.0923 24.542 25.9648L24.6807 25.9082L14 15.2275L13.9287 15.2979ZM4.45605 1.83594C3.01113 1.83594 1.83595 3.01115 1.83594 4.45605V23.5439C1.83597 23.8972 1.90686 24.2342 2.03418 24.542L2.0918 24.6807L2.19727 24.5752L13.377 13.3936L13.3799 13.3926L13.3848 13.3867L13.3926 13.3799L13.3936 13.377L16.8516 9.9209L16.9033 9.86914L16.8701 9.80469C16.1709 8.4403 15.6797 7.14575 15.6797 6.20996C15.6797 4.58181 16.3211 3.10143 17.3633 2.00488L17.5244 1.83594H4.45605ZM25.9775 11.1377C24.5491 13.588 22.7977 15.8908 22.4775 16.3066C22.3133 16.5199 22.0592 16.6445 21.79 16.6445C21.5208 16.6445 21.2669 16.5199 21.1025 16.3066C20.8008 15.9149 19.2252 13.8438 17.8486 11.5537L17.7832 11.4443L17.6924 11.5352L15.2979 13.9287L15.2275 14L25.9082 24.6807L25.9648 24.542C26.0922 24.2341 26.164 23.8974 26.1641 23.5439V10.8174L25.9775 11.1377ZM21.79 1.83594C19.3782 1.83594 17.415 3.79785 17.415 6.20996C17.415 6.61824 17.5709 7.16039 17.8242 7.77637C18.0787 8.39532 18.4368 9.09967 18.8535 9.83496C19.6871 11.3057 20.7581 12.909 21.709 14.2188L21.79 14.3301L21.8701 14.2188C22.8211 12.9091 23.8921 11.3057 24.7256 9.83496C25.1423 9.09967 25.5013 8.39532 25.7559 7.77637C26.0091 7.1605 26.1641 6.61819 26.1641 6.20996C26.1641 3.79799 24.202 1.83618 21.79 1.83594Z" fill="#FDF4E5" stroke="#E03C31" stroke-width="0.2" />
            <path d="M8.25488 3.41309C9.47872 3.4131 10.6294 3.88954 11.4951 4.75488C11.834 5.09369 11.8339 5.64351 11.4951 5.98242C11.1562 6.32144 10.6066 6.32124 10.2676 5.98242C9.72987 5.44515 9.01472 5.14943 8.25488 5.14941C6.68505 5.14941 5.4082 6.42626 5.4082 7.99609C5.40831 9.56596 6.68511 10.8428 8.25488 10.8428C9.47205 10.8427 10.5126 10.0751 10.9189 8.99902L10.9707 8.86328H8.25488C7.77555 8.86328 7.38683 8.47529 7.38672 7.99609C7.38672 7.51681 7.77548 7.12793 8.25488 7.12793H11.9697C12.4491 7.12797 12.8379 7.51683 12.8379 7.99609C12.8378 10.5228 10.7816 12.5781 8.25488 12.5781C5.72819 12.5781 3.67191 10.5228 3.67188 7.99609C3.67188 5.46938 5.72817 3.41309 8.25488 3.41309Z" fill="#FDF4E5" stroke="#E03C31" stroke-width="0.2" />
          </svg>
          View list
        </a>
      )}

      {!mapLoaded && (
        <div className="map-page__loading">
          <div className="map-page__loading-spinner" />
          <span className="map-page__loading-text">Loading map…</span>
        </div>
      )}

      <Outlet context={{ userPosition, userId, locations }} />

      {showConfirmModal && createPortal(
        <div className="gmaps-modal-backdrop" onClick={() => setShowConfirmModal(false)}>
          <div className="gmaps-modal" onClick={(e) => e.stopPropagation()}>
            <p className="gmaps-modal__text">
              You will be redirected to Google Maps to view a list of your liked locations.
            </p>
            <div className="gmaps-modal__buttons">
              <button
                className="gmaps-modal__button-confirm"
                onClick={() => {
                  window.open(getGoogleMapsAllUrl(), "_blank", "noopener,noreferrer");
                  setShowConfirmModal(false);
                }}
              >
                Go to Google Maps
              </button>
              <button
                className="gmaps-modal__button-cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export function meta() {
  return [
    { title: "Map — The Portal" },
    { name: "description", content: "Explore your personalised Antwerp locations." },
  ];
}