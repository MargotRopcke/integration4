import { useState, useRef, useEffect } from "react";
import { getPrimaryCategories, getVibeCategories } from "../data";
import "./form.css";

const TRAVELER_TYPES = [
  { id: "party", name: "Party Animal", emoji: "🥳", desc: "Always looking for the best bars, clubs, and nightlife spots." },
  { id: "nerd", name: "New Experience Nerd", emoji: "🤓", desc: "Curious explorer seeking hidden gems, quirky cafés, and unique views." },
  { id: "junkie", name: "Adrenaline Junkie", emoji: "🌋", desc: "Thrill-seeker seeking action, dynamic tours, and high energy adventures." },
  { id: "connoisseur", name: "Luxury Connoisseur", emoji: "💎", desc: "Savouring the finer things: high-end shopping, upscale dining, and premium service." },
  { id: "vulture", name: "Culture Vulture", emoji: "🎭", desc: "Soaking up art, history, fashion houses, and local heritage." }
];

export const clientLoader = async () => {
  try {
    const [primaryCategories, vibeCategories] = await Promise.all([
      getPrimaryCategories(),
      getVibeCategories()
    ]);
    return { primaryCategories, vibeCategories };
  } catch (error) {
    console.error("Failed to load categories/vibes:", error);
    return { primaryCategories: [], vibeCategories: [] };
  }
};

