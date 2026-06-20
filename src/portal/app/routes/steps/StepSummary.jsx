import aLogo from "../../../assets/icons/a-logo.svg";
import thumbUp   from "../../../assets/icons/hand-up.svg";
import thumbDown from "../../../assets/icons/hand-down.svg";

const CARD_COLORS = ["#e8b4bc", "#5b9bd5", "#e07070", "#7bc67e", "#f0d060", "#4a7a8a"];

export function StepSummary({
  likesCount, likedLocations, reactionPhotos,
  videoRef, canvasRef,
  gestureStatus, gestureDetected, gestureProgress, gestureType, flash,
  onPrint, onSwipeAgain,
}) {
  const photos = reactionPhotos.length > 0
    ? reactionPhotos
    : likedLocations.map((loc) => ({ dataUrl: loc.image, locationName: loc.name }));

  return (
    <div className="step-summary" id="step-8">
      {/* Hidden camera elements */}
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline muted />
      <canvas
        ref={canvasRef}
        className="summary-gesture-canvas"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
      />
      <div className={`flash-overlay ${flash ? "flash" : ""}`} />

      {/* Thumbs up icon */}
      <div className="summary-top-icon">
        <img src={thumbUp} alt="" className="summary-thumb-icon" />
      </div>

      {/* Heading */}
      <h1 className="summary-heading">
        Your version of<br />Antwerp is ready!
      </h1>

      {/* Photo grid */}
      <div className="summary-photo-grid">
        {photos.slice(0, 6).map((photo, i) => (
          <div
            key={i}
            className="summary-photo-card"
            style={{ "--card-color": CARD_COLORS[i % CARD_COLORS.length] }}
          >
            {photo.dataUrl ? (
              <img src={photo.dataUrl} alt={photo.locationName} className="summary-photo-img" />
            ) : (
              <div className="summary-photo-placeholder" />
            )}
            <span className="summary-photo-label" style={{ color: CARD_COLORS[i % CARD_COLORS.length] }}>
              {photo.locationName}
            </span>
          </div>
        ))}
      </div>

      {/* Gesture status (hidden but functional) */}
      <div className={`summary-gesture-status-hidden ${gestureDetected ? "detected" : ""}`}>
        {gestureStatus}
      </div>

      {/* Action buttons */}
      <div className="summary-actions-row">
        <button
          className={`summary-action-btn summary-action-btn--print ${gestureType === "thumbsUp" ? "active" : ""}`}
          onClick={onPrint}
        >
          <img src={thumbUp} alt="" className="summary-action-icon" />
          {gestureType === "thumbsUp" && (
            <div className="summary-progress-bar">
              <div className="summary-progress-fill summary-progress-fill--like" style={{ width: `${gestureProgress}%` }} />
            </div>
          )}
          <span>Start printing</span>
        </button>

        <button
          className={`summary-action-btn summary-action-btn--restart ${gestureType === "thumbsDown" ? "active" : ""}`}
          onClick={onSwipeAgain}
        >
          <img src={thumbDown} alt="" className="summary-action-icon summary-action-icon--down" />
          {gestureType === "thumbsDown" && (
            <div className="summary-progress-bar">
              <div className="summary-progress-fill summary-progress-fill--dislike" style={{ width: `${gestureProgress}%` }} />
            </div>
          )}
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
