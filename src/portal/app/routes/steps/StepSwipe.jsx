import { MAX_LIKES } from "../constants";
import { TutorialScreen } from "./TutorialScreen";

export function StepSwipe({
  // deck state
  loading, deck, deckIndex, currentCard,
  likesCount, swipeDone, cardSwipeClass,
  overlayLike, overlayNope,
  countdownVisible, countdownText, countdownCheese,
  flashActive,
  // tutorial
  tutorialActive, tutorialStep, tutorialHoldBars,
  nextTutorialStep,
  // gesture
  gestureStatus, gestureDetected, noCameraNotice,
  // camera DOM refs
  videoRef, canvasOverlayRef, outputCanvasRef, bgImageRef,
  // card drag ref
  cardRef,
  // actions
  onVote, onGoBack, onShowResults, onReset,
  // derived
  categoryLabel, progressPct,
  // liked locations for polaroid stack
  likedLocations,
}) {
  if (loading) {
    return (
      <div className="swipe-screen" id="swipe">
        <div className="swipe-loading">
          <div className="loader" />
          <p>Loading your personalised spots…</p>
        </div>
      </div>
    );
  }

  if (deck.length === 0) {
    return (
      <div className="swipe-screen" id="swipe">
        <div className="swipe-loading">
          <p className="swipe-empty-icon">😔</p>
          <p>No locations found matching your preferences.</p>
          <button className="btn-form" onClick={() => onReset("preferences")}>
            ← Adjust Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-screen" id="swipe">

      {/* ── ALWAYS MOUNTED: video + canvases so camera runs during tutorial too ── */}
      <video
        ref={videoRef}
        id="video-bg"
        className="input_video"
        style={{ display: "none" }}
        autoPlay
        playsInline
        muted
      />

      {/* Background layer — hidden during tutorial, visible during live swipe */}
      <div className="video-wrapper" style={{ opacity: tutorialActive ? 0 : 1 }}>
        {currentCard && (
          <img
            ref={bgImageRef}
            className="bg-image"
            src={currentCard.image}
            alt="background"
            crossOrigin="anonymous"
          />
        )}
        <canvas ref={outputCanvasRef} className="output_canvas" />
      </div>

      {/* Hand landmark canvas — hidden during tutorial */}
      <canvas
        ref={canvasOverlayRef}
        id="canvas-overlay"
        style={{ opacity: tutorialActive ? 0 : 1 }}
      />

      {/* ── TUTORIAL OVERLAY — sits on top, camera runs underneath ── */}
      {tutorialActive && (
        <div className="tutorial-overlay-new" id="tutorial-overlay">
          <TutorialScreen
            tutorialStep={tutorialStep}
            tutorialHoldBars={tutorialHoldBars}
            nextTutorialStep={nextTutorialStep}
          />
        </div>
      )}

      {/* ── LIVE SWIPE UI — hidden during tutorial ── */}
      {!tutorialActive && (
        <>
          {/* Gesture status floating top-center */}
          <div
            className={`swipe-gesture-hint ${gestureDetected ? "detected" : ""}`}
            id="gesture-status"
          >
            {gestureStatus}
          </div>

          {/* Bottom UI row: polaroid stack | gesture btns | location card */}
          <div className="swipe-bottom">

            {/* Left: polaroid stack with liked counter */}
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
                {likedLocations.length === 0 && (
                  <div className="swipe-stack-card swipe-stack-card--empty" />
                )}
              </div>
            </div>

            {/* Center: like / undo / dislike buttons */}
            <div className="swipe-gesture-btns">
              <button
                className="swipe-gesture-btn swipe-gesture-btn--like"
                onClick={() => onVote(true)}
                title="Like"
              >👍</button>
              <button
                className="swipe-gesture-btn swipe-gesture-btn--undo"
                onClick={onGoBack}
                title="Undo"
                style={{
                  opacity: deckIndex > 0 ? 1 : 0.35,
                  pointerEvents: deckIndex > 0 ? "auto" : "none",
                }}
              >✋</button>
              <button
                className="swipe-gesture-btn swipe-gesture-btn--dislike"
                onClick={() => onVote(false)}
                title="Dislike"
              >👎</button>
            </div>

            {/* Right: location card */}
            {currentCard && (
              <div
                className={`swipe-location-card ${cardSwipeClass}`}
                id="location-card"
                ref={cardRef}
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
            <div className="no-camera-notice" id="no-camera-notice">
              No camera — use buttons to vote
            </div>
          )}
        </>
      )}

      {/* Done overlay */}
      <div className={`done-overlay ${swipeDone ? "visible" : ""}`} id="done-overlay">
        <div className="done-emoji">🎉</div>
        <h2>You've seen it all!</h2>
        <p>You liked <strong>{likesCount}</strong> spots. Ready to see your picks?</p>
        <button className="btn-form" onClick={onShowResults}>See My Picks →</button>
        <button className="btn-back" onClick={onReset}>↩ Start Over</button>
      </div>

      {/* Countdown overlay */}
      <div className={`countdown-overlay ${countdownVisible ? "visible" : ""}`} id="countdown-overlay">
        <div className={`countdown-number ${countdownCheese ? "cheese" : ""}`} key={countdownText}>
          {countdownText}
        </div>
      </div>

      {/* Flash overlay */}
      <div className={`flash-overlay ${flashActive ? "flash" : ""}`} id="flash-overlay" />
    </div>
  );
}