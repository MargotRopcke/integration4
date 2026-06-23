import "./PrintingLayout.css";

/**
 * Wraps StepPrinting and StepQR — centered column on a dark background.
 *
 * Props:
 *   id        — the step id string e.g. "step-printing" or "step-9"
 *   children
 */
export function PrintingLayout({ id, children }) {
  return (
    <div className="step-printing" id={id}>
      {children}
    </div>
  );
}
