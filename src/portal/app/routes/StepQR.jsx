import "./StepQR.css";
import aLogo from "../../assets/icons/a-logo.svg";

export function StepQR({ sessionUserId, sessionSaving, likesCount, likedLocations, travelerType, onReset }) {
  const qrUrl = sessionUserId
    ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&color=e13b2c&bgcolor=fafcf0&data=${encodeURIComponent(
        `https://margotropcke.github.io/integration4/?user=${sessionUserId}`
      )}`
    : null;

  return (
    <div className="step-qr" id="step-9">

      {/* Red top half */}
      <div className="qr-top">
        {/* Diagonal "City of Antwerp" banner */}
        <div className="qr-diagonal-banner" aria-hidden="true">
          <div className="qr-diagonal-inner">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="qr-banner-text">City of Antwerp</span>
            ))}
          </div>
        </div>

        <h1 className="qr-heading">
          Thank you for creating your version of Antwerp with me!
        </h1>
      </div>

      {/* Cream bottom half */}
      <div className="qr-bottom">
        {sessionSaving || !sessionUserId ? (
          <div className="qr-loading">
            <div className="loader" />
            <p>Generating your itinerary…</p>
          </div>
        ) : (
          <>
            <div className="qr-code-block">
              <img
                className="qr-code-img"
                src={qrUrl}
                alt="QR code for your Antwerp itinerary"
              />
            </div>

            <p className="qr-scan-label">
              Scan the QR and see your spots on<br />your phone to continue your journey.
            </p>

            <img src={aLogo} alt="City of Antwerp" className="qr-a-logo" />
          </>
        )}
      </div>
    </div>
  );
}
