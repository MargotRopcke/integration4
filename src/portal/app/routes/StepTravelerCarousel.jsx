import "./StepTravelerCarousel.css";
import { FormStepLayout } from "../layouts/FormStepLayout";

const CARD_COLORS_BY_NAME = {
  "party animal": { main: "var(--color-blood-orange)", accent: "var(--color-creamy-vanilla)" },
  "new experience nerd": { main: "var(--color-pink-piggy)", accent: "var(--color-blood-orange)" },
  "adrenaline junkie": { main: "var(--color-pear-sorbet)", accent: "var(--color-muted-marine)" },
  "luxury connoisseur": { main: "var(--color-blood-orange)", accent: "var(--color-pink-piggy)" },
  "culture vulture": { main: "var(--color-muted-marine)", accent: "var(--color-sunshine)" },
};

const CARD_PALETTE_FALLBACK = [
  { main: "var(--color-blood-orange)", accent: "var(--color-creamy-vanilla)" },
  { main: "var(--color-muted-marine)", accent: "var(--color-sunshine)" },
  { main: "var(--color-pear-sorbet)", accent: "var(--color-muted-marine)" },
  { main: "var(--color-pink-piggy)", accent: "var(--color-blood-orange)" },
  { main: "var(--color-blood-orange)", accent: "var(--color-pink-piggy)" },
];

function getCardColors(name, index) {
  return CARD_COLORS_BY_NAME[name?.trim().toLowerCase()]
    ?? CARD_PALETTE_FALLBACK[index % CARD_PALETTE_FALLBACK.length];
}


export function StepTravelerCarousel({ travelers, activeIndex, onPrev, onNext, onSelect, onBack }) {
  const active = travelers[activeIndex];

  const getCardStyle = (index) => {
    const total = travelers.length;
    const diff = ((index - activeIndex) % total + total) % total;
    const offset = diff > total / 2 ? diff - total : diff;
    if (offset === 0) return { zIndex: 10, transform: "translateX(0) rotate(0deg) scale(1)", opacity: 1, filter: "blur(0px)" };
    const absOff = Math.abs(offset);
    if (absOff > 2) return { zIndex: 0, transform: "translateX(0) scale(0.5)", opacity: 0, pointerEvents: "none" };
    const dir = offset < 0 ? -1 : 1;
    return {
      zIndex: 10 - absOff * 3,
      transform: `translateX(${dir * (absOff === 1 ? 48 : 86)}%) rotate(${dir * (absOff === 1 ? 12 : 20)}deg) scale(${absOff === 1 ? 0.75 : 0.5})`,
      opacity: 1,
      filter: `blur(${absOff === 1 ? 1 : 1.5}px)`,
      pointerEvents: "none",
    };
  };

  return (
    <FormStepLayout id="step-2" current={2} onBack={onBack} className="step-traveler" title={"Tell me what kind of traveller you are:"} subtitle={"The portal only works when it knows where to take you."}>
      <div className="traveler-stage">
        {travelers.map((type, index) => {
          const { main, accent } = getCardColors(type.name, index);
          return (
            <div key={type.id} className={`traveler-card ${index === activeIndex ? "traveler-card--active" : ""}`}
              style={{ ...getCardStyle(index), "--card-main": main, "--card-accent": accent }}>
              <div className="traveler-card__photo">
                {type.image
                  ? <img src={type.image} alt={type.name} />
                  : <div className="traveler-card__photo-placeholder" style={{ background: main }} />}
              </div>
              <div className="traveler-card__label">
                <p className="traveler-card__name">{type.name}</p>
              </div>
              <p className="traveler-card__desc" style={{ color: accent }}>{type.description}</p>
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