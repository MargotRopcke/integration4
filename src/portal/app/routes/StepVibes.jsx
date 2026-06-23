import "./StepVibes.css";
import { FormStepLayout } from "../layouts/FormStepLayout";
import styleBag from "../../assets/stickers/style.svg";
import flavourLips from "../../assets/stickers/flavour.svg";

const CATEGORY_DECO = {
  style: styleBag,
  flavour: flavourLips,
};
// Color pairs [background, text] cycling per vibe index
const VIBE_COLORS = [
  ["#0582a8", "#ffffff"],   // teal bg, white text
  ["#ffcc00", "#16434f"],   // yellow bg, dark teal text
  ["#ffcc00", "#e13b2c"],   // yellow bg, red text
  ["#fcd7de", "#e13b2c"],   // pink bg, red text
  ["#fcd7de", "#0582a8"],   // pink bg, teal text
  ["#16434f", "#b6e388"],   // dark teal bg, green text
];


export function StepVibes({ vibes, chosenCategory, selectedVibes, onToggle, onDone, onBack }) {
  const filtered = vibes.filter((v) => v.primary_category_id === chosenCategory?.id);
  const categoryKey = chosenCategory?.name?.trim().toLowerCase() ?? "style";

  return (
    <FormStepLayout id="step-4" current={4} onBack={onBack}>
      <div className="vibes-header">
        <div className="vibes-heading-row">
          <h1 className="form-heading vibes-heading">
            Choose the vibe(s) that fit your taste:
          </h1>
          {/* Decorative image from primary_categories.image */}
          {CATEGORY_DECO[categoryKey] && (
            <img
              src={CATEGORY_DECO[categoryKey]}
              alt=""
              className="vibes-deco"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="form-subheading vibes-subheading">
          Your taste shapes a more personal journey.
        </p>
      </div>

      <div className="vibes-grid-wrap">
        {/* Grid crosshair lines — purely decorative */}
        <div className="vibes-gridlines" aria-hidden="true" />

        <div className="vibes-grid">
          {filtered.map((vibe, i) => {
            const name = vibe.name.trim();
            const isSelected = selectedVibes.includes(name);
            const [bg, text] = VIBE_COLORS[i % VIBE_COLORS.length];

            return (
              <button
                key={vibe.id}
                onClick={() => onToggle(name)}
                className={`vibe-pill ${isSelected ? "selected" : ""}`}
                id={`vibe-${name.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  backgroundColor: isSelected ? undefined : bg,
                  color: isSelected ? undefined : text,
                }}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="vibes-actions">
        <button onClick={onDone} className="btn-form btn-form--vibes-done" id="done-button">
          Done
        </button>
      </div>
    </FormStepLayout>
  );
}