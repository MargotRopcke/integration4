import { useState, useRef, useCallback, useEffect } from "react";
import { getFilteredLocations } from "../../data";
import { MAX_LIKES } from "../constants";

export function useSwipeDeck({
  active,
  chosenCategory,
  selectedVibes,
  vibeCategories,
  budget,
  distance,
  takePictures,
  onDeckDone,
}) {
  // ── Deck state ──────────────────────────────────────────────────────────────
  const [loading,        setLoading]        = useState(false);
  const [deck,           setDeck]           = useState([]);
  const [deckIndex,      setDeckIndex]      = useState(0);
  const [likedLocations, setLikedLocations] = useState([]);
  const [likesCount,     setLikesCount]     = useState(0);
  const [reactionPhotos, setReactionPhotos] = useState([]);
  const [swipeDone,      setSwipeDone]      = useState(false);
  const [cardSwipeClass, setCardSwipeClass] = useState("");
  const [overlayLike,    setOverlayLike]    = useState(0);
  const [overlayNope,    setOverlayNope]    = useState(0);

  // ── Countdown state ─────────────────────────────────────────────────────────
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [countdownText,    setCountdownText]    = useState("");
  const [countdownCheese,  setCountdownCheese]  = useState(false);
  const [flashActive,      setFlashActive]      = useState(false);

  // ── Tutorial state ───────────────────────────────────────────────────────────
  const [tutorialActive,   setTutorialActive]   = useState(false);
  const [tutorialStep,     setTutorialStep]     = useState(1);
  const [tutorialHoldBars, setTutorialHoldBars] = useState({ 2: 0, 3: 0, 4: 0 });

  // ── Refs (shared with camera loop) ──────────────────────────────────────────
  const deckRef            = useRef([]);
  const deckIndexRef       = useRef(0);
  const likesCountRef      = useRef(0);
  const likedLocationsRef  = useRef([]);
  const reactionPhotosRef  = useRef([]);
  const countdownActiveRef = useRef(false);
  const tutorialActiveRef  = useRef(false);
  const tutorialStepRef    = useRef(1);
  const cardLoadedTimeRef  = useRef(0);
  const cardRef            = useRef(null);

  // ── capturePhoto ref — written by index.jsx after camera initialises ─────────
  // useSwipeCamera.capturePhoto() returns a dataUrl string or null.
  // index.jsx sets capturePhotoRef.current = camera.capturePhoto each render,
  // so triggerCountdownAndVote always calls the live camera function and stores
  // the result directly into reactionPhotosRef — no prop re-render cycle needed.
  const capturePhotoRef = useRef(null);

  // ── Drag refs ────────────────────────────────────────────────────────────────
  const isDraggingRef   = useRef(false);
  const dragStartXRef   = useRef(0);
  const dragCurrentXRef = useRef(0);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const shuffle = useCallback((arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }, []);

  const getVibeIds = useCallback(() =>
    vibeCategories
      .filter((v) => selectedVibes.includes(v.name.trim()))
      .map((v) => v.id),
  [vibeCategories, selectedVibes]);

  // ── Load deck ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        const locations = await getFilteredLocations({
          categoryId: chosenCategory?.id,
          vibeIds: getVibeIds(),
          budget,
          distance,
        });
        if (cancelled) return;

        const shuffled = shuffle(locations);
        deckRef.current           = shuffled;
        deckIndexRef.current      = 0;
        likesCountRef.current     = 0;
        likedLocationsRef.current = [];
        reactionPhotosRef.current = [];

        setDeck(shuffled);
        setDeckIndex(0);
        setLikedLocations([]);
        setLikesCount(0);
        setReactionPhotos([]);
        setSwipeDone(false);
        setCardSwipeClass("");
        cardLoadedTimeRef.current = performance.now();

        setTutorialActive(true);
        tutorialActiveRef.current = true;
        setTutorialStep(1);
        tutorialStepRef.current = 1;
        setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
      } catch (err) {
        console.error("Failed to load locations for swipe:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  }, [active, chosenCategory, budget, distance, shuffle, getVibeIds]);

  // ── Vote helpers ─────────────────────────────────────────────────────────────
  const commitVote = useCallback((liked) => {
    const loc = deckRef.current[deckIndexRef.current];
    if (!loc) return;

    if (liked) {
      setCardSwipeClass("swipe-right");
      likedLocationsRef.current = [...likedLocationsRef.current, loc];
      setLikedLocations(likedLocationsRef.current);
      likesCountRef.current += 1;
      setLikesCount(likesCountRef.current);
    } else {
      setCardSwipeClass("swipe-left");
    }

    setTimeout(() => {
      const newIndex = deckIndexRef.current + 1;
      deckIndexRef.current = newIndex;
      setDeckIndex(newIndex);
      setCardSwipeClass("");
      setOverlayLike(0);
      setOverlayNope(0);
      cardLoadedTimeRef.current = performance.now();

      if (newIndex >= deckRef.current.length || likesCountRef.current >= MAX_LIKES) {
        setSwipeDone(true);
        onDeckDone?.();
      }
    }, 360);
  }, [onDeckDone]);

  const triggerCountdownAndVote = useCallback((liked) => {
    if (countdownActiveRef.current) return;
    if (!liked) { commitVote(false); return; }
    if (likesCountRef.current >= MAX_LIKES) return;

    // When no photos: skip countdown entirely, just vote
    if (takePictures !== "yes") {
      commitVote(true);
      return;
    }

    countdownActiveRef.current = true;
    setCountdownVisible(true);

    const steps = ["3", "2", "1", "Say Cheese!"];
    let i = 0;
    const tick = () => {
      if (i >= steps.length) {
        setCountdownVisible(false);

        // Call capturePhoto via ref — returns dataUrl, store it immediately
        if (capturePhotoRef.current) {
          const dataUrl = capturePhotoRef.current();
          if (dataUrl) {
            const loc = deckRef.current[deckIndexRef.current];
            if (loc) {
              const photo = {
                dataUrl,
                locationName:  loc.name,
                locationImage: loc.image,
                locationId:    loc.keyID,
              };
              reactionPhotosRef.current = [...reactionPhotosRef.current, photo];
              setReactionPhotos([...reactionPhotosRef.current]);
            }
          }
        }

        countdownActiveRef.current = false;
        commitVote(true);
        return;
      }
      setCountdownCheese(i === 3);
      setCountdownText(steps[i]);
      i++;
      setTimeout(tick, i === 4 ? 900 : 800);
    };
    tick();
  }, [takePictures, commitVote]);

  const handleVote = useCallback((liked) => {
    if (deckIndexRef.current >= deckRef.current.length) return;
    if (countdownActiveRef.current) return;
    if (tutorialActiveRef.current) return;
    triggerCountdownAndVote(liked);
  }, [triggerCountdownAndVote]);

  const handleGoBack = useCallback(() => {
    const currentIdx = deckIndexRef.current;
    if (currentIdx <= 0) return;
    if (swipeDone) setSwipeDone(false);

    const prev = deckRef.current[currentIdx - 1];
    if (prev) {
      const wasLiked = likedLocationsRef.current.some(
        (l) => (l.keyID && l.keyID === prev.keyID) || (l.id && l.id === prev.id)
      );
      if (wasLiked) {
        likedLocationsRef.current = likedLocationsRef.current.filter(
          (l) => !((l.keyID && l.keyID === prev.keyID) || (l.id && l.id === prev.id))
        );
        setLikedLocations([...likedLocationsRef.current]);
        likesCountRef.current = Math.max(0, likesCountRef.current - 1);
        setLikesCount(likesCountRef.current);
        reactionPhotosRef.current = reactionPhotosRef.current.filter(
          (p) => p.locationName !== prev.name
        );
        setReactionPhotos([...reactionPhotosRef.current]);
      }
    }

    deckIndexRef.current = currentIdx - 1;
    setDeckIndex(currentIdx - 1);
    setCardSwipeClass("");
    setOverlayLike(0);
    setOverlayNope(0);
    cardLoadedTimeRef.current = performance.now();
  }, [swipeDone]);

  // ── Tutorial helpers ─────────────────────────────────────────────────────────
  const nextTutorialStep = useCallback(() => {
    const next = tutorialStepRef.current + 1;
    setTutorialStep(next);
    tutorialStepRef.current = next;
    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
  }, []);

  const finishTutorial = useCallback(() => {
    setTutorialActive(false);
    tutorialActiveRef.current = false;
    cardLoadedTimeRef.current = performance.now();
    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
  }, []);

  const handleTutorialGesture = useCallback((gesture) => {
    const ts = tutorialStepRef.current;
    if (ts === 2 && gesture === "thumbsUp")        nextTutorialStep();
    else if (ts === 3 && gesture === "thumbsDown") nextTutorialStep();
    else if (ts === 4 && gesture === "stopHand")   finishTutorial();
  }, [nextTutorialStep, finishTutorial]);

  const handleGestureAction = useCallback((gesture) => {
    if (tutorialActiveRef.current) { handleTutorialGesture(gesture); return; }
    if (gesture === "thumbsUp")        handleVote(true);
    else if (gesture === "thumbsDown") handleVote(false);
    else if (gesture === "stopHand")   handleGoBack();
  }, [handleTutorialGesture, handleVote, handleGoBack]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetDeck = useCallback(() => {
    deckRef.current           = [];
    deckIndexRef.current      = 0;
    likesCountRef.current     = 0;
    likedLocationsRef.current = [];
    reactionPhotosRef.current = [];
    setDeck([]);
    setDeckIndex(0);
    setLikedLocations([]);
    setLikesCount(0);
    setReactionPhotos([]);
    setSwipeDone(false);
    setCardSwipeClass("");
    setTutorialActive(false);
    tutorialActiveRef.current = false;
  }, []);

  // ── Drag event wiring ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const card = cardRef.current;
    if (!card) return;

    const onStart = (e) => {
      if (swipeDone || countdownActiveRef.current || tutorialActiveRef.current) return;
      isDraggingRef.current  = true;
      dragStartXRef.current  = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      card.classList.add("dragging");
    };

    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      dragCurrentXRef.current = clientX - dragStartXRef.current;
      const rotate = dragCurrentXRef.current * 0.05;
      card.style.transform = `translateX(${dragCurrentXRef.current}px) rotate(${rotate}deg)`;
      setOverlayLike(Math.min(Math.max(0,  dragCurrentXRef.current / 100), 1));
      setOverlayNope(Math.min(Math.max(0, -dragCurrentXRef.current / 100), 1));
    };

    const onEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      card.classList.remove("dragging");
      if      (dragCurrentXRef.current >  80) handleVote(true);
      else if (dragCurrentXRef.current < -80) handleVote(false);
      else {
        card.style.transform = "";
        setOverlayLike(0);
        setOverlayNope(0);
      }
      dragCurrentXRef.current = 0;
    };

    card.addEventListener("mousedown",     onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup",   onEnd);
    card.addEventListener("touchstart",    onStart, { passive: true });
    document.addEventListener("touchmove", onMove,  { passive: true });
    document.addEventListener("touchend",  onEnd);

    return () => {
      card.removeEventListener("mousedown",     onStart);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup",   onEnd);
      card.removeEventListener("touchstart",    onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend",  onEnd);
    };
  }, [active, swipeDone, handleVote]);

  return {
    // state
    loading, deck, deckIndex, likedLocations, likesCount,
    reactionPhotos, swipeDone, cardSwipeClass,
    overlayLike, overlayNope,
    countdownVisible, countdownText, countdownCheese, flashActive, setFlashActive,
    tutorialActive, tutorialStep, tutorialHoldBars,
    // refs (shared with camera hook and index.jsx)
    deckRef, deckIndexRef, likesCountRef, likedLocationsRef, reactionPhotosRef,
    countdownActiveRef, tutorialActiveRef, tutorialStepRef, cardLoadedTimeRef,
    capturePhotoRef,
    cardRef,
    // actions
    handleVote, handleGoBack, handleGestureAction,
    nextTutorialStep, finishTutorial,
    setTutorialHoldBars,
    resetDeck,
  };
}