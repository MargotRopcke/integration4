export function StepVibes({ vibes, chosenCategory, selectedVibes, onToggle, onDone }) {
  const filtered = vibes.filter((v) => v.primary_category_id === chosenCategory?.id);

  return (
    <div className="step-container" id="step-4">
      <div className="form-header">
        <h1 className="form-heading">Your taste shapes a more personal journey.</h1>
        <p className="form-subheading">Choose the vibe(s) that fit your taste:</p>
      </div>
      <div className="vibes-grid">
        {filtered.map((vibe) => {
          const name       = vibe.name.trim();
          const isSelected = selectedVibes.includes(name);
          return (
            <div
              key={vibe.id}
              onClick={() => onToggle(name)}
              className={`vibe-option ${isSelected ? "selected" : ""}`}
              id={`vibe-${name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="vibe-circle"><div className="vibe-dot" /></div>
              <span className="vibe-text">{name}</span>
            </div>
          );
        })}
      </div>
      <div className="vibes-actions">
        <button onClick={onDone} className="btn-form" id="done-button">Done</button>
      </div>
    </div>
  );
}
