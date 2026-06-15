import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { HEATMAP_POINTS, getBusy, getWalkMin } from "../js/locations";

export default function Results() {
  const navigate = useNavigate();

  // Read swipe data from sessionStorage
  const [likedLocations, setLikedLocations] = useState([]);
  const [reactionPhotos, setReactionPhotos] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [heatmapOn, setHeatmapOn] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);

  // Refs for map and scroll
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const sheetTrackRef = useRef(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const storedLikes = JSON.parse(sessionStorage.getItem("likedLocations") || "[]");
    const storedPhotos = JSON.parse(sessionStorage.getItem("reactionPhotos") || "[]");
    setLikedLocations(storedLikes);
    setReactionPhotos(storedPhotos);
  }, []);

  // Initialize MapLibre GL JS
  useEffect(() => {
    if (likedLocations.length === 0) return;
    if (mapInstanceRef.current) return;

    const map = new window.maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [4.4025, 51.2194],
      zoom: 13,
    });

    mapInstanceRef.current = map;

    map.on("load", () => {
      // Clear old markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      // Calculate bounds
      const bounds = likedLocations.reduce(
        (b, l) => b.extend([l.lng, l.lat]),
        new window.maplibregl.LngLatBounds(
          [likedLocations[0].lng, likedLocations[0].lat],
          [likedLocations[0].lng, likedLocations[0].lat]
        )
      );

      // Create marker nodes
      likedLocations.forEach((loc, i) => {
        const wrap = document.createElement("div");
        wrap.style.cssText =
          "position:relative;display:flex;flex-direction:column;align-items:center;";

        const photo = reactionPhotos[i];
        const bubble = document.createElement("div");
        bubble.className = `pin-photo-bubble ${photo ? "show" : ""}`;
        if (photo) {
          const img = document.createElement("img");
          img.src = photo.dataUrl;
          bubble.appendChild(img);
        }

        const pin = document.createElement("div");
        pin.className = `map-pin ${i === 0 ? "active-pin" : ""}`;
        const inner = document.createElement("div");
        inner.className = "map-pin-inner";
        inner.textContent = loc.emoji;

        pin.appendChild(inner);
        wrap.appendChild(bubble);
        wrap.appendChild(pin);

        pin.addEventListener("click", () => {
          handleFocusCard(i);
        });

        const marker = new window.maplibregl.Marker({
          element: wrap,
          anchor: "bottom",
        })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });

      // Fit bounds with padding
      map.fitBounds(bounds, {
        padding: { top: 140, bottom: 250, left: 40, right: 40 },
        maxZoom: 15,
      });

      // Heatmap source & layer
      map.addSource("hs", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: HEATMAP_POINTS.map(([lat, lng, w]) => ({
            type: "Feature",
            properties: { weight: w },
            geometry: { type: "Point", coordinates: [lng, lat] },
          })),
        },
      });

      map.addLayer({
        id: "hl",
        type: "heatmap",
        source: "hs",
        layout: { visibility: "none" },
        paint: {
          "heatmap-weight": ["get", "weight"],
          "heatmap-intensity": 1.2,
          "heatmap-radius": 50,
          "heatmap-opacity": 0.72,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.1,
            "#00f5ff",
            0.3,
            "#00ff88",
            0.55,
            "#ffff00",
            0.8,
            "#ff8800",
            1,
            "#ff0000",
          ],
        },
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [likedLocations, reactionPhotos]);

  function handleFocusCard(idx) {
    isScrollingRef.current = true;
    setActiveIdx(idx);

    // Scroll sheet track
    const track = sheetTrackRef.current;
    if (track) {
      track.scrollTo({ left: idx * track.clientWidth, behavior: "smooth" });
    }

    // Fly to
    const loc = likedLocations[idx];
    const map = mapInstanceRef.current;
    if (map && loc) {
      map.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 500 });
      highlightPin(idx);
    }

    // Release scroll lock after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  }

  function handleTrackScroll() {
    if (isScrollingRef.current) return;

    const track = sheetTrackRef.current;
    const map = mapInstanceRef.current;
    if (!track) return;

    const w = track.clientWidth;
    const idx = Math.round(track.scrollLeft / w);

    if (idx !== activeIdx && idx >= 0 && idx < likedLocations.length) {
      setActiveIdx(idx);
      const loc = likedLocations[idx];
      if (map && loc) {
        map.flyTo({ center: [loc.lng, loc.lat], zoom: 15, duration: 600 });
        highlightPin(idx);
      }
    }
  }

  function highlightPin(activeIdx) {
    markersRef.current.forEach((m, i) => {
      const el = m.getElement();
      const pin = el.querySelector(".map-pin");
      if (pin) {
        pin.classList.toggle("active-pin", i === activeIdx);
      }
    });
  }

  function toggleHeatmap() {
    const map = mapInstanceRef.current;
    if (!map) return;
    const nextVal = !heatmapOn;
    setHeatmapOn(nextVal);
    map.setLayoutProperty("hl", "visibility", nextVal ? "visible" : "none");
  }

  function handleReset() {
    sessionStorage.removeItem("likedLocations");
    sessionStorage.removeItem("reactionPhotos");
    navigate("/");
  }

  // Google Maps waypoint dir URL
  const waypoints = likedLocations
    .map((l) => encodeURIComponent(`${l.name}, ${l.address}, Antwerp`))
    .join("/");
  const gmapsDirUrl = `https://www.google.com/maps/dir/${waypoints}`;

  // Date stamp helper
  const dateStr = (() => {
    const d = new Date();
    return [
      String(d.getDate()).padStart(2, "0"),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getFullYear()).slice(-2),
    ].join(".");
  })();

  if (likedLocations.length === 0) {
    return (
      <div className="screen active" style={{ flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem" }}>🗺</div>
        <h2>No spots saved yet!</h2>
        <p>Go back and swipe some spots to view your Antwerp map.</p>
        <button className="btn-primary" onClick={() => navigate("/")}>
          Start Swiping
        </button>
      </div>
    );
  }

  return (
    <div className="screen active" id="results">
      {/* Map container */}
      <div ref={mapContainerRef} id="results-map" />

      {/* Back to Home Button */}
      <button className="btn-back" onClick={handleReset} title="Back">
        ←
      </button>

      {/* Reaction Photos FAB */}
      <button
        id="photos-fab"
        onClick={() => setPhotosOpen(true)}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 30,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: "rgba(250, 247, 240, .92)",
          border: "1px solid rgba(26,18,8,.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1rem",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 6px rgba(26,18,8,.12)",
        }}
        title="Reaction photos"
      >
        📸
      </button>

      {/* Floating Topbar */}
      <div className="map-topbar">
        <div className="map-topbar-row">
          <div className="map-title-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span id="results-subtitle">
              your {likedLocations.length} favourite spot{likedLocations.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="map-topbar-row">
          <a
            id="gmaps-link"
            className="btn-maps"
            href={gmapsDirUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Open all in Google Maps
          </a>
          <button
            className={`btn-heatmap ${heatmapOn ? "on" : ""}`}
            id="heatmap-btn"
            onClick={toggleHeatmap}
          >
            {heatmapOn ? "🔥 Hide" : "🔥 Heatmap"}
          </button>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className={`heatmap-legend ${heatmapOn ? "visible" : ""}`} id="heatmap-legend">
        <h4>busyness — Antwerp (simulated friday evening)</h4>
        <div className="heatmap-gradient" />
        <div className="heatmap-labels">
          <span>quiet</span>
          <span>moderate</span>
          <span>very busy</span>
        </div>
        <p className="heatmap-note">⚠ simulated — real-time requires Google Maps Platform.</p>
      </div>

      {/* Bottom Sheet */}
      <div className="map-bottom-sheet">
        <div className="sheet-dots" id="sheet-dots">
          {likedLocations.map((_, i) => (
            <div
              key={i}
              className={`sheet-dot ${i === activeIdx ? "active" : ""}`}
              onClick={() => handleFocusCard(i)}
            />
          ))}
        </div>
        <div className="sheet-track-wrap">
          <div
            ref={sheetTrackRef}
            className="sheet-track"
            id="sheet-track"
            onScroll={handleTrackScroll}
          >
            {likedLocations.map((loc, i) => {
              const busy = getBusy(loc);
              const walk = getWalkMin(loc);
              const isBusy = busy === "busy" || busy === "very busy";
              const photo = reactionPhotos[i];
              const placeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${loc.name}, ${loc.address}, Antwerp`
              )}`;

              return (
                <div
                  key={loc.id}
                  className="sheet-card"
                  onClick={() => handleFocusCard(i)}
                >
                  <div className="sheet-card-img">
                    <span style={{ position: "relative", zIndex: 1 }}>{loc.emoji}</span>
                    {photo && (
                      <div className="sheet-card-photo">
                        <img src={photo.dataUrl} alt="reaction" />
                      </div>
                    )}
                  </div>
                  <div className="sheet-card-body">
                    <div className="sheet-card-type">
                      {loc.type} · {loc.neighborhood}
                    </div>
                    <div className="sheet-card-name">{loc.name}</div>
                    <div className="sheet-card-address">📍 {loc.address}</div>
                  </div>
                  <div className="sheet-card-footer">
                    <div className="sheet-card-pills">
                      <div className="sheet-pill">🚶 {walk} min</div>
                      <div className={`sheet-pill ${isBusy ? "busy" : "quiet"}`}>
                        <span className="busy-dot" />
                        {busy.charAt(0).toUpperCase() + busy.slice(1)}
                      </div>
                    </div>
                    <a
                      className="sheet-gmaps-btn"
                      href={placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in Google Maps"
                    >
                      →
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Photos Overlay */}
      <div className={`photos-overlay ${photosOpen ? "visible" : ""}`} id="photos-overlay">
        <div className="photos-overlay-header">
          <h2>📸 reaction roll</h2>
          <button className="photos-close" onClick={() => setPhotosOpen(false)}>
            ✕
          </button>
        </div>
        <div id="photos-tab-inner">
          <div className="photos-section-title">your reaction shots</div>
          <div id="photos-grid-container">
            {reactionPhotos.length === 0 ? (
              <p className="no-photos-msg">no shots taken — camera access was needed.</p>
            ) : (
              <div className="photos-grid">
                {reactionPhotos.map((photo, index) => (
                  <div key={index} className="photo-cell">
                    <div className="photo-cell-img-wrap">
                      <img src={photo.dataUrl} alt={`Reaction to ${photo.locationName}`} />
                      <div className="photo-date-stamp">{dateStr}</div>
                    </div>
                    <div className="photo-cell-label">
                      <div className="photo-cell-name">
                        <span>{photo.locationEmoji}</span> {photo.locationName}
                      </div>
                      <div className="photo-cell-place">antwerp, BE</div>
                    </div>
                    <a
                      className="photo-download"
                      href={photo.dataUrl}
                      download={`antwerp-${photo.locationName.replace(/\s+/g, "-").toLowerCase()}.jpg`}
                      title="download"
                    >
                      ⬇
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
