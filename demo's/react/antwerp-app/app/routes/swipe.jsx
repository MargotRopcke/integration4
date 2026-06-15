import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { buildDeck } from "../js/locations";
import { initCamera, capturePhoto, resetCamera } from "../js/camera";

export default function Swipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";

  // State
  const [deck, setDeck] = useState([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [likedLocations, setLikedLocations] = useState([]);
  const [reactionPhotos, setReactionPhotos] = useState([]);
  const [handStatus, setHandStatus] = useState("📷 camera loading…");
  const [handDetected, setHandDetected] = useState(false);
  const [countdownActive, setCountdownActive] = useState(false);
  const [countdownVal, setCountdownVal] = useState("3");
  const [showFlash, setShowFlash] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [swipeClass, setSwipeClass] = useState("");
  const [heartPulse, setHeartPulse] = useState(false);

  // Drag states
  const [dragStyle, setDragStyle] = useState({});
  const [likeOpacity, setLikeOpacity] = useState(0);
  const [nopeOpacity, setNopeOpacity] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const cardRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const countdownActiveRef = useRef(false);

  // Keep references to states for callbacks
  const deckRef = useRef([]);
  const deckIndexRef = useRef(0);
  const likedLocationsRef = useRef([]);
  const reactionPhotosRef = useRef([]);

  useEffect(() => {
    deckRef.current = deck;
    deckIndexRef.current = deckIndex;
    likedLocationsRef.current = likedLocations;
    reactionPhotosRef.current = reactionPhotos;
  }, [deck, deckIndex, likedLocations, reactionPhotos]);

  // Initial setup: deck and camera
  useEffect(() => {
    // Clear old session
    sessionStorage.removeItem("likedLocations");
    sessionStorage.removeItem("reactionPhotos");

    const newDeck = buildDeck(category);
    setDeck(newDeck);

    const video = videoRef.current;
    const canvas = canvasRef.current;

    let active = true;
    if (video && canvas) {
      initCamera(video, canvas, {
        onHandStatus: (text, isDetected) => {
          if (!active) return;
          setHandStatus(text);
          setHandDetected(isDetected);
        },
        isCountdownActive: () => countdownActiveRef.current,
        onGestureTriggered: (gesture) => {
          if (!active) return;
          handleVote(gesture === "thumbsUp");
        },
        onGestureProgress: (gesture, pct) => {
          if (!active) return;
          setHandStatus(
            gesture === "thumbsUp"
              ? `👍 thumbs up ${pct < 1 ? "— hold…" : "→ liked!"}`
              : `👎 thumbs down ${pct < 1 ? "— hold…" : "→ nope!"}`
          );
          setHandDetected(true);
        },
      });
    }

    return () => {
      active = false;
      resetCamera();
    };
  }, [category]);

  // Handle Drag Move & End global listeners
  useEffect(() => {
    function onMouseMove(e) {
      if (!isDraggingRef.current) return;
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      const currentX = clientX - startXRef.current;
      
      setDragStyle({
        transform: `translateX(${currentX}px) rotate(${currentX * 0.05}deg)`,
      });
      setLikeOpacity(Math.min(Math.max(0, currentX / 100), 1));
      setNopeOpacity(Math.min(Math.max(0, -currentX / 100), 1));
    }

    function onMouseUp() {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      
      // Calculate delta X
      const transform = cardRef.current?.style.transform || "";
      const match = transform.match(/translateX\(([-]?\d+(?:\.\d+)?)/);
      const x = match ? parseFloat(match[1]) : 0;

      if (x > 80) {
        handleVote(true);
      } else if (x < -80) {
        handleVote(false);
      } else {
        setDragStyle({});
        setLikeOpacity(0);
        setNopeOpacity(0);
      }
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("touchmove", onMouseMove, { passive: true });
    document.addEventListener("touchend", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("touchmove", onMouseMove);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, [deck, deckIndex, likedLocations]);

  // Handle vote logic
  function handleVote(liked) {
    const curIndex = deckIndexRef.current;
    const curDeck = deckRef.current;
    if (curIndex >= curDeck.length || countdownActiveRef.current) return;

    if (!liked) {
      commitVote(false);
      return;
    }

    const curLikes = likedLocationsRef.current;
    if (curLikes.length >= 6) {
      setHeartPulse(true);
      setTimeout(() => setHeartPulse(false), 400);
      return;
    }

    // Start Say-Cheese Countdown
    countdownActiveRef.current = true;
    setCountdownActive(true);

    const steps = ["3", "2", "1", "📸 Say Cheese!"];
    let step = 0;

    function nextStep() {
      if (step >= steps.length) {
        setCountdownActive(false);
        countdownActiveRef.current = false;

        // Flash effect
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 220);

        // Capture photo
        const curIndex = deckIndexRef.current;
        const curDeck = deckRef.current;
        const photo = capturePhoto(
          videoRef.current,
          captureCanvasRef.current,
          curDeck[curIndex].name,
          curDeck[curIndex].emoji
        );

        if (photo) {
          const updatedPhotos = [...reactionPhotosRef.current, photo];
          setReactionPhotos(updatedPhotos);
          sessionStorage.setItem("reactionPhotos", JSON.stringify(updatedPhotos));
        }

        commitVote(true);
        return;
      }

      setCountdownVal(steps[step]);
      step++;
      setTimeout(nextStep, step === 4 ? 950 : 820);
    }

    nextStep();
  }

  function commitVote(liked) {
    setSwipeClass(liked ? "swipe-right" : "swipe-left");

    const curIndex = deckIndexRef.current;
    const curDeck = deckRef.current;
    const curLikes = likedLocationsRef.current;

    let updatedLikes = [...curLikes];
    if (liked) {
      updatedLikes.push(curDeck[curIndex]);
      setLikedLocations(updatedLikes);
      sessionStorage.setItem("likedLocations", JSON.stringify(updatedLikes));
    }

    setTimeout(() => {
      const nextIndex = curIndex + 1;
      setDeckIndex(nextIndex);
      setSwipeClass("");
      setDragStyle({});
      setLikeOpacity(0);
      setNopeOpacity(0);

      if (nextIndex >= curDeck.length || updatedLikes.length >= 6) {
        setShowDone(true);
      }
    }, 370);
  }

  function handleDragStart(e) {
    if (showDone || countdownActiveRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
  }

  function handleReset() {
    sessionStorage.removeItem("likedLocations");
    sessionStorage.removeItem("reactionPhotos");
    resetCamera();
    navigate("/");
  }

  function handleResults() {
    navigate("/results");
  }

  const currentLoc = deck[deckIndex];

  return (
    <div className="screen active" id="swipe">
      <video ref={videoRef} id="video-bg" autoPlay playsInline muted />
      <canvas ref={canvasRef} id="canvas-overlay" />
      <canvas ref={captureCanvasRef} id="capture-canvas" />

      <div className="swipe-ui">
        <div className="top-bar">
          <div className="logo">
            ant<span>werp</span>
          </div>
          <div className={`likes-counter ${heartPulse ? "heart-pulse" : ""}`}>
            <span className="heart" id="heart-icon">
              ♥
            </span>
            <span id="likes-count">{likedLocations.length}</span> / 6
          </div>
          <div className="category-badge" id="cat-badge">
            {category === "all"
              ? "All Spots"
              : category.charAt(0).toUpperCase() + category.slice(1) + "s"}
          </div>
        </div>

        <div className="progress-film" id="progress-film">
          {deck.map((_, i) => (
            <div
              key={i}
              className={`film-frame ${i < deckIndex ? "done" : ""}`}
            />
          ))}
        </div>

        <div className={`gesture-status ${handDetected ? "detected" : ""}`} id="gesture-status">
          {handStatus}
        </div>

        <div className="card-area">
          {currentLoc && (
            <div
              ref={cardRef}
              className={`location-card ${swipeClass}`}
              id="location-card"
              style={dragStyle}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="card-inner">
                <div className="card-image" id="card-image">
                  {currentLoc.emoji}
                </div>
                <div className="card-body">
                  <div className="card-type" id="card-type">
                    {currentLoc.type} · {currentLoc.neighborhood}
                  </div>
                  <div className="card-name" id="card-name">
                    {currentLoc.name}
                  </div>
                  <div className="card-meta" id="card-meta">
                    📍 {currentLoc.address} ⭐ {currentLoc.rating}
                  </div>
                  <div className="card-tags" id="card-tags">
                    {currentLoc.tags.map((tag, i) => (
                      <span key={i} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div
                className="card-vote-overlay like"
                id="overlay-like"
                style={{ opacity: likeOpacity }}
              >
                keeper!
              </div>
              <div
                className="card-vote-overlay nope"
                id="overlay-nope"
                style={{ opacity: nopeOpacity }}
              >
                nope
              </div>
            </div>
          )}
        </div>

        <div className="gesture-indicator">
          <button
            className="gesture-btn dislike"
            id="btn-dislike"
            onClick={() => handleVote(false)}
            title="Pass"
          >
            👎
          </button>
          <button
            className="gesture-btn like"
            id="btn-like"
            onClick={() => handleVote(true)}
            title="Like"
          >
            👍
          </button>
        </div>

        <div className="no-camera-notice" id="no-camera-notice">
          no camera — use buttons below
        </div>
      </div>

      <div className={`done-overlay ${showDone ? "visible" : ""}`} id="done-overlay">
        <div className="done-emoji">🎞</div>
        <h2>Roll complete!</h2>
        <p>
          You loved <strong id="done-likes">{likedLocations.length}</strong> spots. Time
          to develop the film.
        </p>
        <button className="btn-primary" onClick={handleResults}>
          See my picks →
        </button>
        <button className="btn-back" onClick={handleReset}>
          ↩ reshoot
        </button>
      </div>

      <div className={`countdown-overlay-container ${countdownActive ? "visible" : ""}`} id="countdown-overlay">
        <div className={`countdown-number ${countdownVal.includes("Cheese") ? "cheese" : ""}`}>
          {countdownVal}
        </div>
      </div>

      <div className={`flash-overlay-container ${showFlash ? "flash" : ""}`} id="flash-overlay" />
    </div>
  );
}
