import { useState } from "react";

export function StepPhotos({ takePictures, onChoose }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="step-container" id="step-6">
      <div className="form-header">
        <h1 className="form-heading">Take pictures during experience?</h1>
        <p className="form-subheading" style={{ margin: "1.5rem auto", maxWidth: "600px" }}>
          6 Pictures will be taken of you during the experience to create a photo collage.
          <br /><br />
          These pictures are meant as memories for your trip to Antwerp. You can share them
          with your friends or keep them to yourself.
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--form-text-muted)", opacity: 0.8, maxWidth: "500px", margin: "0 auto 1.5rem" }}>
          These are just for yourself, we don't use these pictures outside of this experience.
        </p>
      </div>

      <div className="camera-choice-grid">
        <div
          onClick={() => onChoose("yes")}
          className={`camera-choice-card ${takePictures === "yes" ? "active" : ""}`}
          id="camera-choice-yes"
        >
          <div className="camera-choice-icon">📸</div>
          <div className="camera-choice-title">Yes</div>
        </div>
        <div
          onClick={() => setShowPopup(true)}
          className={`camera-choice-card ${takePictures === "no" ? "active" : ""}`}
          id="camera-choice-no"
        >
          <div className="camera-choice-icon">🚫</div>
          <div className="camera-choice-title">No</div>
        </div>
      </div>

      {showPopup && (
        <div className="popup-overlay" id="no-photos-popup">
          <div className="popup-card">
            <h2 className="popup-title">Are you sure?</h2>
            <p className="popup-desc">
              Taking photos during the experience leads to better outcomes and creates a more
              engaging overall experience.
            </p>
            <div className="popup-actions">
              <button
                className="btn-form"
                onClick={() => { setShowPopup(false); onChoose("no"); }}
                id="popup-confirm-no-photos"
              >
                Yes, continue
              </button>
              <button
                className="btn-form btn-form--secondary"
                onClick={() => setShowPopup(false)}
                id="popup-cancel-no-photos"
              >
                No, I'm not sure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
