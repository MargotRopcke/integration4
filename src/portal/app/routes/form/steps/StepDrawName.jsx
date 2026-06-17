export function StepDrawName({ canvasRef, hasDrawn, onClear, onSave }) {
  return (
    <div className="step-container" id="step-1">
      <div className="form-header">
        <h1 className="form-heading">Hey there! Ready to make your own version of Antwerp?</h1>
        <p className="form-subheading">
          Most visitors see the same city. The Portal helps you discover local Antwerp your way.
        </p>
      </div>
      <p className="form-prompt">What is your name?</p>
      <div className="canvas-wrapper">
        <div className="canvas-container">
          <div className={`canvas-hint ${hasDrawn ? "hidden" : ""}`}>Write your name here</div>
          <canvas
            ref={canvasRef}
            id="canvas"
            width={950}
            height={1000}
            className="canvas-element"
          />
        </div>
        <div className="canvas-actions">
          <button onClick={onClear} className="btn-form btn-form--secondary" id="clear">
            Clear
          </button>
          <button
            onClick={onSave}
            className="btn-form"
            disabled={!hasDrawn}
            style={{ opacity: hasDrawn ? 1 : 0.5, cursor: hasDrawn ? "pointer" : "not-allowed" }}
            id="save"
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}
