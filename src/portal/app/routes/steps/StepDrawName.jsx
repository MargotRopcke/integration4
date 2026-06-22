import "./StepDrawName.css";
import { FormStepLayout } from "../layouts/FormStepLayout";

export function StepDrawName({ canvasRef, hasDrawn, onClear, onSave }) {
  return (
    <FormStepLayout id="step-1" current={1} className="step-draw">
      <div className="form-header step-draw__header">
        <h1 className="form-heading">Hey there! <br /> Ready to make your own version of Antwerp?</h1>
        <p className="form-subheading">
          Most visitors see the same city. The Portal helps you discover local Antwerp your way.
        </p>
      </div>

      <div className="canvas-wrapper">
        {/* grid: banner and card share the same area, banner sits behind via z-index */}
        <div className="canvas-grid">

          {/* Banner spans full grid area, behind the card */}
          <div className="canvas-banner" aria-hidden="true">
            <span>Your version</span>
          </div>

          {/* Pencil sits in its own column to the right */}
          <div className="canvas-pencil-col" aria-hidden="true">
            <svg className="canvas-pencil-svg" viewBox="0 0 52 130" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="11" y="8" width="30" height="90" rx="4" fill="#FDFEEF" stroke="#1B9BD1" strokeWidth="3" />
              <rect x="11" y="76" width="30" height="10" fill="#1B9BD1" />
              <path d="M11 98 L41 98 L26 126 Z" fill="#F5C4A0" />
              <path d="M19 114 L33 114 L26 126 Z" fill="#555" />
              <rect x="11" y="3" width="30" height="10" rx="2" fill="#F9A0A0" />
              <rect x="11" y="10" width="30" height="4" fill="#1B9BD1" />
              <line x1="20" y1="14" x2="20" y2="95" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          {/* Centre: the red drawing card */}
          <div className="canvas-container">
            <div className="canvas-title-row">
              <span className="canvas-title">What is your name?</span>
            </div>
            <div className="canvas-draw-area">
              <div className={`canvas-hint ${hasDrawn ? "hidden" : ""}`}>Draw here</div>
              <canvas ref={canvasRef} id="canvas" width={950} height={700} className="canvas-element" />
            </div>
            <div className="canvas-actions">
              <button onClick={onSave} className="canvas-action-btn" disabled={!hasDrawn}
                style={{ opacity: hasDrawn ? 1 : 0.4, cursor: hasDrawn ? "pointer" : "not-allowed" }}
                id="save" aria-label="Save name">
                <svg xmlns="http://www.w3.org/2000/svg" width="89" height="76" viewBox="0 0 89 76" fill="none">
                  <path d="M3.9926 44.7363C3.16257 45.5664 2.72949 46.6494 2.72949 47.8042C2.72949 48.959 3.19866 50.0763 3.9926 50.8703L24.8876 71.7655C26.5838 73.4616 29.3626 73.4616 31.0587 71.7655L84.433 18.3909C85.2631 17.5609 85.6962 16.4797 85.6962 15.3249C85.6962 14.17 85.227 13.051 84.433 12.257L76.1689 3.99269C75.3389 3.16266 74.2562 2.72925 73.1014 2.72925C71.9466 2.72925 70.8279 3.19875 70.0339 3.99269L27.9912 46.035L18.4279 36.472C17.5978 35.642 16.5152 35.2086 15.3603 35.2086C14.2055 35.2086 13.0868 35.6781 12.2929 36.472L4.02867 44.7363H3.9926Z" stroke="#FDFEEF" strokeWidth="5.45833" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button onClick={onClear} className="canvas-action-btn" id="clear" aria-label="Clear canvas">
                <svg xmlns="http://www.w3.org/2000/svg" width="81" height="75" viewBox="0 0 81 75" fill="none">
                  <path d="M70.2331 14.5334L64.2523 66.3089C63.8888 69.3775 61.0801 71.6941 57.6766 71.6941H23.3114C19.941 71.6941 17.0992 69.3775 16.7357 66.3089L10.7549 14.5334" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2.5 14.5334H78.5" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M25.6387 14.5338V5.50846C25.6387 3.85381 27.1256 2.5 28.943 2.5H52.0735C53.8908 2.5 55.3778 3.85381 55.3778 5.50846V14.5338" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M40.5 28.0706V59.6594" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M55.3651 28.0706L53.7129 59.6594" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M25.6387 28.0706L27.2908 59.6594" stroke="#FDFEEF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        <p className="canvas-privacy-note">Your experience is private and only visible to you.</p>
      </div>
    </FormStepLayout>
  );
}