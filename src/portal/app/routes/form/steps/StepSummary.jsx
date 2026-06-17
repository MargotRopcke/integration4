export function StepSummary({
  likesCount, likedLocations, reactionPhotos,
  // camera refs
  videoRef, canvasRef,
  // gesture state
  gestureStatus, gestureDetected, gestureProgress, gestureType, flash,
  // actions
  onPrint, onSwipeAgain,
}) {
  return (
    <div className="swipe-screen summary-gesture-screen" id="step-8">
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline muted />
      <canvas
        ref={canvasRef}
        className="summary-gesture-canvas"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
      />
      <div className={`flash-overlay ${flash ? "flash" : ""}`} />

      <div className="summary-gesture-content">
        <div className="summary-gesture-header">
          <h1 className="form-heading" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
            Your Reaction Photos
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", marginTop: "0.5rem" }}>
            You liked <strong>{likesCount}</strong> spot{likesCount !== 1 ? "s" : ""} in Antwerp
          </p>
        </div>

        <div className="photos-grid summary-photos-grid" id="photos-grid-container">
          {reactionPhotos.length > 0 ? (
            reactionPhotos.map((photo, i) => (
              <div key={i} className="photo-cell">
                <img src={photo.dataUrl} alt={`Reaction to ${photo.locationName}`} />
                <div className="photo-cell-label">
                  <span className="photo-cell-emoji">📍</span> {photo.locationName}
                </div>
                <a
                  className="photo-download"
                  href={photo.dataUrl}
                  download={`reaction-${photo.locationName.replace(/\s+/g, "-").toLowerCase()}.jpg`}
                  title="Download photo"
                >⬇</a>
              </div>
            ))
          ) : (
            <div className="no-photos-msg" style={{ color: "#fff" }}>
              <p>No reaction photos were captured.</p>
              {likedLocations.length > 0 && (
                <div className="summary-list" style={{ marginTop: "1.5rem" }}>
                  <span className="summary-title" style={{ color: "#fff" }}>Your Liked Spots</span>
                  <div className="summary-vibes-tags">
                    {likedLocations.map((loc) => (
                      <span key={loc.keyID} className="summary-vibe-tag">📍 {loc.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="summary-gesture-choices">
          <div
            className={`summary-choice-card summary-choice-card--like ${gestureType === "thumbsUp" ? "active" : ""}`}
            onClick={onPrint}
            id="summary-choice-like"
          >
            <div className="summary-choice-icon">👍</div>
            <div className="summary-choice-label">Print &amp; get QR</div>
            <div className="summary-choice-hint">Hold thumbs up to print</div>
            {gestureType === "thumbsUp" && (
              <div className="summary-progress-bar">
                <div className="summary-progress-fill summary-progress-fill--like"
                  style={{ width: `${gestureProgress}%` }} />
              </div>
            )}
          </div>

          <div
            className={`summary-choice-card summary-choice-card--dislike ${gestureType === "thumbsDown" ? "active" : ""}`}
            onClick={onSwipeAgain}
            id="summary-choice-dislike"
          >
            <div className="summary-choice-icon">👎</div>
            <div className="summary-choice-label">Swipe again</div>
            <div className="summary-choice-hint">Hold thumbs down</div>
            {gestureType === "thumbsDown" && (
              <div className="summary-progress-bar">
                <div className="summary-progress-fill summary-progress-fill--dislike"
                  style={{ width: `${gestureProgress}%` }} />
              </div>
            )}
          </div>
        </div>

        <div className={`summary-gesture-status ${gestureDetected ? "detected" : ""}`} id="summary-gesture-status">
          {gestureStatus}
        </div>
      </div>
    </div>
  );
}
