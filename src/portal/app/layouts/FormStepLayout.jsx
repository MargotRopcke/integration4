import "./FormStepLayout.css";
import { BackButton } from "../components/BackButton";
import { StepProgress } from "../components/StepProgress";

/**
 * Wraps steps 1–6.
 * Handles: back button, step progress dots, step-container div.
 *
 * Props:
 *   id         — the step id string e.g. "step-1"
 *   current    — current step number (1-based) for progress dots
 *   total      — total number of steps (default 6)
 *   onBack     — back button handler (omit to hide back button)
 *   className  — extra class on the step-container div
 *   title      — the step title
 *   subtitle   — the step subtitle
 *   children
 */
export function FormStepLayout({ id, current, total = 6, onBack, className = "", title, subtitle = "", children }) {
  return (
    <div className={`step-container ${className}`} id={id}>
      <div className="header-container">
        {onBack && <BackButton onClick={onBack} />}
        <div className="title-container">
          {title && <h1 className="title">{title}</h1>}
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
      </div>
      {children}
      <StepProgress current={current} total={total} />
    </div>
  );
}