import { BackButton } from "../components/BackButton";
import { StepProgress } from "../components/StepProgress";
const BUDGET_OPTIONS = ["€ (≤30)", "€€ (≤60)", "€€€ (≥60)"];
const DISTANCE_OPTIONS = ["walking (0-2km)", "bike (2-5km)", "tram (if possible)"];


export function StepBudgetDistance({ budget, distance, onBudget, onDistance, onNext, onBack }) {
  return (
    <div className="step-container" id="step-5">
      <BackButton onClick={onBack} />
      <div className="form-header">
        <h1 className="form-heading">Shape the path to where you want to be.</h1>
      </div>
      <div className="budget-distance-container">
        <div className="question-group">
          <span className="group-title">Budget p./p.</span>
          <div className="options-row">
            {BUDGET_OPTIONS.map((opt) => (
              <div
                key={opt}
                onClick={() => onBudget(opt)}
                className={`option-btn ${budget === opt ? "active" : ""}`}
                id={`budget-${opt.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
        <div className="question-group">
          <span className="group-title">Distance</span>
          <div className="options-row">
            {DISTANCE_OPTIONS.map((opt) => (
              <div
                key={opt}
                onClick={() => onDistance(opt)}
                className={`option-btn ${distance === opt ? "active" : ""}`}
                id={`distance-${opt.split(" ")[0].toLowerCase()}`}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="vibes-actions" style={{ marginTop: "2rem" }}>
        <button onClick={onNext} className="btn-form" id="budget-distance-next">Next</button>
      </div>
      <StepProgress current={5} total={6} />
    </div>
  );
}