export default function FormPage({ loaderData }) {
  const { primaryCategories = [], vibeCategories = [] } = loaderData || {};
  const [step, setStep] = useState(0);

  // Form selections state
  const [nameImage, setNameImage] = useState("");
  const [travelerType, setTravelerType] = useState("");
  const [chosenCategory, setChosenCategory] = useState(null);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [budget, setBudget] = useState("€ (≤30)");
  const [distance, setDistance] = useState("walking (0-2km)");
  const [takePictures, setTakePictures] = useState("yes");

  // Canvas State & References
  const canvasRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Traveler Slider State
  const [activeCardIndex, setActiveCardIndex] = useState(2); // Start with middle one (Adrenaline Junkie)

  // Initialize canvas listeners on step 1 for drawing on hover
  useEffect(() => {
    if (step !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#1477CC"; // Antwerp Blue brush color

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height,
      };
    };

    let lastPos = null;

    const handleStart = (e) => {
      const pos = getPos(e);
      lastPos = pos;
      setHasDrawn(true);
    };

    const handleMove = (e) => {
      if (e.touches) {
        e.preventDefault();
      }
      const pos = getPos(e);
      
      ctx.beginPath();
      if (lastPos) {
        ctx.moveTo(lastPos.x, lastPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else {
        ctx.arc(pos.x, pos.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = "#1477CC";
        ctx.fill();
      }
      lastPos = pos;
      setHasDrawn(true);
    };

    const handleEnd = () => {
      lastPos = null;
    };

    // Add mouse listeners (drawing on hover/move)
    canvas.addEventListener("mouseenter", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleEnd);

    // Add touch listeners
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mouseenter", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      canvas.removeEventListener("mouseleave", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, [step]);

  // Canvas Handlers
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setNameImage(dataUrl);
    // Move to next step
    setStep(2);
  };

  // Slider handlers
  const handlePrevCard = () => {
    setActiveCardIndex((prev) => (prev - 1 + TRAVELER_TYPES.length) % TRAVELER_TYPES.length);
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % TRAVELER_TYPES.length);
  };

  const handleSelectCard = () => {
    setTravelerType(TRAVELER_TYPES[activeCardIndex].name);
    setStep(3);
  };

  // Category choice handler
  const handleSelectCategory = (category) => {
    setChosenCategory(category);
    setSelectedVibes([]); // Reset vibes when category changes
    setStep(4);
  };

  // Vibes multi-select handler
  const handleToggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleFinish = () => {
    setStep(7);
  };

  const handleReset = () => {
    setNameImage("");
    setTravelerType("");
    setChosenCategory(null);
    setSelectedVibes([]);
    setBudget("€ (≤30)");
    setDistance("walking (0-2km)");
    setTakePictures("yes");
    setActiveCardIndex(2);
    setHasDrawn(false);
    setStep(0);
  };

  return (
    <div className="form-page" id="form-screen">
      {/* Decorative Blur BG */}
      <div className="form-glow form-glow--top" />
      <div className="form-glow form-glow--bottom" />

      <div className="form-card" id="form-content-card">
        {/* === STEP 0: INTRO COVER === */}
        {step === 0 && (
          <div className="step-intro" id="step-0">
            <div className="intro-portal-icon">
              <div className="intro-portal-ring" />
              <div className="intro-portal-ring intro-portal-ring--inner" />
              <div className="intro-portal-dot" />
            </div>
            <h1 className="form-heading">The Portal</h1>
            <p className="form-subheading">
              Answer a few questions to unlock your custom itinerary and discover Antwerp your own way.
            </p>
            <button
              className="btn-form"
              onClick={() => setStep(1)}
              style={{ marginTop: "2rem" }}
              id="start-button"
            >
              Start Journey →
            </button>
          </div>
        )}

        {/* === STEP 1: DRAW NAME === */}
        {step === 1 && (
          <div className="step-container" id="step-1">
            <div className="form-header">
              <h1 className="form-heading">Hey there! Ready to make your own version of Antwerp?</h1>
              <p className="form-subheading">
                Most visitors see the same city. The Portal helps you discover local Antwerp your way.
              </p>
            </div>

            <p className="form-prompt">What is your name?</p>

            <div className="canvas-wrapper">
              <div className="canvas-container">
                <div className={`canvas-hint ${hasDrawn ? "hidden" : ""}`}>
                  Write your name here
                </div>
                <canvas
                  ref={canvasRef}
                  id="canvas"
                  width={950}
                  height={1000}
                  className="canvas-element"
                />
              </div>

              <div className="canvas-actions">
                <button
                  onClick={handleClear}
                  className="btn-form btn-form--secondary"
                  id="clear"
                >
                  Clear
                </button>
                <button
                  onClick={handleSave}
                  className="btn-form"
                  disabled={!hasDrawn}
                  style={{ opacity: hasDrawn ? 1 : 0.5, cursor: hasDrawn ? "pointer" : "not-allowed" }}
                  id="save"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === STEP 2: TRAVELER CAROUSEL === */}
        {step === 2 && (
          <div className="step-container" id="step-2">
            <div className="form-header">
              <h1 className="form-heading">The portal only works when it knows where to take you.</h1>
              <p className="form-subheading">Tell me what kind of traveller you are:</p>
            </div>

            <div className="carousel-wrapper">
              <button onClick={handlePrevCard} className="carousel-btn" id="carousel-left">
                ‹
              </button>

              <div className="carousel-viewport">
                {TRAVELER_TYPES.map((type, index) => {
                  let positionClass = "";
                  const prevIndex = (activeCardIndex - 1 + TRAVELER_TYPES.length) % TRAVELER_TYPES.length;
                  const nextIndex = (activeCardIndex + 1) % TRAVELER_TYPES.length;

                  if (index === activeCardIndex) {
                    positionClass = "card--active";
                  } else if (index === prevIndex) {
                    positionClass = "card--prev";
                  } else if (index === nextIndex) {
                    positionClass = "card--next";
                  }

                  return (
                    <div key={type.id} className={`carousel-card ${positionClass}`}>
                      <div className="card-icon">{type.emoji}</div>
                      <h3 className="card-title">{type.name}</h3>
                      <p className="card-desc">{type.desc}</p>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleNextCard} className="carousel-btn" id="carousel-right">
                ›
              </button>
            </div>

            <div className="carousel-select-area">
              <button onClick={handleSelectCard} className="btn-form" id="select-card">
                Select traveler type
              </button>
            </div>
          </div>
        )}

        {/* === STEP 3: CATEGORY CHOICE === */}
        {step === 3 && (
          <div className="step-container" id="step-3">
            <div className="form-header">
              <h1 className="form-heading">Your taste shapes a more personal journey.</h1>
              <p className="form-subheading">Choose style or flavour to refine your recommendation:</p>
            </div>

            <div className="category-choice-grid">
              {primaryCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className="category-choice-card"
                  id={`category-choice-${cat.name.toLowerCase().trim()}`}
                >
                  <div className="category-choice-icon">
                    {cat.name.trim().toLowerCase() === "style" ? "👗" : "🍽"}
                  </div>
                  <h3 className="category-choice-title">{cat.name.trim()}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STEP 4: VIBES SELECT === */}
        {step === 4 && (
          <div className="step-container" id="step-4">
            <div className="form-header">
              <h1 className="form-heading">Your taste shapes a more personal journey.</h1>
              <p className="form-subheading">Choose the vibe(s) that fit your taste:</p>
            </div>

            <div className="vibes-grid">
              {vibeCategories
                .filter((vibe) => vibe.primary_category_id === chosenCategory?.id)
                .map((vibe) => {
                  const vibeName = vibe.name.trim();
                  const isSelected = selectedVibes.includes(vibeName);
                  return (
                    <div
                      key={vibe.id}
                      onClick={() => handleToggleVibe(vibeName)}
                      className={`vibe-option ${isSelected ? "selected" : ""}`}
                      id={`vibe-${vibeName.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <div className="vibe-circle">
                        <div className="vibe-dot" />
                      </div>
                      <span className="vibe-text">{vibeName}</span>
                    </div>
                  );
                })}
            </div>

            <div className="vibes-actions">
              <button onClick={() => setStep(5)} className="btn-form" id="done-button">
                Done
              </button>
            </div>
          </div>
        )}

        {/* === STEP 5: BUDGET & DISTANCE === */}
        {step === 5 && (
          <div className="step-container" id="step-5">
            <div className="form-header">
              <h1 className="form-heading">Shape the path to where you want to be.</h1>
              <p className="form-subheading">Set your budget and travel distance preferences:</p>
            </div>

            <div className="budget-distance-container">
              <div className="question-group">
                <span className="group-title">Budget /p.p.</span>
                <div className="options-row">
                  {["€ (≤30)", "€€ (≤60)", "€€€ (≥60)"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setBudget(opt)}
                      className={`option-btn ${budget === opt ? "active" : ""}`}
                      id={`budget-${opt.toLowerCase().replace(/[^a-z0-9]/g, "")}`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="question-group">
                <span className="group-title">Distance</span>
                <div className="options-row">
                  {["walking (0-2km)", "bike (2-5km)", "tram (if possible)"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => setDistance(opt)}
                      className={`option-btn ${distance === opt ? "active" : ""}`}
                      id={`distance-${opt.split(" ")[0].toLowerCase()}`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="vibes-actions" style={{ marginTop: "2rem" }}>
              <button onClick={() => setStep(6)} className="btn-form" id="budget-distance-next">
                Next
              </button>
            </div>
          </div>
        )}

        {/* === STEP 6: TAKE PICTURES CHOICE === */}
        {step === 6 && (
          <div className="step-container" id="step-6">
            <div className="form-header">
              <h1 className="form-heading">Take pictures during experience?</h1>
              <p className="form-subheading" style={{ margin: "1.5rem auto", maxWidth: "600px" }}>
                6 Pictures will be taken of you during the experience to create a photo collage.
                <br /><br />
                These pictures are meant as memories for your trip to Antwerp. You can share them with your friends or keep them to yourself.
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--form-text-muted)", opacity: 0.8, maxWidth: "500px", margin: "0 auto 1.5rem" }}>
                These are just for yourself, we don't use these pictures outside of this experience.
              </p>
            </div>

            <div className="camera-choice-grid">
              <div
                onClick={() => setTakePictures("yes")}
                className={`camera-choice-card ${takePictures === "yes" ? "active" : ""}`}
                id="camera-choice-yes"
              >
                <div className="camera-choice-icon">📸</div>
                <div className="camera-choice-title">Yes</div>
              </div>
              <div
                onClick={() => setTakePictures("no")}
                className={`camera-choice-card ${takePictures === "no" ? "active" : ""}`}
                id="camera-choice-no"
              >
                <div className="camera-choice-icon">🚫</div>
                <div className="camera-choice-title">No</div>
              </div>
            </div>

            <div className="vibes-actions">
              <button onClick={handleFinish} className="btn-form" id="camera-done">
                Done
              </button>
            </div>
          </div>
        )}

        {/* === STEP 7: SUMMARY PAGE === */}
        {step === 7 && (
          <div className="step-container" id="step-7">
            <div className="form-header">
              <h1 className="form-heading">Your Antwerp Blueprint</h1>
              <p className="form-subheading">Here is the digital passport you created for your journey.</p>
            </div>

            <div className="summary-container">
              <div className="summary-grid">
                <div className="summary-section">
                  <span className="summary-title">Your Signature</span>
                  <div className="summary-signature">
                    {nameImage ? (
                      <img src={nameImage} alt="Signature Name" className="summary-img" />
                    ) : (
                      <span className="summary-signature-empty">No signature</span>
                    )}
                  </div>
                </div>

                <div className="summary-section">
                  <span className="summary-title">Traveler Identity</span>
                  <div className="summary-traveler-badge">
                    {(() => {
                      const activeType = TRAVELER_TYPES.find((t) => t.name === travelerType);
                      return (
                        <>
                          <div className="summary-traveler-icon">{activeType?.emoji || "🗺"}</div>
                          <div className="summary-traveler-name">{travelerType}</div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="summary-section">
                  <span className="summary-title">Preference Type</span>
                  <div className="summary-traveler-badge">
                    <div className="summary-traveler-icon">
                      {chosenCategory?.name.trim().toLowerCase() === "style" ? "👗" : "🍽"}
                    </div>
                    <div className="summary-traveler-name">{chosenCategory?.name.trim()}</div>
                  </div>
                </div>
              </div>

              {/* Preferences Summary cards */}
              <div className="summary-grid" style={{ marginTop: "1rem" }}>
                <div className="summary-info-card">
                  <span className="group-title" style={{ fontSize: "1.5rem" }}>💰</span>
                  <div>
                    <div className="info-title">Budget Limit</div>
                    <div className="info-value">{budget}</div>
                  </div>
                </div>

                <div className="summary-info-card">
                  <span className="group-title" style={{ fontSize: "1.5rem" }}>🏃</span>
                  <div>
                    <div className="info-title">Max Distance</div>
                    <div className="info-value">{distance}</div>
                  </div>
                </div>

                <div className="summary-info-card">
                  <span className="group-title" style={{ fontSize: "1.5rem" }}>📸</span>
                  <div>
                    <div className="info-title">Take Photos</div>
                    <div className="info-value">{takePictures.toUpperCase()}</div>
                  </div>
                </div>
              </div>

              <div className="summary-list" style={{ marginTop: "1.5rem" }}>
                <span className="summary-title">Selected Vibes</span>
                <div className="summary-vibes-tags">
                  {selectedVibes.length > 0 ? (
                    selectedVibes.map((vibe) => (
                      <span key={vibe} className="summary-vibe-tag">
                        {vibe}
                      </span>
                    ))
                  ) : (
                    <span style={{ color: "var(--form-text-muted)", fontStyle: "italic", fontSize: "0.95rem" }}>
                      No vibes selected
                    </span>
                  )}
                </div>
              </div>

              <div className="summary-actions">
                <button onClick={handleReset} className="btn-form btn-form--secondary" id="restart-button">
                  ↩ Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
