import "./StepCategory.css";
import { FormStepLayout } from "../layouts/FormStepLayout";
import bag from "../../assets/stickers/bag-yellow.svg";
import lips from "../../assets/stickers/lips-green.svg";

const CATEGORY_DECO = {
  style: bag,
  flavour: lips,
};
// Fallback descriptions if not in Supabase
const CATEGORY_META = {
  style: { description: "Through fashion, aesthetics and expression" },
  flavour: { description: "Through food, experiences and local character." },
};

export function StepCategory({ categories, onSelect, onBack }) {
  return (
    <FormStepLayout id="step-3" current={3} onBack={onBack} className="step-category-wrap" title={"What would you like to \"taste\" of Antwerp?"} subtitle={"Every portal needs an entry point."}>

      <div className="category-choice-grid">
        {categories.map((cat) => {
          const key = cat.name.trim().toLowerCase();
          const meta = CATEGORY_META[key] ?? {};

          return (
            <div
              key={cat.id}
              onClick={() => onSelect(cat)}
              className={`category-card category-card--${key}`}
              id={`category-choice-${key}`}
            >
              {/* Decorative image from Supabase — floats outside the inner box */}

              {CATEGORY_DECO[key] && (
                <img
                  src={CATEGORY_DECO[key]}
                  alt=""
                  className="category-card-deco"
                  aria-hidden="true"
                />
              )}

              {/* White inner box with just the name */}
              <div className="category-card__inner">
                <span className="category-card__name">{cat.name.trim()}</span>
              </div>

              {/* Description below the white box */}
              {meta.description && (
                <p className="category-card__desc">{meta.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </FormStepLayout>
  );
}