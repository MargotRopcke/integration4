import "./StepSwipe.css";
import { useState, useEffect, useRef } from "react";
import { MAX_LIKES } from "../constants/constants.js";
import { TutorialScreen } from "./TutorialScreen.jsx";
import { GestureProgressIcon } from "../components/GestureIcons.jsx";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// ── Mini Map for Location Card ───────────────────────────────────────────────
function SwipeMiniMap({ latitude, longitude }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) return;

    // Initialize MapLibre Map
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [lng, lat],
      zoom: 14,
      attributionControl: false,
      interactive: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      map.resize();
    });

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    }, 100);

    // Custom coloring to match screenshot styles
    map.on("styledata", () => {
      if (map.getLayer("water")) {
        map.setPaintProperty("water", "fill-color", "#74a3cc");
      }
      if (map.getLayer("background")) {
        map.setPaintProperty("background", "background-color", "#fff2e0");
      }

      const allLayers = map.getStyle().layers;
      allLayers.forEach((layer) => {
        if (
          layer.type === "line" &&
          (layer.id.includes("road") || layer.id.includes("highway") || layer.id.includes("rail"))
        ) {
          try {
            map.setPaintProperty(layer.id, "line-color", "#f7c247bf");
          } catch (e) {}
        }
      });

      allLayers.forEach((layer) => {
        if (
          layer.id.includes("building") ||
          layer.id.includes("poi") ||
          layer.id.includes("label") ||
          layer.id.includes("park") ||
          layer.id.includes("leisure")
        ) {
          if (!layer.id.includes("water") && !layer.id.includes("road")) {
            try {
              map.setLayoutProperty(layer.id, "visibility", "none");
            } catch (e) {}
          }
        }
      });
    });

    // Create customized red/orange marker representing location dot
    const el = document.createElement("div");
    el.className = "swipe-map-marker";
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#e03c31";
    el.style.border = "3px solid #fff2e0";
    el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map);

    markerRef.current = marker;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    };
  }, []);

  // Dynamically jump to next location when swiping/changing cards
  useEffect(() => {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng) || !mapRef.current) return;

    mapRef.current.jumpTo({
      center: [lng, lat],
      zoom: 14,
    });

    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [latitude, longitude]);

  return <div ref={containerRef} style={{ position: "absolute", inset: 0 }} />;
}

