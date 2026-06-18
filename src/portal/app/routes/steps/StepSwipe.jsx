import { MAX_LIKES } from "../constants";

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
          <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>😔</p>
          <p>No locations found matching your preferences.</p>
          <button className="btn-form" onClick={() => onReset("preferences")} style={{ marginTop: "1.5rem" }}>
            ← Adjust Preferences
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-screen" id="swipe">
      {/* Hidden video feed */}
      <video ref={videoRef} id="video-bg" className="input_video"
        style={{ display: "none" }} autoPlay playsInline muted />

      {/* Background: location image + segmented self */}
      <div className="video-wrapper">
        {currentCard && (
          <img ref={bgImageRef} className="bg-image"
            src={currentCard.image} alt="background" crossOrigin="anonymous" />
        )}
        <canvas ref={outputCanvasRef} className="output_canvas" />
      </div>

      {/* Hand landmark overlay */}
      <canvas ref={canvasOverlayRef} id="canvas-overlay" />

      {/* Tutorial overlay */}
      <div className={`tutorial-overlay ${tutorialActive ? "active" : ""}`} id="tutorial-overlay">
        <div className="tutorial-card">
          <div className={`tutorial-step ${tutorialStep !== 1 ? "hidden" : ""}`} id="tutorial-step-1">
            <h2 className="tutorial-title">Step onto the marker.</h2>
            <p className="tutorial-desc">
              After the instructions, we'll give you a selection of personalised local spots.
            </p>
            <div className="tutorial-visual alignment-marker">
              <div className="marker-circle">👤</div>
            </div>
            <button className="btn-form" onClick={nextTutorialStep}>I'm Ready!</button>
          </div>
          <div className={`tutorial-step ${tutorialStep !== 2 ? "hidden" : ""}`} id="tutorial-step-2">
            <h2 className="tutorial-title">Like the spot?</h2>
            <p className="tutorial-desc">Show a thumb up motion to try a like.</p>
            <div className="tutorial-visual gesture-hint">👍</div>
            <div className="tutorial-loader-container">
              <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[2]}%` }} />
            </div>
          </div>
          <div className={`tutorial-step ${tutorialStep !== 3 ? "hidden" : ""}`} id="tutorial-step-3">
            <h2 className="tutorial-title">Don't like the spot?</h2>
            <p className="tutorial-desc">Show a thumb down motion to try a dislike.</p>
            <div className="tutorial-visual gesture-hint">👎</div>
            <div className="tutorial-loader-container">
              <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[3]}%` }} />
            </div>
          </div>
          <div className={`tutorial-step ${tutorialStep !== 4 ? "hidden" : ""}`} id="tutorial-step-4">
            <h2 className="tutorial-title">Undo a (dis)like?</h2>
            <p className="tutorial-desc">Try a return by doing a stop motion.</p>
            <div className="tutorial-visual gesture-hint">✋</div>
            <div className="tutorial-loader-container">
              <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[4]}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main swipe UI */}
      <div className="swipe-ui">
        <div className="top-bar">
          <div className="logo">Antwerp</div>
          <div className="likes-counter">
            <span className="heart" id="heart-icon">♥</span>
            <span id="likes-count">{likesCount}</span> / {MAX_LIKES}
          </div>
          <div className="category-badge" id="cat-badge">{categoryLabel}</div>
        </div>

        <div className="progress-bar" style={{ marginBottom: ".5rem" }}>
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <div className={`gesture-status ${gestureDetected ? "detected" : ""}`} id="gesture-status">
          {gestureStatus}
        </div>

        <div className="card-area" id="card-area">
          {currentCard && (
            <div className={`location-card ${cardSwipeClass}`} id="location-card" ref={cardRef}>
              <div className="card-inner" id="card-inner">
                <div
                  className="card-image"
                  id="card-image"
                  style={{
                    backgroundImage:    `url(${currentCard.image})`,
                    backgroundSize:     "cover",
                    backgroundPosition: "center",
                  }}
                />
                <div className="card-body">
                  <div className="card-type"  id="card-type">{categoryLabel}</div>
                  <div className="card-name"  id="card-name">{currentCard.name}</div>
                  <div className="card-meta"  id="card-meta">
                    📍 {currentCard.address}
                    {currentCard.quote && ` · "${currentCard.quote}"`}
                  </div>
                </div>
              </div>
              <div className="card-vote-overlay like" style={{ opacity: overlayLike }}>LIKE ✓</div>
              <div className="card-vote-overlay nope" style={{ opacity: overlayNope }}>NOPE ✗</div>
            </div>
          )}
        </div>

        <div className="gesture-indicator">
          <div className="gesture-btn dislike" id="btn-dislike"
            onClick={() => onVote(false)} title="Dislike">👎</div>
          <div
            className="gesture-btn undo"
            id="btn-undo"
            onClick={onGoBack}
            title="Go back"
            style={{ opacity: deckIndex > 0 ? 1 : 0.3, pointerEvents: deckIndex > 0 ? "auto" : "none" }}
          >↩</div>
          <div className="gesture-btn like" id="btn-like"
            onClick={() => onVote(true)} title="Like">👍</div>
        </div>

        {noCameraNotice && (
          <div className="no-camera-notice" style={{ display: "block" }} id="no-camera-notice">
            No camera — use buttons to vote
          </div>
        )}
      </div>

      {/* Done overlay */}
      <div className={`done-overlay ${swipeDone ? "visible" : ""}`} id="done-overlay">
        <div className="done-emoji">🎉</div>
        <h2>You've seen it all!</h2>
        <p>You liked <strong>{likesCount}</strong> spots. Ready to see your picks?</p>
        <button className="btn-form" onClick={onShowResults}>See My Picks →</button>
        <button className="btn-back"  onClick={onReset}>↩ Start Over</button>
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
