export function StepIntro({ onStart }) {
  return (
    <div className="step-intro" id="step-0">
      <div className="intro-portal-icon">
        <div className="intro-portal-ring" />
        <div className="intro-portal-ring intro-portal-ring--inner" />
        <div className="intro-portal-dot" />
      </div>
      <h1 className="form-heading">The Portal</h1>
      <p className="form-subheading">
        Answer a few questions to unlock your custom itinerary and discover Antwerp your own way.
      </p>
      <button className="btn-form" onClick={onStart} style={{ marginTop: "2rem" }} id="start-button">
        Start Journey →
      </button>
    </div>
  );
}