// ── Match popup ───────────────────────────────────────────────────────────────
function MatchPopup({ location, onDismiss }) {
  useEffect(() => {
    if (!location) return;
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [location, onDismiss]);

  if (!location) return null;

  return (
    <div className="match-popup-overlay" onClick={onDismiss}>
      <div className="match-popup-card" onClick={e => e.stopPropagation()}>
        <div className="match-popup-photo">
          {location.image && <img src={location.image} alt={location.name} />}
          <div className="match-popup-sticker">
            <img src="/assets/match.svg" alt="It's a match!" />
          </div>
        </div>
        <h2 className="match-popup-name">{location.name}</h2>
        <p className="match-popup-sub">Ready to take a picture?</p>
      </div>
    </div>
  );
}

// ── Done overlay ──────────────────────────────────────────────────────────────
function DoneOverlay({ visible, likesCount, gestureType, gestureProgress, onShowResults, onReset }) {
  if (!visible) return null;
  return (
    <div className="done-overlay visible">
      <div className="done-card">
        <div className="done-gesture-hint">
          <GestureProgressIcon
            gesture={gestureType || "thumbsUp"}
            progress={gestureType ? gestureProgress : 0}
            size={56}
          />
        </div>
        <h2 className="done-title">You've seen it all.</h2>
        <p className="done-sub">
          {MAX_LIKES - likesCount === 1
            ? "You have one like left."
            : `You have ${MAX_LIKES - likesCount} likes left.`}
        </p>
        <div className="done-actions">
          <button className="done-action-btn" onClick={onShowResults}>
            <GestureProgressIcon
              gesture="thumbsUp"
              progress={gestureType === "thumbsUp" ? gestureProgress : 0}
              size={48}
            />
            <span>Swipe again</span>
          </button>
          <button className="done-action-btn" onClick={onReset}>
            <GestureProgressIcon
              gesture="thumbsDown"
              progress={gestureType === "thumbsDown" ? gestureProgress : 0}
              size={48}
            />
            <span>Finish</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main swipe screen ─────────────────────────────────────────────────────────
export function StepSwipe({
  loading, deck, deckIndex, currentCard,
  likesCount, swipeDone, cardSwipeClass,
  overlayLike, overlayNope,
  countdownVisible, countdownText, countdownCheese,
  flashActive,
  tutorialActive, tutorialStep, tutorialHoldBars, nextTutorialStep,
  gestureStatus, gestureDetected, gestureProgress, gestureType, noCameraNotice,
  videoRef, canvasOverlayRef, outputCanvasRef, bgImageRef,
  cardRef,
  onVote, onGoBack, onShowResults, onReset,
  categoryLabel,
  likedLocations,
}) {
  const [matchLocation, setMatchLocation] = useState(null);

  useEffect(() => {
    if (likedLocations.length > 0 && !swipeDone) {
      setMatchLocation(likedLocations[likedLocations.length - 1]);
    }
  }, [likedLocations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="swipe-screen">
        <div className="swipe-loading">
          <div className="loader" />
          <p>Loading your personalised spots…</p>
        </div>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="swipe-screen">
        <div className="swipe-loading">
          <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>😔</p>
          <p>No locations found matching your preferences.</p>
          <button className="btn-form" onClick={() => onReset("preferences")}>← Adjust Preferences</button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-screen" id="swipe">
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline muted />

      {/* Fullscreen background */}
      <div className="swipe-bg" style={{ opacity: (tutorialActive && tutorialStep === 1) ? 0 : 1 }}>
        {currentCard && (
          <img ref={bgImageRef} className="swipe-bg__img" src={currentCard.image} alt="" crossOrigin="anonymous" />
        )}
        <canvas ref={outputCanvasRef} className="swipe-bg__canvas" />
      </div>

      {/* Hand landmark canvas */}
      <canvas ref={canvasOverlayRef} className="swipe-landmark-canvas" style={{ opacity: (tutorialActive && tutorialStep === 1) ? 0 : 1 }} />

      {/* Tutorial overlay */}
      {tutorialActive && (
        <div className="tutorial-overlay-new">
          <TutorialScreen
            tutorialStep={tutorialStep}
            tutorialHoldBars={tutorialHoldBars}
            nextTutorialStep={nextTutorialStep}
          />
        </div>
      )}

      {/* Live swipe UI */}
      {!tutorialActive && (
        <>
          <div className="swipe-bottom">

            {/* Polaroid stack */}
            <div className="swipe-polaroid-stack">
              <div className="swipe-counter">{likesCount}/{MAX_LIKES}</div>
              <div className="swipe-stack-cards">
                {likedLocations.slice(-3).map((loc, i) => (
                  <div key={loc.keyID || i} className="swipe-stack-card"
                    style={{ transform: `rotate(${(i - 1) * 6}deg) translateY(${(2 - i) * 4}px)`, zIndex: i }}>
                    {loc.image && <img src={loc.image} alt={loc.name} />}
                  </div>
                ))}
                {likedLocations.length === 0 && <div className="swipe-stack-card swipe-stack-card--empty" />}
              </div>
            </div>

            {/* Gesture buttons — same icon, same component as everywhere else */}
            <div className="swipe-gesture-btns" style={{ pointerEvents: tutorialActive ? "none" : "auto" }}>
              <button
                className={`swipe-gesture-btn swipe-gesture-btn--like${gestureType === "thumbsUp" ? " swipe-gesture-btn--active" : ""}`}
                onClick={() => onVote(true)}
                title="Like"
              >
                <GestureProgressIcon
                  gesture="thumbsUp"
                  progress={gestureType === "thumbsUp" ? gestureProgress : 0}
                  size={34}
                />
              </button>

              <button
                className={`swipe-gesture-btn swipe-gesture-btn--undo${gestureType === "stopHand" ? " swipe-gesture-btn--active" : ""}`}
                onClick={onGoBack}
                title="Undo"
                style={{ opacity: deckIndex > 0 ? 1 : 0.35, pointerEvents: !tutorialActive && deckIndex > 0 ? "auto" : "none" }}
              >
                <GestureProgressIcon
                  gesture="stopHand"
                  progress={gestureType === "stopHand" ? gestureProgress : 0}
                  size={26}
                />
              </button>

              <button
                className={`swipe-gesture-btn swipe-gesture-btn--dislike${gestureType === "thumbsDown" ? " swipe-gesture-btn--active" : ""}`}
                onClick={() => onVote(false)}
                title="Dislike"
              >
                <GestureProgressIcon
                  gesture="thumbsDown"
                  progress={gestureType === "thumbsDown" ? gestureProgress : 0}
                  size={34}
                />
              </button>
            </div>

            {/* Location card */}
            {currentCard && (
              <div
                className={`swipe-location-card${cardSwipeClass ? ` ${cardSwipeClass}` : ""}`}
                ref={cardRef}
                style={{ pointerEvents: tutorialActive ? "none" : "auto" }}
              >
                <div className="swipe-location-card__map">
                  <SwipeMiniMap latitude={currentCard.latitude} longitude={currentCard.longitude} />
                </div>
                <div className="swipe-location-card__info">
                  <div className="swipe-location-card__name">{currentCard.name}</div>
                  <div className="swipe-location-card__type">{categoryLabel}</div>
                </div>
                <div className="card-vote-overlay like" style={{ opacity: overlayLike }}>LIKE ✓</div>
                <div className="card-vote-overlay nope" style={{ opacity: overlayNope }}>NOPE ✗</div>
              </div>
            )}
          </div>

          {noCameraNotice && (
            <div className="no-camera-notice">No camera — use buttons to vote</div>
          )}
        </>
      )}

      <MatchPopup location={matchLocation} onDismiss={() => setMatchLocation(null)} />

      <DoneOverlay
        visible={swipeDone}
        likesCount={likesCount}
        gestureType={gestureType}
        gestureProgress={gestureProgress}
        onShowResults={onShowResults}
        onReset={() => onReset()}
      />

      <div className={`countdown-overlay${countdownVisible ? " visible" : ""}`}>
        <div className={`countdown-number${countdownCheese ? " cheese" : ""}`} key={countdownText}>
          {countdownText}
        </div>
      </div>

      <div className={`flash-overlay${flashActive ? " flash" : ""}`} />
    </div>
  );
}
