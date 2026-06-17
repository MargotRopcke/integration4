export function StepQR({ sessionUserId, sessionSaving, likesCount, likedLocations, travelerType, onReset }) {
  const qrUrl = sessionUserId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
        `https://margotropcke.github.io/integration4/?user=${sessionUserId}`
      )}`
    : null;

  return (
    <div className="step-container" id="step-9">
      <div className="form-header">
        <h1 className="form-heading">Your Antwerp journey awaits! 🎉</h1>
        <p className="form-subheading">
          Scan the QR code below to get your personalised Antwerp itinerary with all your liked spots.
        </p>
      </div>

      <div className="qr-container">
        {sessionSaving || !sessionUserId ? (
          <div className="swipe-loading">
            <div className="loader" />
            <p>Generating your itinerary…</p>
          </div>
        ) : (
          <>
            <div className="qr-code-wrapper">
              <img
                className="qr-code-image"
                src={qrUrl}
                alt="QR code for your itinerary"
              />
            </div>
            <div className="qr-liked-spots">
              <p className="qr-spots-label">
                Your {likesCount} liked spot{likesCount !== 1 ? "s" : ""}:
              </p>
              <div className="summary-vibes-tags">
                {likedLocations.map((loc) => (
                  <span key={loc.keyID || loc.name} className="summary-vibe-tag">
                    📍 {loc.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="qr-traveler-badge">
              <span>🧭 {travelerType}</span>
            </div>
          </>
        )}
      </div>

      <div className="summary-actions" style={{ marginTop: "2rem" }}>
        <button onClick={onReset} className="btn-form btn-form--secondary" id="restart-button">
          ↩ Start Over
        </button>
      </div>
    </div>
  );
}
