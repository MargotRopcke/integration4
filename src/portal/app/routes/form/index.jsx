import { useState, useEffect, useCallback } from "react";
import { saveSession, saveSessionPhotos } from "../../data";
import { FALLBACK_TRAVELERS } from "./constants";

// Hooks
import { useCanvasDrawing } from "./hooks/useCanvasDrawing";
import { useSwipeDeck } from "./hooks/useSwipeDeck";
import { useSwipeCamera } from "./hooks/useSwipeCamera";
import { useSummaryCamera } from "./hooks/useSummaryCamera";
import { usePrint } from "./hooks/usePrint";

// Steps
import { StepIntro } from "./steps/StepIntro";
import { StepDrawName } from "./steps/StepDrawName";
import { StepTravelerCarousel } from "./steps/StepTravelerCarousel";
import { StepCategory } from "./steps/StepCategory";
import { StepVibes } from "./steps/StepVibes";
import { StepBudgetDistance } from "./steps/StepBudgetDistance";
import { StepPhotos } from "./steps/StepPhotos";
import { StepSwipe } from "./steps/StepSwipe";
import { StepSummary } from "./steps/StepSummary";
import { StepPrinting } from "./steps/StepPrinting";
import { StepQR } from "./steps/StepQR";

import "./form.css";

export { clientLoader } from "./clientLoader";

