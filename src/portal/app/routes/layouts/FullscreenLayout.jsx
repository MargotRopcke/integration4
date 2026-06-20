import "./FullscreenLayout.css";

/**
 * Wraps fullscreen steps: StepSwipe (7) and StepSummary (8).
 *
 * Props:
 *   id         — the step id string e.g. "swipe" or "step-8"
 *   className  — extra class alongside swipe-screen
 *   children
 */
export function FullscreenLayout({ id, className = "", children }) {
  return (
    <div className={`swipe-screen ${className}`} id={id}>
      {children}
    </div>
  );
}
