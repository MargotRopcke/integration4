const CATEGORY_ICONS = { style: "👗", flavour: "🍽" };

export function StepCategory({ categories, onSelect }) {
  return (
    <div className="step-container" id="step-3">
      <div className="form-header">
        <h1 className="form-heading">Your taste shapes a more personal journey.</h1>
        <p className="form-subheading">Choose style or flavour to refine your recommendation:</p>
      </div>
      <div className="category-choice-grid">
        {categories.map((cat) => {
          const key  = cat.name.trim().toLowerCase();
          const icon = CATEGORY_ICONS[key] ?? "🗂";
          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="category-choice-card"
              id={`category-choice-${key}`}
            >
              <div className="category-choice-icon">{icon}</div>
              <h3 className="category-choice-title">{cat.name.trim()}</h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}
