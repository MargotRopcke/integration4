import { useEffect, useState } from "react";

export function StepPrinting({ status, collageUrl, errorMsg, onRetry, onSkip }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (collageUrl) {
      const t = setTimeout(() => setAnimating(true), 80);
      return () => clearTimeout(t);
    }
  }, [collageUrl]);

  return (
    <div className="step-printing-new" id="step-printing">

      {/* Status text top */}
      <div className="printing-top">
        {status === "printing" && <h2 className="printing-title">Printing...</h2>}
        {status === "done"     && <h2 className="printing-title printing-title--done">Done! ✓</h2>}
        {status === "error"    && <h2 className="printing-title printing-title--error">Error</h2>}
      </div>

      {/* Collage sliding up from the bottom */}
      {collageUrl && (
        <div className={`printing-collage-slide ${animating ? "printing-collage-slide--in" : ""}`}>
          <img
            src={collageUrl}
            alt="Your collage"
            className="printing-collage-img"
            draggable={false}
          />
        </div>
      )}

      {/* Error actions */}
      {status === "error" && (
        <div className="printing-error-actions">
          <p className="printing-error-msg">{errorMsg || "Couldn't reach the printer."}</p>
          <button className="btn-form" onClick={onRetry}>↺ Try Again</button>
          <button className="btn-form btn-form--secondary" onClick={onSkip}>Skip →</button>
        </div>
      )}
    </div>
  );
}
