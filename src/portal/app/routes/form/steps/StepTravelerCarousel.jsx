export function StepTravelerCarousel({ travelers, activeIndex, onPrev, onNext, onSelect }) {
  return (
    <div className="step-container" id="step-2">
      <div className="form-header">
        <h1 className="form-heading">Tell me what kind of traveller you are:</h1>
        <p className="form-subheading">The portal only works when it knows where to take you.</p>
      </div>
      <div className="carousel-wrapper">
        <button onClick={onPrev} className="carousel-btn" id="carousel-left">‹</button>
        <div className="carousel-viewport">
          {travelers.map((type, index) => {
            const prevIdx = (activeIndex - 1 + travelers.length) % travelers.length;
            const nextIdx = (activeIndex + 1) % travelers.length;
            let positionClass = "";
            if (index === activeIndex) positionClass = "card--active";
            else if (index === prevIdx) positionClass = "card--prev";
            else if (index === nextIdx) positionClass = "card--next";
            return (
              <div key={type.id} className={`carousel-card ${positionClass}`}>
                <h3 className="card-title">{type.name}</h3>
                <p className="card-desc">{type.description}</p>
              </div>
            );
          })}
        </div>
        <button onClick={onNext} className="carousel-btn" id="carousel-right">›</button>
      </div>
      <div className="carousel-select-area">
        <button onClick={onSelect} className="btn-form" id="select-card">
          Select traveler type
        </button>
      </div>
    </div>
  );
}
