import "./StepTravelerCarousel.css";
import { FormStepLayout } from "../layouts/FormStepLayout";

const CARD_COLORS = ["#E03C31", "#1477CC", "#7BC67A", "#F4A7B9", "#F5C842"];


export function StepTravelerCarousel({ travelers, activeIndex, onPrev, onNext, onSelect, onBack }) {
  const active = travelers[activeIndex];

  const getCardStyle = (index) => {
    const total = travelers.length;
    const diff = ((index - activeIndex) % total + total) % total;
    const offset = diff > total / 2 ? diff - total : diff;
    if (offset === 0) return { zIndex: 10, transform: "translateX(0) rotate(0deg) scale(1)", opacity: 1 };
    const absOff = Math.abs(offset);
    if (absOff > 2) return { zIndex: 0, transform: "translateX(0) scale(0.5)", opacity: 0, pointerEvents: "none" };
    const dir = offset < 0 ? -1 : 1;
    return {
      zIndex: 10 - absOff * 3,
      transform: `translateX(${dir * (absOff === 1 ? 38 : 62)}%) rotate(${dir * (absOff === 1 ? 10 : 18)}deg) scale(${absOff === 1 ? 0.82 : 0.68})`,
      opacity: absOff === 1 ? 0.85 : 0.6,
      pointerEvents: "none",
    };
  };

  return (
    <FormStepLayout id="step-2" current={2} onBack={onBack} className="step-traveler">
      <div className="form-header traveler-header">
        <p className="form-subheading">The portal only works when it knows where to take you.</p>
        <h1 className="form-heading">Tell me what kind of traveller you are:</h1>
      </div>

      <div className="traveler-stage">
        {travelers.map((type, index) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          return (
            <div key={type.id} className={`traveler-card ${index === activeIndex ? "traveler-card--active" : ""}`}
              style={{ ...getCardStyle(index), "--card-color": color }}>
              <div className="traveler-card__photo">
                {type.image
                  ? <img src={type.image} alt={type.name} />
                  : <div className="traveler-card__photo-placeholder" style={{ background: color }} />}
              </div>
              <div className="traveler-card__label" style={{ background: color }}>
                <p className="traveler-card__name">{type.name}</p>
              </div>
              <p className="traveler-active-desc">{active.description}</p>
            </div>
          );
        })}
      </div>



      <div className="carousel-select-area">
        <button onClick={onPrev} className="carousel-btn carousel-btn--square" id="carousel-left" aria-label="Previous">
          <img src="../../assets/icons/arrow-left.svg" alt="left arrow" />
        </button>
        <button onClick={onSelect} className="btn-form btn-form--traveler-select" id="select-card">Select</button>
        <button onClick={onNext} className="carousel-btn carousel-btn--square" id="carousel-right" aria-label="Next">
          <img src="../../assets/icons/arrow-right.svg" alt="right arrow" />
        </button>
      </div>
    </FormStepLayout>
  );
}
