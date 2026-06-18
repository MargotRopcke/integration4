import { BackButton } from "../components/BackButton";
import { StepProgress } from "../components/StepProgress";

// Fallback accent colors per card position if Supabase doesn't have a color field
const CARD_COLORS = [
  "#E03C31", // red
  "#1477CC", // teal/blue
  "#7BC67A", // green
  "#F4A7B9", // pink
  "#F5C842", // yellow
];

export function StepTravelerCarousel({ travelers, activeIndex, onPrev, onNext, onSelect, onBack }) {
  const active = travelers[activeIndex];

  // Build the visible card stack: 2 behind-left, active, 2 behind-right
  // We show all cards and position them via CSS classes + inline style for rotation/offset
  const getCardStyle = (index) => {
    const total = travelers.length;
    const diff = ((index - activeIndex) % total + total) % total;
    // Normalize diff to range [-floor, floor]
    const offset = diff > total / 2 ? diff - total : diff;

    if (offset === 0) {
      return { zIndex: 10, transform: "translateX(0) rotate(0deg) scale(1)", opacity: 1 };
    }
    const absOff = Math.abs(offset);
    if (absOff > 2) {
      return { zIndex: 0, transform: "translateX(0) scale(0.5)", opacity: 0, pointerEvents: "none" };
    }
    const dir = offset < 0 ? -1 : 1;
    const translateX = dir * (absOff === 1 ? 38 : 62);
    const rotate = dir * (absOff === 1 ? 10 : 18);
    const scale = absOff === 1 ? 0.82 : 0.68;
    const zIndex = 10 - absOff * 3;
    return {
      zIndex,
      transform: `translateX(${translateX}%) rotate(${rotate}deg) scale(${scale})`,
      opacity: absOff === 1 ? 0.85 : 0.6,
      pointerEvents: "none",
    };
  };

  return (
    <div className="step-container step-traveler" id="step-2">
      <BackButton onClick={onBack} />

      <div className="form-header traveler-header">
        <p className="form-subheading">The portal only works when it knows where to take you.</p>
        <h1 className="form-heading">Tell me what kind of traveller you are:</h1>
      </div>

      <div className="traveler-stage">
        {travelers.map((type, index) => {
          const color = CARD_COLORS[index % CARD_COLORS.length];
          const cardStyle = getCardStyle(index);
          const isActive = index === activeIndex;

          return (
            <div
              key={type.id}
              className={`traveler-card ${isActive ? "traveler-card--active" : ""}`}
              style={{ ...cardStyle, "--card-color": color }}
            >
              <div className="traveler-card__photo">
                {type.image
                  ? <img src={type.image} alt={type.name} />
                  : <div className="traveler-card__photo-placeholder" style={{ background: color }} />
                }
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
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 70 47" fill="none">
            <path d="M30.2541 46.8C31.7188 46.8 32.6854 45.2775 32.0414 43.962C30.5214 40.857 29.041 38.0697 27.6004 35.6C26.5626 33.9396 25.5429 32.4228 24.541 31.0496C23.5283 29.6615 24.4896 27.6 26.2079 27.6H67.9004C69.005 27.6 69.9004 26.7046 69.9004 25.6V21.2C69.9004 20.0954 69.005 19.2 67.9004 19.2H26.0384C24.3481 19.2 23.3912 17.2096 24.3758 15.8357C25.4307 14.3637 26.5055 12.7518 27.6004 11C29.0246 8.55857 30.4875 5.84549 31.9893 2.86078C32.6525 1.54278 31.6863 0 30.2108 0H27.3162C26.7347 0 26.1821 0.254341 25.799 0.691777C17.9135 9.69504 9.67722 16.4759 1.08998 21.0345C0.424553 21.3877 0.000396729 22.0747 0.000396729 22.8281V23.9559C0.000396729 24.7176 0.433922 25.4105 1.11032 25.7609C9.68994 30.2044 17.9192 36.9835 25.7982 46.098C26.1816 46.5415 26.7381 46.8 27.3243 46.8H30.2541Z" fill="#FDFEEF" />
          </svg>
        </button>
        <button onClick={onSelect} className="btn-form btn-form--traveler-select" id="select-card">
          Select
        </button>
        <button onClick={onNext} className="carousel-btn carousel-btn--square" id="carousel-right" aria-label="Next">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="22" viewBox="0 0 70 47" fill="none">
            <path d="M39.6463 46.8C38.1816 46.8 37.2149 45.2775 37.859 43.962C39.379 40.857 40.8594 38.0697 42.3 35.6C43.3377 33.9396 44.3575 32.4228 45.3594 31.0496C46.3721 29.6615 45.4108 27.6 43.6925 27.6H2C0.895433 27.6 0 26.7046 0 25.6V21.2C0 20.0954 0.895431 19.2 2 19.2H43.862C45.5523 19.2 46.5092 17.2096 45.5246 15.8357C44.4697 14.3637 43.3949 12.7518 42.3 11C40.8758 8.55857 39.4129 5.84549 37.9111 2.86078C37.2479 1.54278 38.2141 0 39.6896 0H42.5842C43.1657 0 43.7183 0.254341 44.1014 0.691777C51.9868 9.69504 60.2232 16.4759 68.8104 21.0345C69.4758 21.3877 69.9 22.0747 69.9 22.8281V23.9559C69.9 24.7176 69.4665 25.4105 68.7901 25.7609C60.2104 30.2044 51.9812 36.9835 44.1022 46.098C43.7188 46.5415 43.1623 46.8 42.5761 46.8H39.6463Z" fill="#FDFEEF" />
          </svg>
        </button>
      </div>

      <StepProgress current={2} total={6} />
    </div>
  );
}