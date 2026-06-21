import "./StepSwipe.css";
import { useState, useEffect } from "react";
import { MAX_LIKES } from "../constants";
import { TutorialScreen } from "./TutorialScreen.jsx";
import { GestureProgressIcon, GestureSVG } from "../components/GestureIcons.jsx";

// ── Match popup — shown briefly after each like ───────────────────────────────
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

// ── Done overlay — "you've seen it all" modal ─────────────────────────────────
function DoneOverlay({ visible, likesCount, gestureType, gestureProgress, onShowResults, onReset }) {
  if (!visible) return null;
  return (
    <div className="done-overlay visible">
      <div className="done-card">
        {/* Gesture hint top */}
        {gestureType && (
          <div className="done-gesture-hint">
            <GestureProgressIcon gesture={gestureType} progress={gestureProgress} size={52} />
          </div>
        )}
        <h2 className="done-title">You've seen it all.</h2>
        <p className="done-sub">
          {likesCount === 1 ? "You have one like left." : `You have ${MAX_LIKES - likesCount} like${MAX_LIKES - likesCount !== 1 ? "s" : ""} left.`}
        </p>
        <div className="done-actions">
          <button className="done-action-btn done-action-btn--like" onClick={onShowResults}>
            <GestureSVG gesture="thumbsUp" size={44} />
            <span>Swipe again</span>
          </button>
          <button className="done-action-btn done-action-btn--dislike" onClick={onReset}>
            <GestureSVG gesture="thumbsDown" size={44} />
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
  categoryLabel, progressPct,
  likedLocations,
}) {
  const [matchLocation, setMatchLocation] = useState(null);
  const prevLikesRef = { current: likesCount };

  // Show match popup whenever a new like is added
  useEffect(() => {
    if (likedLocations.length > 0 && !swipeDone) {
      const latest = likedLocations[likedLocations.length - 1];
      setMatchLocation(latest);
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

  const GESTURE_COLOR = { thumbsUp: "#b6e388", thumbsDown: "#e13b2c", stopHand: "#ffcc00" };

  return (
    <div className="swipe-screen" id="swipe">

      {/* ── Always-mounted camera elements ── */}
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline muted />

      {/* Fullscreen background — blurred location photo */}
      <div className="swipe-bg" style={{ opacity: tutorialActive ? 0 : 1 }}>
        {currentCard && (
          <img ref={bgImageRef} className="swipe-bg__img" src={currentCard.image} alt="" crossOrigin="anonymous" />
        )}
        <canvas ref={outputCanvasRef} className="swipe-bg__canvas" />
      </div>

      {/* Hand landmark canvas */}
      <canvas ref={canvasOverlayRef} className="swipe-landmark-canvas" style={{ opacity: tutorialActive ? 0 : 1 }} />

      {/* ── Gesture hint — always on top, visible during tutorial too ── */}
      <div
        className={`swipe-gesture-hint${gestureDetected && gestureType ? " swipe-gesture-hint--active" : ""}`}
        style={{ zIndex: tutorialActive ? 110 : 20 }}
      >
        {gestureDetected && gestureType && (
          <GestureProgressIcon
            gesture={gestureType}
            progress={gestureProgress}
            fillColor={GESTURE_COLOR[gestureType]}
            size={70}
          />
        )}
      </div>

      {/* ── Tutorial overlay ── */}
      {tutorialActive && (
        <div className="tutorial-overlay-new">
          <TutorialScreen
            tutorialStep={tutorialStep}
            tutorialHoldBars={tutorialHoldBars}
            nextTutorialStep={nextTutorialStep}
          />
        </div>
      )}

      {/* ── Live swipe UI ── */}
      {!tutorialActive && (
        <>
          {/* Bottom bar */}
          <div className="swipe-bottom">

            {/* Polaroid stack */}
            <div className="swipe-polaroid-stack">
              <div className="swipe-counter">{likesCount}/{MAX_LIKES}</div>
              <div className="swipe-stack-cards">
                {likedLocations.slice(-3).map((loc, i) => (
                  <div
                    key={loc.keyID || i}
                    className="swipe-stack-card"
                    style={{
                      transform: `rotate(${(i - 1) * 6}deg) translateY(${(2 - i) * 4}px)`,
                      zIndex: i,
                    }}
                  >
                    {loc.image && <img src={loc.image} alt={loc.name} />}
                  </div>
                ))}
                {likedLocations.length === 0 && <div className="swipe-stack-card swipe-stack-card--empty" />}
              </div>
            </div>

            {/* Gesture buttons */}
            <div
              className="swipe-gesture-btns"
              style={{ pointerEvents: tutorialActive ? "none" : "auto" }}
            >
              <button
                className={`swipe-gesture-btn swipe-gesture-btn--like${gestureType === "thumbsUp" ? " swipe-gesture-btn--active" : ""}`}
                onClick={() => onVote(true)}
                title="Like"
              >
                <GestureProgressIcon gesture="thumbsUp" progress={gestureType === "thumbsUp" ? gestureProgress : 0} size={32} />
              </button>

              <button
                className={`swipe-gesture-btn swipe-gesture-btn--undo${gestureType === "stopHand" ? " swipe-gesture-btn--active" : ""}`}
                onClick={onGoBack}
                title="Undo"
                style={{ opacity: deckIndex > 0 ? 1 : 0.35, pointerEvents: !tutorialActive && deckIndex > 0 ? "auto" : "none" }}
              >
                <GestureProgressIcon gesture="stopHand" progress={gestureType === "stopHand" ? gestureProgress : 0} size={26} />
              </button>

              <button
                className={`swipe-gesture-btn swipe-gesture-btn--dislike${gestureType === "thumbsDown" ? " swipe-gesture-btn--active" : ""}`}
                onClick={() => onVote(false)}
                title="Dislike"
              >
                <GestureProgressIcon gesture="thumbsDown" progress={gestureType === "thumbsDown" ? gestureProgress : 0} size={32} />
              </button>
            </div>

            {/* Location card */}
            {currentCard && (
              <div
                className={`swipe-location-card${cardSwipeClass ? ` ${cardSwipeClass}` : ""}`}
                ref={cardRef}
                style={{ pointerEvents: tutorialActive ? "none" : "auto" }}
              >
                <div className="swipe-location-card__map" />
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

      {/* Match popup */}
      <MatchPopup location={matchLocation} onDismiss={() => setMatchLocation(null)} />

      {/* Done overlay */}
      <DoneOverlay
        visible={swipeDone}
        likesCount={likesCount}
        gestureType={gestureType}
        gestureProgress={gestureProgress}
        onShowResults={onShowResults}
        onReset={() => onReset()}
      />

      {/* Countdown */}
      <div className={`countdown-overlay${countdownVisible ? " visible" : ""}`}>
        <div className={`countdown-number${countdownCheese ? " cheese" : ""}`} key={countdownText}>
          {countdownText}
        </div>
      </div>

      {/* Flash */}
      <div className={`flash-overlay${flashActive ? " flash" : ""}`} />
    </div>
  );
}
