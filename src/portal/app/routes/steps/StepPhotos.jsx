import "./StepPhotos.css";
import { useState } from "react";
import { FormStepLayout } from "../layouts/FormStepLayout";

// Drop your photos into app/assets/images/ with these names
import photoYes from "../../../assets/images/photo-yes.png";
import photoNo from "../../../assets/images/photo-no.png";

export function StepPhotos({ takePictures, onChoose, onBack }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <FormStepLayout id="step-6" current={6} onBack={onBack}>

      <div className="photos-header">
        <h1 className="form-heading photos-heading">
          Take pictures during experience?
        </h1>
        <p className="photos-desc">
          <strong>6 Pictures</strong> will be taken of you during the
          experience to create <strong>a photo collage</strong>.
        </p>
        <p className="photos-desc">
          These pictures are meant as memories for your trip to Antwerp.
          You can share them with your friends or keep them to yourself.
        </p>
        <p className="photos-privacy">
          These are just for yourself, we don't use these pictures outside
          of this experience.
        </p>
      </div>

      {/* Grid + polaroid cards */}
      <div className="photos-grid-wrap">
        <div className="photos-gridlines" aria-hidden="true" />

        <div className="photos-cards">
          {/* YES card */}
          <button
            className="polaroid polaroid--yes"
            onClick={() => onChoose("yes")}
            id="camera-choice-yes"
          >
            <div className="polaroid__photo">
              <img src={photoYes} alt="Take pictures" />
            </div>
            <span className="polaroid__label">YES</span>
          </button>

          {/* NO card */}
          <button
            className="polaroid polaroid--no"
            onClick={() => setShowPopup(true)}
            id="camera-choice-no"
          >
            <div className="polaroid__photo polaroid__photo--no">
              <img src={photoNo} alt="Skip pictures" />
            </div>
            <span className="polaroid__label">NO</span>
          </button>
        </div>
      </div>

      {/* Confirmation popup */}
      {showPopup && (
        <div className="popup-overlay" id="no-photos-popup">
          <div className="popup-card">
            <h2 className="popup-title">Are you sure?</h2>
            <p className="popup-desc">
              Taking photos during the experience leads to better outcomes
              and creates a more engaging overall experience.
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

    </FormStepLayout>
  );
}