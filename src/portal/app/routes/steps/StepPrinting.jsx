import { PrintingLayout } from "../layouts/PrintingLayout";

export function StepPrinting({ status, collageUrl, errorMsg, onRetry, onSkip }) {
  return (
    <PrintingLayout id="step-printing">
      {collageUrl && (
        <div className="printing-collage-preview">
          <img src={collageUrl} alt="Your reaction photo collage" />
        </div>
      )}

      {status === "printing" && (
        <>
          <div className="loader" />
          <h2 className="printing-heading">Printing your collage…</h2>
          <p className="printing-subtext">Sending to the HP Envy 5530 — please wait.</p>
        </>
      )}

      {status === "done" && (
        <>
          <div className="printing-icon">🖨️ ✓</div>
          <h2 className="printing-heading printing-heading--success">Print job sent!</h2>
          <p className="printing-subtext">Taking you to your QR code…</p>
        </>
      )}

      {status === "error" && (
        <>
          <div className="printing-icon">⚠️</div>
          <h2 className="printing-heading printing-heading--error">Couldn't reach the printer</h2>
          <p className="printing-subtext">
            {errorMsg || "Make sure print-server.js is running (node print-server.js)."}
          </p>
          <div className="printing-actions">
            <button className="btn-form" onClick={onRetry}>↺ Try Again</button>
            <button className="btn-form btn-form--secondary" onClick={onSkip}>Skip printing →</button>
          </div>
        </>
      )}
    </PrintingLayout>
  );
}
