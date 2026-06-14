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

  // Canvas State & References
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Traveler Slider State
  const [activeCardIndex, setActiveCardIndex] = useState(2); // Start with middle one (Adrenaline Junkie)

  // Initialize canvas listeners on step 1
  useEffect(() => {
    if (step !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;
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

    const handleStart = (e) => {
      e.preventDefault();
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      setIsDrawing(true);
      setHasDrawn(true);
    };

    const handleMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const handleEnd = () => {
      setIsDrawing(false);
    };

    // Add mouse listeners
    canvas.addEventListener("mousedown", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    // Add touch listeners
    canvas.addEventListener("touchstart", handleStart, { passive: false });
    canvas.addEventListener("touchmove", handleMove, { passive: false });
    canvas.addEventListener("touchend", handleEnd);

    return () => {
      canvas.removeEventListener("mousedown", handleStart);
      canvas.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      canvas.removeEventListener("touchstart", handleStart);
      canvas.removeEventListener("touchmove", handleMove);
      canvas.removeEventListener("touchend", handleEnd);
    };
  }, [step, isDrawing]);

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
    setStep(5);
  };

  const handleReset = () => {
    setNameImage("");
    setTravelerType("");
    setChosenCategory(null);
    setSelectedVibes([]);
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
              <button onClick={handleFinish} className="btn-form" id="done-button">
                Done
              </button>
            </div>
          </div>
        )}

        {/* === STEP 5: SUMMARY PAGE === */}
        {step === 5 && (
          <div className="step-container" id="step-5">
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

              <div className="summary-list">
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
