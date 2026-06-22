import "./StepSummary.css";
import { GestureProgressIcon } from "../components/GestureIcons.jsx";

const CARD_COLORS = ["#e8b4bc", "#5b9bd5", "#e07070", "#7bc67e", "#f0d060", "#4a7a8a"];

export function StepSummary({
  likesCount, likedLocations, reactionPhotos,
  videoRef, canvasRef,
  gestureDetected, gestureProgress, gestureType, flash,
  onPrint, onSwipeAgain,
}) {
  const photos = reactionPhotos.length > 0
    ? reactionPhotos
    : likedLocations.map((loc) => ({ dataUrl: loc.image, locationName: loc.name }));

  return (
    <div className="step-summary" id="step-8">
      <video ref={videoRef} style={{ display: "none" }} autoPlay playsInline muted />
      <canvas ref={canvasRef} className="summary-gesture-canvas" />
      <div className={`flash-overlay${flash ? " flash" : ""}`} />

      {/* Gesture hint — shows the active gesture filling up, empty spacer when idle */}
      <div className="summary-top-icon">
        <GestureProgressIcon
          gesture={gestureType || "thumbsUp"}
          progress={gestureType ? gestureProgress : 0}
          size={64}
        />
      </div>

      <h1 className="summary-heading">
        Your version of<br />Antwerp is ready!
      </h1>

      <div className="summary-photo-grid">
        {photos.slice(0, 6).map((photo, i) => (
          <div key={i} className="summary-photo-card" style={{ "--card-color": CARD_COLORS[i % CARD_COLORS.length] }}>
            {photo.dataUrl
              ? <img src={photo.dataUrl} alt={photo.locationName} className="summary-photo-img" />
              : <div className="summary-photo-placeholder" />}
            <span className="summary-photo-label" style={{ color: CARD_COLORS[i % CARD_COLORS.length] }}>
              {photo.locationName}
            </span>
          </div>
        ))}
      </div>

      <div className="summary-actions-row">
        <button
          className={`summary-action-btn${gestureType === "thumbsUp" ? " active" : ""}`}
          onClick={onPrint}
        >
          <GestureProgressIcon
            gesture="thumbsUp"
            progress={gestureType === "thumbsUp" ? gestureProgress : 0}
            size={48}
          />
          <span>Start printing</span>
        </button>

        <button
          className={`summary-action-btn${gestureType === "thumbsDown" ? " active" : ""}`}
          onClick={onSwipeAgain}
        >
          <GestureProgressIcon
            gesture="thumbsDown"
            progress={gestureType === "thumbsDown" ? gestureProgress : 0}
            size={48}
          />
          <span>Restart</span>
        </button>
      </div>
    </div>
  );
}
