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
  const [showCollage, setShowCollage] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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

  // Helper: convert a base64 data URL or a regular URL to a Blob
  const collageToBlob = async (collageUrl) => {
    if (collageUrl.startsWith('data:')) {
      // Parse base64 data URL directly — no fetch needed
      const [header, base64Data] = collageUrl.split(',');
      const mimeMatch = header.match(/data:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    }
    // Regular URL — fetch it
    const response = await fetch(collageUrl);
    return response.blob();
  };

  // Helper: open the collage image in a new tab (final fallback for phones on HTTP)
  const openCollageInNewTab = (blob) => {
    const blobUrl = window.URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
    // Don't revoke immediately — give the new tab time to load
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    showToast("Long-press the image to save or share it.");
  };

  const handleShare = async () => {
    if (!session?.collage) {
      showToast("No collage found to share.");
      return;
    }
    try {
      const blob = await collageToBlob(session.collage);
      const file = new File([blob], 'collage.jpg', { type: blob.type });

      // 1. Try native share with image file (mobile HTTPS — iOS & Android)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'My Antwerp Photo Memories',
            text: 'Look at my custom Antwerp photo memories collage!'
          });
          console.log('Image shared successfully');
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') {
            console.log('Share aborted by user');
            return;
          }
          console.warn('File share failed, trying URL share:', shareErr);
        }
      }

      // 2. Try native share with URL only (mobile HTTPS fallback)
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'My Antwerp Photo Memories',
            text: 'Check out my Antwerp photo memories!',
            url: window.location.href,
          });
          return;
        } catch (shareErr) {
          if (shareErr.name === 'AbortError') return;
          console.warn('URL share failed:', shareErr);
        }
      }

      // 3. Try clipboard (desktop / secure context)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast("Link copied to clipboard!");
          return;
        } catch (clipErr) {
          console.warn('Clipboard failed:', clipErr);
        }
      }

      // 4. Final fallback: open image in new tab (phones on HTTP)
      openCollageInNewTab(blob);
    } catch (error) {
      console.error('Error in handleShare:', error);
      // Last resort: open the data URL directly
      try {
        const blob = await collageToBlob(session.collage);
        openCollageInNewTab(blob);
      } catch (e) {
        showToast("Could not share the collage.");
      }
    }
  };

  const handleDownload = async () => {
    if (!session?.collage) return;
    try {
      const blob = await collageToBlob(session.collage);
      const blobUrl = window.URL.createObjectURL(blob);

      // iOS Safari ignores the `download` attribute on <a> tags.
      // Detect iOS and open in new tab instead so user can long-press to save.
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

      if (isIOS) {
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
        showToast("Long-press the image to save it.");
      } else {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `collage-${userId || 'session'}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open data URL in new tab
      try {
        const blob = await collageToBlob(session.collage);
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
        showToast("Long-press the image to save it.");
      } catch (e) {
        showToast("Could not download the collage.");
      }
    }
  };

  const getGoogleMapsAllUrl = () => {
    if (!locations || locations.length === 0) return "#";
    const waypoints = locations.map(l => encodeURIComponent(`${l.name}, ${l.address}, Antwerp`)).join('/');
    return `https://www.google.com/maps/dir/${waypoints}`;
  };

  return (
    <div className="map-page" id="map-screen">
      <div ref={mapContainerRef} className="map-page__map" />

      {locations && locations.length > 0 && (
        <div className="map-page__header-buttons">
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

          <button
            onClick={() => setShowCollage(true)}
            className="map-page__collage-button"
            id="view-photo-memories"
            aria-label="View photo memories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="51" height="51" viewBox="0 0 51 51" fill="none">
              <rect x="0.5" y="0.5" width="50" height="50" rx="4.5" fill="#FDFEEF" />
              <rect x="0.5" y="0.5" width="50" height="50" rx="4.5" stroke="#E03C31" />
              <path d="M13 14.1521C13 13.5183 13.5186 12.9997 14.1524 12.9997H32.5906C33.2244 12.9997 33.743 13.5183 33.743 14.1521V32.5903C33.743 33.2241 33.2244 33.7427 32.5906 33.7427H14.1524C13.5186 33.7427 13 33.2241 13 32.5903V14.1521Z" stroke="#E03C31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M13 30.2853H33.743" stroke="#E03C31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M17.4238 36.048L34.4792 39.4822C34.7788 39.5398 35.09 39.4822 35.3435 39.3093C35.597 39.1364 35.7699 38.8714 35.839 38.5718L39.4806 20.4908C39.6073 19.8685 39.204 19.2577 38.5817 19.131L36.0464 18.6239" stroke="#E03C31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M15.8809 30.2855C15.8809 29.2138 16.1113 28.1536 16.5262 27.174C16.9872 26.2521 18.9001 25.6183 21.3086 24.731C21.9655 24.489 21.8502 22.7949 21.5621 22.4723C20.6287 21.4697 20.1793 20.1099 20.306 18.7501C20.2254 17.8858 20.5019 17.0215 21.0781 16.3646C21.6543 15.7078 22.484 15.3275 23.3483 15.3044C24.2242 15.3275 25.0424 15.7078 25.6185 16.3646C26.1947 17.0215 26.4828 17.8858 26.3906 18.7501C26.5289 20.1099 26.068 21.4697 25.1345 22.4723C24.8464 22.7949 24.7427 24.489 25.3881 24.731C27.7966 25.6183 29.7095 26.2636 30.1705 27.174C30.5853 28.1536 30.8158 29.2138 30.8158 30.2855H15.8809Z" stroke="#E03C31" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
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

      {/* Collage overlay page */}
      {showCollage && createPortal(
        <div className="collage-page">
          <div className="collage-page__header">
            <button className="collage-page__back-button" onClick={() => setShowCollage(false)}>
              &lt; Go back
            </button>
          </div>

          <div className="collage-page__content">
            <h1 className="collage-page__title">Your photo memories</h1>

            <div className="collage-page__actions">
              <button className="collage-page__action-btn" onClick={handleShare} aria-label="Share collage">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E03C31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              </button>

              <button className="collage-page__action-btn" onClick={handleDownload} aria-label="Download collage">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E03C31" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            <div className="collage-page__image-wrapper">
              {session?.collage ? (
                <img src={session.collage} alt="Your Antwerp Photo Memories Collage" className="collage-page__img" />
              ) : (
                <p className="collage-page__no-collage">No collage found for this session.</p>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification */}
      {toastMessage && createPortal(
        <div className="toast-notification">
          <div className="toast-notification__content">
            <svg className="toast-notification__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>{toastMessage}</span>
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