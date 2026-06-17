export function StepPrinting({ status, collageUrl, errorMsg, onRetry, onSkip }) {
  return (
    <div
      className="step-container"
      id="step-printing"
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", padding: "2rem",
        background: "#0a0a0f", color: "#e8e8ed",
      }}
    >
      {collageUrl && (
        <div style={{
          width: "100%", maxWidth: 560, borderRadius: 16,
          overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: "2rem", boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
        }}>
          <img src={collageUrl} alt="Your reaction photo collage" style={{ width: "100%", display: "block" }} />
        </div>
      )}

      {status === "printing" && (
        <>
          <div className="loader" style={{ marginBottom: "1.25rem" }} />
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
            Printing your collage…
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>
            Sending to the HP Envy 5530 — please wait.
          </p>
        </>
      )}

      {status === "done" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🖨️ ✓</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem", color: "#2ecc71" }}>
            Print job sent!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>
            Taking you to your QR code…
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem", color: "#e74c3c" }}>
            Couldn't reach the printer
          </h2>
          <p style={{
            color: "rgba(255,255,255,0.55)", fontSize: "0.9rem",
            maxWidth: 400, textAlign: "center", marginBottom: "0.5rem",
          }}>
            {errorMsg || "Make sure print-server.js is running (node print-server.js)."}
          </p>
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button className="btn-form" onClick={onRetry}>↺ Try Again</button>
            <button className="btn-form btn-form--secondary" onClick={onSkip}>Skip printing →</button>
          </div>
        </>
      )}
    </div>
  );
}