export default function FormPage({ loaderData }) {
  const {
    primaryCategories = [],
    vibeCategories = [],
    travelerTypes = [],
  } = loaderData || {};

  const travelers = travelerTypes.length > 0 ? travelerTypes : FALLBACK_TRAVELERS;

  // ── Global form state ───────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [nameImage, setNameImage] = useState("");
  const [travelerType, setTravelerType] = useState("");
  const [chosenCategory, setChosenCategory] = useState(null);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [budget, setBudget] = useState("€ (≤30)");
  const [distance, setDistance] = useState("walking (0-2km)");
  const [takePictures, setTakePictures] = useState("yes");
  const [activeCardIdx, setActiveCardIdx] = useState(2);

  // ── Session (QR) state ──────────────────────────────────────────────────────
  const [sessionUserId, setSessionUserId] = useState(null);
  const [sessionSaving, setSessionSaving] = useState(false);

  // ── Canvas (step 1) ─────────────────────────────────────────────────────────
  const { canvasRef, hasDrawn, handleClear, handleSave } = useCanvasDrawing(step === 1);

  // ── Print (step "printing") ─────────────────────────────────────────────────
  const print = usePrint();

  // ── Swipe camera (step 7) ───────────────────────────────────────────────────
  // Initialised after deck so capturePhoto is available
  const deck = useSwipeDeck({
    active: step === 7,
    chosenCategory,
    selectedVibes,
    vibeCategories,
    budget,
    distance,
    takePictures,

    onDeckDone: undefined,
  });

  const camera = useSwipeCamera({
    active: step === 7 && !deck.loading,
    handleGestureAction: deck.handleGestureAction,
    countdownActiveRef: deck.countdownActiveRef,
    tutorialActiveRef: deck.tutorialActiveRef,
    tutorialStepRef: deck.tutorialStepRef,
    cardLoadedTimeRef: deck.cardLoadedTimeRef,
    setTutorialHoldBars: deck.setTutorialHoldBars,
  });

  // Keep deck's capturePhotoRef pointing at the live camera function every render.
  // useSwipeDeck reads capturePhotoRef.current inside triggerCountdownAndVote,
  // calls it, and stores the returned dataUrl directly into reactionPhotosRef.
  deck.capturePhotoRef.current = camera.capturePhoto;

  // ── Summary camera (step 8) ─────────────────────────────────────────────────
  const handleThumbsUp = useCallback(() => {
    print.reset();
    setStep("printing");
  }, [print]);

  const handleSwipeAgain = useCallback(() => {
    deck.resetDeck();
    setStep(7);
  }, [deck]);

  const summary = useSummaryCamera({
    active: step === 8,
    gestureRecRef: camera.gestureRecRef,
    onThumbsUp: handleThumbsUp,
    onThumbsDown: handleSwipeAgain,
  });

  // ── Save session when entering step 9 ───────────────────────────────────────
  useEffect(() => {
    if (step !== 9 && step !== "printing") return;
    if (sessionUserId) return;

    const save = async () => {
      setSessionSaving(true);
      try {
        const userId = Date.now();
        const matchedType = travelerTypes.find((t) => t.name === travelerType);
        await saveSession({
          userId,
          photoName: nameImage || "",
          primaryCategoryId: chosenCategory?.id ?? null,
          travelerTypeId: matchedType?.id ?? null,
        });
        await saveSessionPhotos(userId, deck.reactionPhotosRef.current);
        setSessionUserId(userId);
      } catch (err) {
        console.error("Failed to save session:", err);
      } finally {
        setSessionSaving(false);
      }
    };

    save();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-trigger print ───────────────────────────────────────────────────────
  useEffect(() => {
    if (step !== "printing") return;
    print.startPrinting(
      deck.reactionPhotosRef.current,
      deck.likedLocations,
      () => setStep(9)
    );
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Full reset ───────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setNameImage("");
    setTravelerType("");
    setChosenCategory(null);
    setSelectedVibes([]);
    setBudget("€ (≤30)");
    setDistance("walking (0-2km)");
    setTakePictures("yes");
    setActiveCardIdx(2);
    setSessionUserId(null);
    setSessionSaving(false);
    deck.resetDeck();
    print.reset();
    camera.stopCamera();
    setStep(0);
  }, [deck, print, camera]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const currentCard = deck.deck[deck.deckIndex] ?? null;
  const progressPct = deck.deck.length > 0 ? (deck.deckIndex / deck.deck.length) * 100 : 0;
  const categoryLabel = chosenCategory?.name?.trim() ?? "All Spots";

  // ── Render ───────────────────────────────────────────────────────────────────
  const isFullscreen = step === 7 || step === 8;

  return (
    <div
      className={[
        "form-page",
        step === 7 ? "form-page--swipe" : "",
        step === 8 ? "form-page--summary" : "",
      ].join(" ").trim()}
      id="form-screen"
    >
      {!isFullscreen && (
        <>
          <div className="form-glow form-glow--top" />
          <div className="form-glow form-glow--bottom" />
        </>
      )}

      <div
        className={[
          "form-card",
          isFullscreen ? "form-card--fullscreen" : "",
        ].join(" ").trim()}
        id="form-content-card"
      >
        {step === 0 && (
          <StepIntro onStart={() => setStep(1)} />
        )}

        {step === 1 && (
          <StepDrawName
            canvasRef={canvasRef}
            hasDrawn={hasDrawn}
            onClear={handleClear}
            onSave={() => handleSave((dataUrl) => { setNameImage(dataUrl); setStep(2); })}
          />
        )}

        {step === 2 && (
          <StepTravelerCarousel
            travelers={travelers}
            activeIndex={activeCardIdx}
            onPrev={() => setActiveCardIdx((p) => (p - 1 + travelers.length) % travelers.length)}
            onNext={() => setActiveCardIdx((p) => (p + 1) % travelers.length)}
            onSelect={() => {
              setTravelerType(travelers[activeCardIdx].name); setStep(3);
            }}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepCategory
            categories={primaryCategories}
            onSelect={(cat) => { setChosenCategory(cat); setSelectedVibes([]); setStep(4); }}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepVibes
            vibes={vibeCategories}
            chosenCategory={chosenCategory}
            selectedVibes={selectedVibes}
            onToggle={(name) =>
              setSelectedVibes((prev) =>
                prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name]
              )
            }
            onDone={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        )}

        {step === 5 && (
          <StepBudgetDistance
            budget={budget}
            distance={distance}
            onBudget={setBudget}
            onDistance={setDistance}
            onNext={() => setStep(6)}
            onBack={() => setStep(4)}
          />
        )}

        {step === 6 && (
          <StepPhotos
            takePictures={takePictures}
            onChoose={(choice) => { setTakePictures(choice); setStep(7); }}
            onBack={() => setStep(5)}
          />
        )}

        {step === 7 && (
          <StepSwipe
            loading={deck.loading}
            deck={deck.deck}
            deckIndex={deck.deckIndex}
            currentCard={currentCard}
            likesCount={deck.likesCount}
            swipeDone={deck.swipeDone}
            cardSwipeClass={deck.cardSwipeClass}
            overlayLike={deck.overlayLike}
            overlayNope={deck.overlayNope}
            countdownVisible={deck.countdownVisible}
            countdownText={deck.countdownText}
            countdownCheese={deck.countdownCheese}
            flashActive={deck.flashActive}
            tutorialActive={deck.tutorialActive}
            tutorialStep={deck.tutorialStep}
            tutorialHoldBars={deck.tutorialHoldBars}
            nextTutorialStep={deck.nextTutorialStep}
            gestureStatus={camera.gestureStatus}
            gestureDetected={camera.gestureDetected}
            noCameraNotice={camera.noCameraNotice}
            videoRef={camera.videoRef}
            canvasOverlayRef={camera.canvasOverlayRef}
            outputCanvasRef={camera.outputCanvasRef}
            bgImageRef={camera.bgImageRef}
            cardRef={deck.cardRef}
            onVote={deck.handleVote}
            onGoBack={deck.handleGoBack}
            onShowResults={() => setStep(8)}
            onReset={handleReset}
            categoryLabel={categoryLabel}
            progressPct={progressPct}
          />
        )}

        {step === 8 && (
          <StepSummary
            likesCount={deck.likesCount}
            likedLocations={deck.likedLocations}
            reactionPhotos={deck.reactionPhotos}
            videoRef={summary.videoRef}
            canvasRef={summary.canvasRef}
            gestureStatus={summary.gestureStatus}
            gestureDetected={summary.gestureDetected}
            gestureProgress={summary.gestureProgress}
            gestureType={summary.gestureType}
            flash={summary.flash}
            onPrint={handleThumbsUp}
            onSwipeAgain={handleSwipeAgain}
          />
        )}

        {step === "printing" && (
          <StepPrinting
            status={print.status}
            collageUrl={print.collageUrl}
            errorMsg={print.errorMsg}
            onRetry={() =>
              print.startPrinting(
                deck.reactionPhotosRef.current,
                deck.likedLocations,
                () => setStep(9)
              )
            }
            onSkip={() => setStep(9)}
          />
        )}

        {step === 9 && (
          <StepQR
            sessionUserId={sessionUserId}
            sessionSaving={sessionSaving}
            likesCount={deck.likesCount}
            likedLocations={deck.likedLocations}
            travelerType={travelerType}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}