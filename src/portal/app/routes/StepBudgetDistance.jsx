import "./StepBudgetDistance.css";
import { FormStepLayout } from "../layouts/FormStepLayout";

const BUDGET_OPTIONS = [
  { value: "€ (≤30)", label: "€", sub: "≤30" },
  { value: "€€ (≤60)", label: "€€", sub: "≤60" },
  { value: "€€€ (≥60)", label: "€€€", sub: "≥60" },
];

const DISTANCE_OPTIONS = [
  { value: "walking (0-2km)", label: "walking", sub: "0-2km", icon: "../../assets/icons/walk.svg" },
  { value: "bike (2-5km)", label: "bike", sub: "2-5km", icon: "../../assets/icons/bike.svg" },
  { value: "tram (if possible)", label: "tram", sub: "if possible", icon: "../../assets/icons/tram.svg" },
];

export function StepBudgetDistance({ budget, distance, onBudget, onDistance, onNext, onBack }) {

  const handleBudget = (val) => {
    onBudget(val);
    if (distance) setTimeout(() => onNext(), 400);
  };

  const handleDistance = (val) => {
    onDistance(val);
    if (budget) setTimeout(() => onNext(), 400);
  };

  return (
    <FormStepLayout id="step-5" current={5} onBack={onBack} title={"Shape the path to where you want to be."}>


      <div className="bd-container">

        {/* ── BUDGET ── */}
        <div className="bd-group">
          <span className="bd-group-title">Budget /p.p.</span>
          <div className="bd-options-row">
            {BUDGET_OPTIONS.map((opt) => (
              <div key={opt.value} className="bd-option-wrap">
                <button
                  onClick={() => handleBudget(opt.value)}
                  className={`bd-btn ${budget === opt.value ? "bd-btn--active" : ""}`}
                  id={`budget-${opt.label.toLowerCase()}`}
                >
                  {opt.label}
                </button>
                <span className="bd-sub">{opt.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISTANCE ── */}
        <div className="bd-group">
          <span className="bd-group-title">Distance</span>
          <div className="bd-options-row">
            {DISTANCE_OPTIONS.map((opt) => (
              <div key={opt.value} className="bd-option-wrap">
                <button
                  onClick={() => handleDistance(opt.value)}
                  className={`bd-btn bd-btn--icon ${distance === opt.value ? "bd-btn--active" : ""}`}
                  id={`distance-${opt.label}`}
                >
                  <img src={opt.icon} className="bd-btn__icon" alt={opt.label} />
                  <span className="bd-btn__label">{opt.label}</span>
                </button>
                <span className="bd-sub">{opt.sub}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </FormStepLayout>
  );
}