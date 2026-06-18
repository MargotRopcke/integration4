import { BackButton } from "../components/BackButton";
import { StepProgress } from "../components/StepProgress";
const CATEGORY_IMG = { style: "👗", flavour: "🍽" };

export function StepCategory({ categories, onSelect, onBack }) {
  return (
    <div className="step-container" id="step-3">
      <BackButton onClick={onBack} />
      <div className="form-header">
        <h1 className="form-heading">What would you like to “taste” of Antwerp?</h1>
        <p className="form-subheading">Every portal needs an entry point. </p>
      </div>
      <div className="category-choice-grid">
        {categories.map((cat) => {
          const key = cat.name.trim().toLowerCase();
          const img = CATEGORY_IMG[key] ?? "🗂";
          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="category-choice-card"
              id={`category-choice-${key}`}
            >
              <div className="category-choice-icon">{img}</div>
              <h3 className="category-choice-title">{cat.name.trim()}</h3>
            </div>
          );
        })}
      </div>
      <StepProgress current={3} total={6} />
    </div>
  );
}
