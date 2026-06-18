import { useState, useRef, useEffect, useCallback } from "react";
import { getPrimaryCategories, getVibeCategories, getFilteredLocations, getTravelerTypes, saveSession, saveSessionPhotos } from "../data";
import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";
import "./form.css";

const MAX_LIKES = 6;
const GESTURE_HOLD_SECONDS = 1.5;

export const clientLoader = async () => {
  try {
    const [primaryCategories, vibeCategories, travelerTypes] = await Promise.all([
      getPrimaryCategories(),
      getVibeCategories(),
      getTravelerTypes()
    ]);
    return { primaryCategories, vibeCategories, travelerTypes };
  } catch (error) {
    console.error("Failed to load categories/vibes/travelers:", error);
    return { primaryCategories: [], vibeCategories: [], travelerTypes: [] };
  }
};

export default function FormPage({ loaderData }) {
  const { primaryCategories = [], vibeCategories = [], travelerTypes = [] } = loaderData || {};
  const [step, setStep] = useState(0);

  const displayTravelers = travelerTypes && travelerTypes.length > 0 ? travelerTypes : [
    { id: 1, name: "Party Animal", description: "Always looking for the best bars, clubs, and nightlife spots." },
    { id: 2, name: "New Experience Nerd", description: "Curious explorer seeking hidden gems, quirky cafés, and unique views." },
    { id: 3, name: "Adrenaline Junkie", description: "Thrill-seeker seeking action, dynamic tours, and high energy adventures." },
    { id: 4, name: "Luxury Connoisseur", description: "Savouring the finer things: high-end shopping, upscale dining, and premium service." },
    { id: 5, name: "Culture Vulture", description: "Soaking up art, history, fashion houses, and local heritage." }
  ];

  // Form selections state
  const [nameImage, setNameImage] = useState("");
  const [travelerType, setTravelerType] = useState("");
  const [chosenCategory, setChosenCategory] = useState(null);
  const [selectedVibes, setSelectedVibes] = useState([]);
  const [budget, setBudget] = useState("€ (≤30)");
  const [distance, setDistance] = useState("walking (0-2km)");
  const [takePictures, setTakePictures] = useState("yes");
  const [showNoPhotosPopup, setShowNoPhotosPopup] = useState(false);

  // Canvas State & References
  const canvasRef = useRef(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Traveler Slider State
  const [activeCardIndex, setActiveCardIndex] = useState(2);

  // Session state (for QR code)
  const [sessionUserId, setSessionUserId] = useState(null);
  const [sessionSaving, setSessionSaving] = useState(false);

  // ──────────────────────────────────────────────
  // SWIPE EXPERIENCE STATE (Step 7)
  // ──────────────────────────────────────────────
  const [swipeLocations, setSwipeLocations] = useState([]);
  const [swipeLoading, setSwipeLoading] = useState(false);
  const [deck, setDeck] = useState([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [likedLocations, setLikedLocations] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const cameraReadyRef = useRef(false);
  const [reactionPhotos, setReactionPhotos] = useState([]);
  const [countdownActive, setCountdownActive] = useState(false);
  const [swipeDone, setSwipeDone] = useState(false);
  const [gestureStatusText, setGestureStatusText] = useState("📷 Camera loading…");
  const [gestureDetected, setGestureDetected] = useState(false);
  const [cardSwipeClass, setCardSwipeClass] = useState("");
  const [overlayLikeOpacity, setOverlayLikeOpacity] = useState(0);
  const [overlayNopeOpacity, setOverlayNopeOpacity] = useState(0);
  const [countdownVisible, setCountdownVisible] = useState(false);
  const [countdownText, setCountdownText] = useState("");
  const [countdownCheese, setCountdownCheese] = useState(false);
  const [flashActive, setFlashActive] = useState(false);
  const [noCameraNotice, setNoCameraNotice] = useState(false);

  // Tutorial state
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [tutorialHoldBars, setTutorialHoldBars] = useState({ 2: 0, 3: 0, 4: 0 });

  // ──────────────────────────────────────────────
  // SUMMARY GESTURE STATE (Step 8)
  // ──────────────────────────────────────────────
  const [summaryGestureStatus, setSummaryGestureStatus] = useState("📷 Camera loading…");
  const [summaryGestureDetected, setSummaryGestureDetected] = useState(false);
  const [summaryGestureProgress, setSummaryGestureProgress] = useState(0);
  const [summaryGestureType, setSummaryGestureType] = useState(null);
  const [summaryFlash, setSummaryFlash] = useState(false);

  // ──────────────────────────────────────────────
  // PRINT STATE (Step "printing")
  // ──────────────────────────────────────────────
  const [printStatus, setPrintStatus] = useState("idle"); // "idle" | "printing" | "done" | "error"
  const [printCollageUrl, setPrintCollageUrl] = useState(null);
  const [printErrorMsg, setPrintErrorMsg] = useState("");

  // Summary camera refs
  const summaryVideoRef = useRef(null);
  const summaryCanvasRef = useRef(null);
  const summaryGestureRecRef = useRef(null);
  const summaryCamRef = useRef(null);
  const summaryCurrentGestureRef = useRef(null);
  const summaryGestureStartRef = useRef(null);
  const summaryHasTriggeredRef = useRef(false);
  const summaryNoCameraRef = useRef(false);

  // Swipe refs
  const videoRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const bgImageRef = useRef(null);
  const gestureRecognizerRef = useRef(null);
  const selfieSegRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const currentGestureRef = useRef(null);
  const gestureStartTimeRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const cardLoadedTimeRef = useRef(0);
  const countdownActiveRef = useRef(false);
  const tutorialActiveRef = useRef(false);
  const tutorialStepRef = useRef(1);
  const deckRef = useRef([]);
  const deckIndexRef = useRef(0);
  const likesCountRef = useRef(0);
  const likedLocationsRef = useRef([]);
  const reactionPhotosRef = useRef([]);
  const showBgReplacementRef = useRef(true);
  const currentBgIndexRef = useRef(0);
  const takePicturesRef = useRef("yes");
  takePicturesRef.current = takePictures;

  // Drag state refs
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragCurrentXRef = useRef(0);
  const cardRef = useRef(null);

  // ──────────────────────────────────────────────
  // SAVE SESSION WHEN ENTERING STEP 9
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 9 && step !== "printing") return;

    // Don't re-save if we already have a session ID
    if (sessionUserId) return;

    const save = async () => {
      setSessionSaving(true);
      try {
        const userId = Date.now();
        const matchedTravelerType = travelerTypes.find(t => t.name === travelerType);
        await saveSession({
          userId,
          photoName: nameImage || '',
          primaryCategoryId: chosenCategory?.id || null,
          travelerTypeId: matchedTravelerType?.id || null,
        });
        await saveSessionPhotos(userId, reactionPhotosRef.current);
        setSessionUserId(userId);
      } catch (err) {
        console.error('Failed to save session:', err);
      } finally {
        setSessionSaving(false);
      }
    };

    save();
  }, [step]);

  // ──────────────────────────────────────────────
  // AUTO-REFRESH AFTER 1 MINUTE ON STEP 9
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 9) return;

    const timer = setTimeout(() => {
      window.location.reload();
    }, 60000); // 60 seconds (1 minute)

    return () => clearTimeout(timer);
  }, [step]);

  // ──────────────────────────────────────────────
  // CANVAS (Step 1)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#1477CC";

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
      if (e.touches) e.preventDefault();
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

    const handleEnd = () => { lastPos = null; };

    canvas.addEventListener("mouseenter", handleStart);
    canvas.addEventListener("mousemove", handleMove);
    canvas.addEventListener("mouseleave", handleEnd);
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
    setStep(2);
  };

  // ──────────────────────────────────────────────
  // TRAVELER CAROUSEL (Step 2)
  // ──────────────────────────────────────────────
  const handlePrevCard = () => {
    setActiveCardIndex((prev) => (prev - 1 + displayTravelers.length) % displayTravelers.length);
  };

  const handleNextCard = () => {
    setActiveCardIndex((prev) => (prev + 1) % displayTravelers.length);
  };

  const handleSelectCard = () => {
    setTravelerType(displayTravelers[activeCardIndex].name);
    setStep(3);
  };

  // ──────────────────────────────────────────────
  // CATEGORY & VIBES (Steps 3–4)
  // ──────────────────────────────────────────────
  const handleSelectCategory = (category) => {
    setChosenCategory(category);
    setSelectedVibes([]);
    setStep(4);
  };

  const handleToggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleFinish = () => {
    setStep(7);
  };

  // ──────────────────────────────────────────────
  // RESET
  // ──────────────────────────────────────────────
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
    setSessionUserId(null);
    setSessionSaving(false);
    setSwipeLocations([]);
    setDeck([]);
    setDeckIndex(0);
    setLikedLocations([]);
    setLikesCount(0);
    setCameraReady(false);
    cameraReadyRef.current = false;
    setReactionPhotos([]);
    setCountdownActive(false);
    setSwipeDone(false);
    setTutorialActive(false);
    setTutorialStep(1);
    setCardSwipeClass("");
    setNoCameraNotice(false);
    setSummaryGestureStatus("📷 Camera loading…");
    setSummaryGestureDetected(false);
    setSummaryGestureProgress(0);
    setSummaryGestureType(null);
    setPrintStatus("idle");
    setPrintCollageUrl(null);
    setPrintErrorMsg("");

    if (cameraInstanceRef.current) {
      try { cameraInstanceRef.current.stop(); } catch (e) { }
      cameraInstanceRef.current = null;
    }
    if (summaryCamRef.current) {
      try { summaryCamRef.current.stop(); } catch (e) { }
      summaryCamRef.current = null;
    }
    setStep(0);
  };

  // ──────────────────────────────────────────────
  // SWIPE EXPERIENCE LOGIC (Step 7)
  // ──────────────────────────────────────────────
  const buildDeck = useCallback((locations) => {
    const arr = [...locations];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  const getVibeIds = useCallback(() => {
    return vibeCategories
      .filter((v) => selectedVibes.includes(v.name.trim()))
      .map((v) => v.id);
  }, [vibeCategories, selectedVibes]);

  useEffect(() => {
    if (step !== 7) return;
    let cancelled = false;

    const initSwipe = async () => {
      setSwipeLoading(true);
      try {
        const vibeIds = getVibeIds();
        const locations = await getFilteredLocations({
          categoryId: chosenCategory?.id,
          vibeIds,
          budget,
          distance,
        });

        if (cancelled) return;

        setSwipeLocations(locations);
        const shuffled = buildDeck(locations);
        setDeck(shuffled);
        deckRef.current = shuffled;
        setDeckIndex(0);
        deckIndexRef.current = 0;
        setLikedLocations([]);
        likedLocationsRef.current = [];
        setLikesCount(0);
        likesCountRef.current = 0;
        setReactionPhotos([]);
        reactionPhotosRef.current = [];
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
        if (!cancelled) setSwipeLoading(false);
      }
    };

    initSwipe();
    return () => { cancelled = true; };
  }, [step, chosenCategory, budget, distance, buildDeck, getVibeIds]);

  // Camera init for swipe
  useEffect(() => {
    if (step !== 7 || swipeLoading) return;

    const video = videoRef.current;
    const canvas = canvasOverlayRef.current;
    if (!video || !canvas) return;

    let stopped = false;
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const outputCanvas = outputCanvasRef.current;
    if (outputCanvas) {
      outputCanvas.width = 1280;
      outputCanvas.height = 720;
    }

    const onSelfieResults = (results) => {
      if (!outputCanvas) return;
      const canvasCtx = outputCanvas.getContext("2d");
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      canvasCtx.translate(outputCanvas.width, 0);
      canvasCtx.scale(-1, 1);

      if (showBgReplacementRef.current) {
        canvasCtx.drawImage(results.segmentationMask, 0, 0, outputCanvas.width, outputCanvas.height);
        canvasCtx.globalCompositeOperation = "source-in";
        canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
      } else {
        canvasCtx.drawImage(results.image, 0, 0, outputCanvas.width, outputCanvas.height);
      }
      canvasCtx.restore();
    };

    const initCamera = async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 1280, height: 720 },
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        video.srcObject = stream;
        setCameraReady(true);
        cameraReadyRef.current = true;
        setGestureStatusText("🤖 Initialising AI models…");
      } catch (e) {
        setNoCameraNotice(true);
        setGestureStatusText("📵 No camera — use buttons below");
        return;
      }

      if (!selfieSegRef.current && window.SelfieSegmentation) {
        selfieSegRef.current = new window.SelfieSegmentation({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        selfieSegRef.current.setOptions({ modelSelection: 1 });
      }
      if (selfieSegRef.current) selfieSegRef.current.onResults(onSelfieResults);

      if (!gestureRecognizerRef.current) {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
          );
          gestureRecognizerRef.current = await GestureRecognizer.createFromModelPath(
            vision,
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
          );
          await gestureRecognizerRef.current.setOptions({
            runningMode: "VIDEO",
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4,
          });
        } catch (error) {
          console.error("Failed to initialize Gesture Recognizer:", error);
        }
      }

      if (stopped) return;
      setGestureStatusText("👋 Show thumbs up, thumbs down, or stop hand");

      if (window.Camera) {
        try {
          const cam = new window.Camera(video, {
            onFrame: async () => {
              if (stopped) return;

              if (gestureRecognizerRef.current) {
                const timestamp = performance.now();
                let result;
                try {
                  result = gestureRecognizerRef.current.recognizeForVideo(video, timestamp);
                } catch (e) { }

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (result && result.landmarks && result.landmarks.length > 0) {
                  const landmarks = result.landmarks[0];
                  if (window.drawConnectors && window.drawLandmarks) {
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                      color: "rgba(78,205,196,0.5)", lineWidth: 2,
                    });
                    window.drawLandmarks(ctx, landmarks, {
                      color: "rgba(255,107,53,0.8)", lineWidth: 1, radius: 4,
                    });
                  }
                }

                if (countdownActiveRef.current || (!tutorialActiveRef.current && (performance.now() - cardLoadedTimeRef.current < 2000))) {
                  currentGestureRef.current = null;
                  gestureStartTimeRef.current = null;
                  hasTriggeredRef.current = false;
                  setGestureStatusText("👋 Show thumbs up, thumbs down, or stop hand");
                  setGestureDetected(false);
                  setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                } else {
                  let gesture = null;
                  if (result && result.gestures && result.gestures.length > 0) {
                    for (const gestureList of result.gestures) {
                      const top = gestureList[0];
                      if (top) {
                        const requiredScore = top.categoryName === "Open_Palm" ? 0.45 : 0.6;
                        if (top.score > requiredScore) {
                          if (top.categoryName === "Thumb_Up") gesture = "thumbsUp";
                          else if (top.categoryName === "Thumb_Down") gesture = "thumbsDown";
                          else if (top.categoryName === "Open_Palm") gesture = "stopHand";
                        }
                      }
                    }
                  }

                  if (gesture === null || gesture !== currentGestureRef.current) {
                    currentGestureRef.current = gesture;
                    gestureStartTimeRef.current = gesture ? performance.now() : null;
                    hasTriggeredRef.current = false;
                    if (!gesture) {
                      setGestureStatusText("👋 Show thumbs up, thumbs down, or stop hand");
                      setGestureDetected(false);
                    }
                    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                  } else if (!hasTriggeredRef.current) {
                    const now = performance.now();
                    const elapsed = (now - gestureStartTimeRef.current) / 1000;
                    const pct = Math.min(elapsed / GESTURE_HOLD_SECONDS, 1);

                    let isCorrectTutorial = false;
                    if (tutorialActiveRef.current) {
                      const ts = tutorialStepRef.current;
                      if (ts === 2 && gesture === "thumbsUp") isCorrectTutorial = true;
                      else if (ts === 3 && gesture === "thumbsDown") isCorrectTutorial = true;
                      else if (ts === 4 && gesture === "stopHand") isCorrectTutorial = true;
                      if (isCorrectTutorial) {
                        setTutorialHoldBars((prev) => ({ ...prev, [ts]: pct * 100 }));
                      } else {
                        setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                      }
                    }

                    setGestureDetected(true);
                    if (gesture === "thumbsUp") setGestureStatusText(`👍 Thumbs Up detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : "✓ LIKED!"}`);
                    else if (gesture === "thumbsDown") setGestureStatusText(`👎 Thumbs Down detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : "✓ NOPE!"}`);
                    else if (gesture === "stopHand") setGestureStatusText(`✋ Stop Hand detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : "✓ GOING BACK!"}`);

                    const cx = canvas.width * 0.5, cy = 80;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
                    ctx.strokeStyle = gesture === "thumbsUp" ? "#2ecc71" : (gesture === "thumbsDown" ? "#e74c3c" : "#00c6ff");
                    ctx.lineWidth = 4;
                    ctx.stroke();

                    if (elapsed >= GESTURE_HOLD_SECONDS) {
                      if (tutorialActiveRef.current) {
                        if (isCorrectTutorial) {
                          handleGestureAction(currentGestureRef.current);
                          hasTriggeredRef.current = true;
                          gestureStartTimeRef.current = null;
                          currentGestureRef.current = null;
                          setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                        }
                      } else {
                        handleGestureAction(currentGestureRef.current);
                        hasTriggeredRef.current = true;
                        gestureStartTimeRef.current = null;
                        currentGestureRef.current = null;
                      }
                    }
                  }
                }
              }

              if (selfieSegRef.current) {
                try { await selfieSegRef.current.send({ image: video }); } catch (e) { }
              }
            },
            width: 1280,
            height: 720,
          });
          await cam.start();
          cameraInstanceRef.current = cam;
        } catch (err) {
          setGestureStatusText("⚠ Camera loop unavailable");
        }
      }
    };

    initCamera();

    return () => {
      stopped = true;
      window.removeEventListener("resize", resizeCanvas);
      if (cameraInstanceRef.current) {
        try { cameraInstanceRef.current.stop(); } catch (e) { }
        cameraInstanceRef.current = null;
      }
    };
  }, [step, swipeLoading]);

  // ──────────────────────────────────────────────
  // SUMMARY PAGE GESTURE INIT (Step 8)
  // ──────────────────────────────────────────────
  useEffect(() => {
    if (step !== 8) return;

    const video = summaryVideoRef.current;
    const canvas = summaryCanvasRef.current;
    if (!video || !canvas) return;

    let stopped = false;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const ctx = canvas.getContext("2d");
    summaryCurrentGestureRef.current = null;
    summaryGestureStartRef.current = null;
    summaryHasTriggeredRef.current = false;

    const initSummaryCamera = async () => {
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        video.srcObject = stream;
        setSummaryGestureStatus("🤖 Initialising gesture recognition…");
      } catch (e) {
        summaryNoCameraRef.current = true;
        setSummaryGestureStatus("📵 No camera — use buttons below");
        return;
      }

      let recognizer = gestureRecognizerRef.current;
      if (!recognizer) {
        try {
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
          );
          recognizer = await GestureRecognizer.createFromModelPath(
            vision,
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
          );
          await recognizer.setOptions({
            runningMode: "VIDEO",
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4,
          });
          gestureRecognizerRef.current = recognizer;
        } catch (err) {
          setSummaryGestureStatus("⚠ Could not load gesture model");
          return;
        }
      }
      summaryGestureRecRef.current = recognizer;

      if (stopped) return;
      setSummaryGestureStatus("👍 Thumbs up → QR code · 👎 Thumbs down → swipe again");

      if (window.Camera) {
        try {
          const cam = new window.Camera(video, {
            onFrame: async () => {
              if (stopped) return;
              if (!summaryGestureRecRef.current) return;

              const timestamp = performance.now();
              let result;
              try {
                result = summaryGestureRecRef.current.recognizeForVideo(video, timestamp);
              } catch (e) { return; }

              ctx.clearRect(0, 0, canvas.width, canvas.height);

              if (result && result.landmarks && result.landmarks.length > 0) {
                const landmarks = result.landmarks[0];
                if (window.drawConnectors && window.drawLandmarks) {
                  const previewLandmarks = landmarks.map(lm => ({
                    x: 0.75 + lm.x * 0.25,
                    y: 0.7 + lm.y * 0.3,
                    z: lm.z,
                  }));
                  window.drawConnectors(ctx, previewLandmarks, window.HAND_CONNECTIONS, {
                    color: "rgba(78,205,196,0.4)", lineWidth: 1.5,
                  });
                  window.drawLandmarks(ctx, previewLandmarks, {
                    color: "rgba(255,107,53,0.7)", lineWidth: 1, radius: 3,
                  });
                }
              }

              let gesture = null;
              if (result && result.gestures && result.gestures.length > 0) {
                for (const gestureList of result.gestures) {
                  const top = gestureList[0];
                  if (top && top.score > 0.6) {
                    if (top.categoryName === "Thumb_Up") gesture = "thumbsUp";
                    else if (top.categoryName === "Thumb_Down") gesture = "thumbsDown";
                  }
                }
              }

              if (gesture === null || gesture !== summaryCurrentGestureRef.current) {
                summaryCurrentGestureRef.current = gesture;
                summaryGestureStartRef.current = gesture ? performance.now() : null;
                summaryHasTriggeredRef.current = false;
                setSummaryGestureDetected(!!gesture);
                setSummaryGestureProgress(0);
                setSummaryGestureType(gesture);
                if (!gesture) setSummaryGestureStatus("👍 Thumbs up → QR code · 👎 Thumbs down → swipe again");
              } else if (!summaryHasTriggeredRef.current) {
                const elapsed = (performance.now() - summaryGestureStartRef.current) / 1000;
                const pct = Math.min(elapsed / GESTURE_HOLD_SECONDS, 1);
                setSummaryGestureProgress(pct * 100);
                setSummaryGestureDetected(true);
                setSummaryGestureType(gesture);

                if (gesture === "thumbsUp") setSummaryGestureStatus(`👍 Hold to confirm… (${elapsed.toFixed(1)}s)`);
                else if (gesture === "thumbsDown") setSummaryGestureStatus(`👎 Hold to swipe again… (${elapsed.toFixed(1)}s)`);

                const cx = canvas.width / 2;
                const cy = canvas.height / 2;
                const radius = 50;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
                ctx.strokeStyle = gesture === "thumbsUp" ? "rgba(46,204,113,0.9)" : "rgba(231,76,60,0.9)";
                ctx.lineWidth = 6;
                ctx.lineCap = "round";
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(cx, cy, radius - 2, 0, 2 * Math.PI);
                ctx.strokeStyle = gesture === "thumbsUp" ? "rgba(46,204,113,0.15)" : "rgba(231,76,60,0.15)";
                ctx.lineWidth = 6;
                ctx.stroke();

                if (elapsed >= GESTURE_HOLD_SECONDS && !summaryHasTriggeredRef.current) {
                  summaryHasTriggeredRef.current = true;
                  summaryCurrentGestureRef.current = null;
                  summaryGestureStartRef.current = null;

                  if (gesture === "thumbsUp") {
                    setSummaryGestureStatus("✓ Preparing your collage…");
                    setSummaryFlash(true);
                    setTimeout(() => {
                      setSummaryFlash(false);
                      setPrintStatus("idle");
                      setStep("printing");
                    }, 400);
                  } else if (gesture === "thumbsDown") {
                    setSummaryGestureStatus("✓ Back to swiping!");
                    setSummaryFlash(true);
                    setTimeout(() => {
                      setSummaryFlash(false);
                      setSwipeDone(false);
                      setDeckIndex(0);
                      deckIndexRef.current = 0;
                      setLikesCount(0);
                      likesCountRef.current = 0;
                      setLikedLocations([]);
                      likedLocationsRef.current = [];
                      setReactionPhotos([]);
                      reactionPhotosRef.current = [];
                      setCardSwipeClass("");
                      setTutorialActive(false);
                      tutorialActiveRef.current = false;
                      cardLoadedTimeRef.current = performance.now();
                      setStep(7);
                    }, 400);
                  }
                }
              }
            },
            width: 640,
            height: 480,
          });
          await cam.start();
          summaryCamRef.current = cam;
        } catch (err) {
          setSummaryGestureStatus("⚠ Camera loop unavailable — use buttons");
        }
      }
    };

    initSummaryCamera();

    return () => {
      stopped = true;
      window.removeEventListener("resize", resizeCanvas);
      if (summaryCamRef.current) {
        try { summaryCamRef.current.stop(); } catch (e) { }
        summaryCamRef.current = null;
      }
    };
  }, [step]);

  // Helper to avoid ESLint issue with state setter in camera loop closure
  const setSummarySummaryFlash = (val) => setSummaryFlash(val);

  // ──────────────────────────────────────────────
  // PRINT HELPERS
  // ──────────────────────────────────────────────
  const buildCollageDataUrl = useCallback((photos) => {
    const cols = 3;
    const cellW = 640;
    const cellH = 480;
    const padding = 16;
    const rows = Math.ceil(photos.length / cols);
    const canvasW = cols * cellW + (cols + 1) * padding;
    const canvasH = rows * cellH + (rows + 1) * padding;

    const c = document.createElement("canvas");
    c.width = canvasW;
    c.height = canvasH;
    const ctx = c.getContext("2d");

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvasW, canvasH);

    const drawPhotoAt = (img, x, y) => {
      // Rounded clip
      const r = 12;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + cellW - r, y);
      ctx.quadraticCurveTo(x + cellW, y, x + cellW, y + r);
      ctx.lineTo(x + cellW, y + cellH - r);
      ctx.quadraticCurveTo(x + cellW, y + cellH, x + cellW - r, y + cellH);
      ctx.lineTo(x + r, y + cellH);
      ctx.quadraticCurveTo(x, y + cellH, x, y + cellH - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, x, y, cellW, cellH);
      ctx.restore();

      // Label bar
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x, y + cellH - 36, cellW, 36);
    };

    const promises = photos.map((photo, i) => new Promise((resolve) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = padding + col * (cellW + padding);
      const y = padding + row * (cellH + padding);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        drawPhotoAt(img, x, y);
        // Location label
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px system-ui, sans-serif";
        ctx.fillText(`📍 ${photo.locationName}`, x + 12, y + cellH - 11);
        resolve();
      };
      img.onerror = resolve;
      img.src = photo.dataUrl;
    }));

    return Promise.all(promises).then(() => c.toDataURL("image/jpeg", 0.92));
  }, []);

  const triggerPrint = useCallback(async (collageDataUrl) => {
    const res = await fetch("http://127.0.0.1:3456/print-collage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: collageDataUrl }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Print failed");
  }, []);

  const handleStartPrinting = useCallback(async () => {
    setPrintStatus("printing");
    setPrintErrorMsg("");
    try {
      const photos = reactionPhotosRef.current;

      // Build collage source: reaction photos if available, otherwise location images
      const collageItems = photos.length > 0
        ? photos
        : likedLocationsRef.current.map((loc) => ({
          dataUrl: loc.image,  // Supabase image URL
          locationName: loc.name,
        }));

      const collageUrl = collageItems.length > 0
        ? await buildCollageDataUrl(collageItems)
        : null;

      setPrintCollageUrl(collageUrl);
      if (collageUrl) await triggerPrint(collageUrl);
      setPrintStatus("done");
      setTimeout(() => setStep(9), 2000);
    } catch (err) {
      console.error("Print error:", err);
      setPrintErrorMsg(err.message || "Could not reach print server.");
      setPrintStatus("error");
    }
  }, [buildCollageDataUrl, triggerPrint]);

  // Auto-trigger print when we enter the printing step
  useEffect(() => {
    if (step !== "printing") return;
    handleStartPrinting();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGoBack = useCallback(() => {
    const currentIdx = deckIndexRef.current;
    if (currentIdx <= 0) {
      // Already at the first card, nothing to go back to
      setGestureStatusText("⛔ Already at the first spot!");
      return;
    }

    // If swipe was done, undo it
    if (swipeDone) {
      setSwipeDone(false);
    }

    const prevIndex = currentIdx - 1;
    const prevLocation = deckRef.current[prevIndex];

    // Check if the previous location was liked
    if (prevLocation) {
      const wasLiked = likedLocationsRef.current.some(
        (loc) => (loc.keyID && loc.keyID === prevLocation.keyID) || (loc.id && loc.id === prevLocation.id)
      );

      if (wasLiked) {
        // Remove from liked locations
        likedLocationsRef.current = likedLocationsRef.current.filter(
          (loc) => !((loc.keyID && loc.keyID === prevLocation.keyID) || (loc.id && loc.id === prevLocation.id))
        );
        setLikedLocations([...likedLocationsRef.current]);

        // Decrement likes count
        likesCountRef.current = Math.max(0, likesCountRef.current - 1);
        setLikesCount(likesCountRef.current);

        // Remove associated reaction photo
        reactionPhotosRef.current = reactionPhotosRef.current.filter(
          (photo) => photo.locationName !== prevLocation.name
        );
        setReactionPhotos([...reactionPhotosRef.current]);
      }
    }

    // Go back one card
    deckIndexRef.current = prevIndex;
    setDeckIndex(prevIndex);
    setCardSwipeClass("");
    setOverlayLikeOpacity(0);
    setOverlayNopeOpacity(0);
    cardLoadedTimeRef.current = performance.now();
    setGestureStatusText("↩ Went back one spot");
  }, [swipeDone]);

  const handleGestureAction = useCallback((gesture) => {
    if (tutorialActiveRef.current) {
      handleTutorialGesture(gesture);
      return;
    }
    if (gesture === "thumbsUp") handleVote(true);
    else if (gesture === "thumbsDown") handleVote(false);
    else if (gesture === "stopHand") handleGoBack();
  }, [handleGoBack]);

  const nextTutorialStep = useCallback(() => {
    const nextStep = tutorialStepRef.current + 1;
    setTutorialStep(nextStep);
    tutorialStepRef.current = nextStep;
    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
  }, []);

  const handleTutorialGesture = useCallback((gesture) => {
    const ts = tutorialStepRef.current;
    if (ts === 2 && gesture === "thumbsUp") nextTutorialStep();
    else if (ts === 3 && gesture === "thumbsDown") nextTutorialStep();
    else if (ts === 4 && gesture === "stopHand") finishTutorial();
  }, [nextTutorialStep]);

  const finishTutorial = useCallback(() => {
    setTutorialActive(false);
    tutorialActiveRef.current = false;
    cardLoadedTimeRef.current = performance.now();
    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReadyRef.current) return;

    setFlashActive(true);
    setTimeout(() => setFlashActive(false), 200);

    const captureCanvas = document.createElement("canvas");
    const vw = 1280, vh = 720;
    captureCanvas.width = vw;
    captureCanvas.height = vh;
    const ctx = captureCanvas.getContext("2d");

    const outputCanvas = outputCanvasRef.current;
    const bgImg = bgImageRef.current;

    if (showBgReplacementRef.current && bgImg && outputCanvas) {
      ctx.drawImage(bgImg, 0, 0, vw, vh);
      ctx.drawImage(outputCanvas, 0, 0, vw, vh);
    } else if (outputCanvas) {
      ctx.drawImage(outputCanvas, 0, 0, vw, vh);
    } else {
      ctx.drawImage(video, 0, 0, vw, vh);
    }

    const dataUrl = captureCanvas.toDataURL("image/jpeg", 0.85);
    const loc = deckRef.current[deckIndexRef.current];
    if (loc) {
      const newPhoto = { dataUrl, locationName: loc.name, locationImage: loc.image, locationId: loc.keyID };
      reactionPhotosRef.current = [...reactionPhotosRef.current, newPhoto];
      setReactionPhotos(reactionPhotosRef.current);
    }
  }, []);

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
      setOverlayLikeOpacity(0);
      setOverlayNopeOpacity(0);
      cardLoadedTimeRef.current = performance.now();

      if (newIndex >= deckRef.current.length || likesCountRef.current >= MAX_LIKES) {
        setSwipeDone(true);
      }
    }, 360);
  }, []);

  const triggerCountdownAndVote = useCallback((liked) => {
    if (countdownActiveRef.current) return;

    if (!liked) {
      commitVote(false);
      return;
    }

    if (likesCountRef.current >= MAX_LIKES) return;

    if (takePicturesRef.current === "no") {
      const loc = deckRef.current[deckIndexRef.current];
      if (loc) {
        const newPhoto = { dataUrl: "", locationName: loc.name, locationImage: loc.image, locationId: loc.keyID };
        reactionPhotosRef.current = [...reactionPhotosRef.current, newPhoto];
        setReactionPhotos(reactionPhotosRef.current);
      }
      commitVote(true);
      return;
    }

    countdownActiveRef.current = true;
    setCountdownActive(true);
    setCountdownVisible(true);

    const steps = ["3", "2", "1", "📸 Say Cheese!"];
    let stepIdx = 0;

    const nextCountdownStep = () => {
      if (stepIdx >= steps.length) {
        setCountdownVisible(false);
        if (takePicturesRef.current === "yes" && cameraReadyRef.current) capturePhoto();
        countdownActiveRef.current = false;
        setCountdownActive(false);
        commitVote(true);
        return;
      }
      setCountdownCheese(stepIdx === 3);
      setCountdownText(steps[stepIdx]);
      stepIdx++;
      setTimeout(nextCountdownStep, stepIdx === 4 ? 900 : 800);
    };
    nextCountdownStep();
  }, [capturePhoto, commitVote]);

  const handleVote = useCallback((liked) => {
    if (deckIndexRef.current >= deckRef.current.length) return;
    if (countdownActiveRef.current) return;
    if (tutorialActiveRef.current) return;
    triggerCountdownAndVote(liked);
  }, [triggerCountdownAndVote]);

  const showSwipeResults = useCallback(() => {
    setStep(8);
  }, []);

  // Drag handlers
  useEffect(() => {
    if (step !== 7) return;

    const card = cardRef.current;
    if (!card) return;

    const onStart = (e) => {
      if (swipeDone || countdownActiveRef.current || tutorialActiveRef.current) return;
      isDraggingRef.current = true;
      dragStartXRef.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
      card.classList.add("dragging");
    };

    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
      dragCurrentXRef.current = clientX - dragStartXRef.current;
      const rotate = dragCurrentXRef.current * 0.05;
      card.style.transform = `translateX(${dragCurrentXRef.current}px) rotate(${rotate}deg)`;
      setOverlayLikeOpacity(Math.min(Math.max(0, dragCurrentXRef.current / 100), 1));
      setOverlayNopeOpacity(Math.min(Math.max(0, -dragCurrentXRef.current / 100), 1));
    };

    const onEnd = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      card.classList.remove("dragging");
      if (dragCurrentXRef.current > 80) handleVote(true);
      else if (dragCurrentXRef.current < -80) handleVote(false);
      else {
        card.style.transform = "";
        setOverlayLikeOpacity(0);
        setOverlayNopeOpacity(0);
      }
      dragCurrentXRef.current = 0;
    };

    card.addEventListener("mousedown", onStart);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onEnd);
    card.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd);

    return () => {
      card.removeEventListener("mousedown", onStart);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onEnd);
      card.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
    };
  }, [step, swipeDone, handleVote]);

  const currentCard = deck[deckIndex] || null;
  const progressPct = deck.length > 0 ? (deckIndex / deck.length) * 100 : 0;
  const categoryLabel = chosenCategory?.name?.trim() || "All Spots";

  // ──────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────
  return (
    <div className={`form-page ${step === 7 ? "form-page--swipe" : ""} ${step === 8 ? "form-page--summary" : ""}`} id="form-screen">
      {step !== 7 && step !== 8 && (
        <>
          <div className="form-glow form-glow--top" />
          <div className="form-glow form-glow--bottom" />
        </>
      )}

      <div className={`form-card ${step === 7 ? "form-card--fullscreen" : ""} ${step === 8 ? "form-card--fullscreen" : ""}`} id="form-content-card">

        {/* === STEP 0: INTRO === */}
        {step === 0 && (
          <div className="step-intro" id="step-0">
            <div className="intro-portal-icon">
              <div className="intro-portal-ring" />
              <div className="intro-portal-ring intro-portal-ring--inner" />
              <div className="intro-portal-dot" />
            </div>
            <h1 className="form-heading">The Portal</h1>
            <p className="form-subheading">Answer a few questions to unlock your custom itinerary and discover Antwerp your own way.</p>
            <button className="btn-form" onClick={() => setStep(1)} style={{ marginTop: "2rem" }} id="start-button">
              Start Journey →
            </button>
          </div>
        )}

        {/* === STEP 1: DRAW NAME === */}
        {step === 1 && (
          <div className="step-container" id="step-1">
            <div className="form-header">
              <h1 className="form-heading">Hey there! Ready to make your own version of Antwerp?</h1>
              <p className="form-subheading">Most visitors see the same city. The Portal helps you discover local Antwerp your way.</p>
            </div>
            <p className="form-prompt">What is your name?</p>
            <div className="canvas-wrapper">
              <div className="canvas-container">
                <div className={`canvas-hint ${hasDrawn ? "hidden" : ""}`}>Write your name here</div>
                <canvas ref={canvasRef} id="canvas" width={950} height={1000} className="canvas-element" />
              </div>
              <div className="canvas-actions">
                <button onClick={handleClear} className="btn-form btn-form--secondary" id="clear">Clear</button>
                <button onClick={handleSave} className="btn-form" disabled={!hasDrawn}
                  style={{ opacity: hasDrawn ? 1 : 0.5, cursor: hasDrawn ? "pointer" : "not-allowed" }} id="save">
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
              <button onClick={handlePrevCard} className="carousel-btn" id="carousel-left">‹</button>
              <div className="carousel-viewport">
                {displayTravelers.map((type, index) => {
                  let positionClass = "";
                  const prevIndex = (activeCardIndex - 1 + displayTravelers.length) % displayTravelers.length;
                  const nextIndex = (activeCardIndex + 1) % displayTravelers.length;
                  if (index === activeCardIndex) positionClass = "card--active";
                  else if (index === prevIndex) positionClass = "card--prev";
                  else if (index === nextIndex) positionClass = "card--next";
                  return (
                    <div key={type.id} className={`carousel-card ${positionClass}`}>
                      <h3 className="card-title">{type.name}</h3>
                      <p className="card-desc">{type.description}</p>
                    </div>
                  );
                })}
              </div>
              <button onClick={handleNextCard} className="carousel-btn" id="carousel-right">›</button>
            </div>
            <div className="carousel-select-area">
              <button onClick={handleSelectCard} className="btn-form" id="select-card">Select traveler type</button>
            </div>
          </div>
        )}

        {/* === STEP 3: CATEGORY === */}
        {step === 3 && (
          <div className="step-container" id="step-3">
            <div className="form-header">
              <h1 className="form-heading">Your taste shapes a more personal journey.</h1>
              <p className="form-subheading">Choose style or flavour to refine your recommendation:</p>
            </div>
            <div className="category-choice-grid">
              {primaryCategories.map((cat) => (
                <div key={cat.id} onClick={() => handleSelectCategory(cat)} className="category-choice-card"
                  id={`category-choice-${cat.name.toLowerCase().trim()}`}>
                  <div className="category-choice-icon">
                    {cat.name.trim().toLowerCase() === "style" ? "👗" : "🍽"}
                  </div>
                  <h3 className="category-choice-title">{cat.name.trim()}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === STEP 4: VIBES === */}
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
                    <div key={vibe.id} onClick={() => handleToggleVibe(vibeName)}
                      className={`vibe-option ${isSelected ? "selected" : ""}`}
                      id={`vibe-${vibeName.toLowerCase().replace(/\s+/g, "-")}`}>
                      <div className="vibe-circle"><div className="vibe-dot" /></div>
                      <span className="vibe-text">{vibeName}</span>
                    </div>
                  );
                })}
            </div>
            <div className="vibes-actions">
              <button onClick={() => setStep(5)} className="btn-form" id="done-button">Done</button>
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
                    <div key={opt} onClick={() => setBudget(opt)}
                      className={`option-btn ${budget === opt ? "active" : ""}`}
                      id={`budget-${opt.toLowerCase().replace(/[^a-z0-9]/g, "")}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              <div className="question-group">
                <span className="group-title">Distance</span>
                <div className="options-row">
                  {["walking (0-2km)", "bike (2-5km)", "tram (if possible)"].map((opt) => (
                    <div key={opt} onClick={() => setDistance(opt)}
                      className={`option-btn ${distance === opt ? "active" : ""}`}
                      id={`distance-${opt.split(" ")[0].toLowerCase()}`}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="vibes-actions" style={{ marginTop: "2rem" }}>
              <button onClick={() => setStep(6)} className="btn-form" id="budget-distance-next">Next</button>
            </div>
          </div>
        )}

        {/* === STEP 6: TAKE PICTURES === */}
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
              <div onClick={() => { setTakePictures("yes"); handleFinish(); }}
                className={`camera-choice-card ${takePictures === "yes" ? "active" : ""}`} id="camera-choice-yes">
                <div className="camera-choice-icon">📸</div>
                <div className="camera-choice-title">Yes</div>
              </div>
              <div onClick={() => setShowNoPhotosPopup(true)}
                className={`camera-choice-card ${takePictures === "no" ? "active" : ""}`} id="camera-choice-no">
                <div className="camera-choice-icon">🚫</div>
                <div className="camera-choice-title">No</div>
              </div>
            </div>

            {/* No Photos Confirmation Popup */}
            {showNoPhotosPopup && (
              <div className="popup-overlay" id="no-photos-popup">
                <div className="popup-card">
                  <h2 className="popup-title">Are you sure?</h2>
                  <p className="popup-desc">
                    Taking photos during the experience leads to better outcomes and creates a more engaging overall experience.
                  </p>
                  <div className="popup-actions">
                    <button
                      className="btn-form"
                      onClick={() => {
                        setTakePictures("no");
                        setShowNoPhotosPopup(false);
                        handleFinish();
                      }}
                      id="popup-confirm-no-photos"
                    >
                      Yes, continue
                    </button>
                    <button
                      className="btn-form btn-form--secondary"
                      onClick={() => {
                        setTakePictures("yes");
                        setShowNoPhotosPopup(false);
                      }}
                      id="popup-cancel-no-photos"
                    >
                      No, I'm not sure
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === STEP 7: SWIPE EXPERIENCE === */}
        {step === 7 && (
          <div className="swipe-screen" id="swipe">
            {swipeLoading ? (
              <div className="swipe-loading">
                <div className="loader" />
                <p>Loading your personalised spots…</p>
              </div>
            ) : deck.length === 0 ? (
              <div className="swipe-loading">
                <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>😔</p>
                <p>No locations found matching your preferences.</p>
                <button className="btn-form" onClick={() => setStep(5)} style={{ marginTop: "1.5rem" }}>
                  ← Adjust Preferences
                </button>
              </div>
            ) : (
              <>
                <video ref={videoRef} id="video-bg" className="input_video"
                  style={{ display: "none" }} autoPlay playsInline muted />
                <div className="video-wrapper">
                  {currentCard && (
                    <img ref={bgImageRef} className="bg-image" src={currentCard.image}
                      alt="background" crossOrigin="anonymous" />
                  )}
                  <canvas ref={outputCanvasRef} className="output_canvas" />
                </div>
                <canvas ref={canvasOverlayRef} id="canvas-overlay" />

                {/* TUTORIAL OVERLAY */}
                <div className={`tutorial-overlay ${tutorialActive ? "active" : ""}`} id="tutorial-overlay">
                  <div className="tutorial-card">
                    <div className={`tutorial-step ${tutorialStep !== 1 ? "hidden" : ""}`} id="tutorial-step-1">
                      <h2 className="tutorial-title">Step onto the marker.</h2>
                      <p className="tutorial-desc">After the instructions, we'll give you a selection of personalised local spots.</p>
                      <div className="tutorial-visual alignment-marker">
                        <div className="marker-circle">👤</div>
                      </div>
                      <button className="btn-form" onClick={nextTutorialStep}>I'm Ready!</button>
                    </div>
                    <div className={`tutorial-step ${tutorialStep !== 2 ? "hidden" : ""}`} id="tutorial-step-2">
                      <h2 className="tutorial-title">Like the spot?</h2>
                      <p className="tutorial-desc">Show a thumb up motion to try a like.</p>
                      <div className="tutorial-visual gesture-hint">👍</div>
                      <div className="tutorial-loader-container">
                        <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[2]}%` }} />
                      </div>
                    </div>
                    <div className={`tutorial-step ${tutorialStep !== 3 ? "hidden" : ""}`} id="tutorial-step-3">
                      <h2 className="tutorial-title">Don't like the spot?</h2>
                      <p className="tutorial-desc">Show a thumb down motion to try a dislike.</p>
                      <div className="tutorial-visual gesture-hint">👎</div>
                      <div className="tutorial-loader-container">
                        <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[3]}%` }} />
                      </div>
                    </div>
                    <div className={`tutorial-step ${tutorialStep !== 4 ? "hidden" : ""}`} id="tutorial-step-4">
                      <h2 className="tutorial-title">Undo a (dis)like?</h2>
                      <p className="tutorial-desc">Try a return by doing a stop motion.</p>
                      <div className="tutorial-visual gesture-hint">✋</div>
                      <div className="tutorial-loader-container">
                        <div className="tutorial-hold-bar" style={{ width: `${tutorialHoldBars[4]}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="swipe-ui">
                  <div className="top-bar">
                    <div className="logo">Antwerp</div>
                    <div className="likes-counter">
                      <span className="heart" id="heart-icon">♥</span>
                      <span id="likes-count">{likesCount}</span> / {MAX_LIKES}
                    </div>
                    <div className="category-badge" id="cat-badge">{categoryLabel}</div>
                  </div>
                  <div className="progress-bar" style={{ marginBottom: ".5rem" }}>
                    <div className="progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                  <div className={`gesture-status ${gestureDetected ? "detected" : ""}`} id="gesture-status">
                    {gestureStatusText}
                  </div>
                  <div className="card-area" id="card-area">
                    {currentCard && (
                      <div className={`location-card ${cardSwipeClass}`} id="location-card" ref={cardRef}>
                        <div className="card-inner" id="card-inner">
                          <div className="card-image" id="card-image"
                            style={{ backgroundImage: `url(${currentCard.image})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                          <div className="card-body">
                            <div className="card-type" id="card-type">{categoryLabel}</div>
                            <div className="card-name" id="card-name">{currentCard.name}</div>
                            <div className="card-meta" id="card-meta">
                              📍 {currentCard.address}
                              {currentCard.quote && ` · "${currentCard.quote}"`}
                            </div>
                          </div>
                        </div>
                        <div className="card-vote-overlay like" style={{ opacity: overlayLikeOpacity }}>LIKE ✓</div>
                        <div className="card-vote-overlay nope" style={{ opacity: overlayNopeOpacity }}>NOPE ✗</div>
                      </div>
                    )}
                  </div>
                  <div className="gesture-indicator">
                    <div className="gesture-btn dislike" id="btn-dislike" onClick={() => handleVote(false)} title="Dislike">👎</div>
                    <div className="gesture-btn undo" id="btn-undo" onClick={handleGoBack} title="Go back" style={{ opacity: deckIndex > 0 ? 1 : 0.3, pointerEvents: deckIndex > 0 ? 'auto' : 'none' }}>↩</div>
                    <div className="gesture-btn like" id="btn-like" onClick={() => handleVote(true)} title="Like">👍</div>
                  </div>
                  {noCameraNotice && (
                    <div className="no-camera-notice" style={{ display: "block" }} id="no-camera-notice">
                      No camera — use buttons to vote
                    </div>
                  )}
                </div>

                <div className={`done-overlay ${swipeDone ? "visible" : ""}`} id="done-overlay">
                  <div className="done-emoji">🎉</div>
                  <h2>You've seen it all!</h2>
                  <p>You liked <strong>{likesCount}</strong> spots. Ready to see your picks?</p>
                  <button className="btn-form" onClick={showSwipeResults}>See My Picks →</button>
                  <button className="btn-back" onClick={handleReset}>↩ Start Over</button>
                </div>

                <div className={`countdown-overlay ${countdownVisible ? "visible" : ""}`} id="countdown-overlay">
                  <div className={`countdown-number ${countdownCheese ? "cheese" : ""}`} key={countdownText}>
                    {countdownText}
                  </div>
                </div>

                <div className={`flash-overlay ${flashActive ? "flash" : ""}`} id="flash-overlay" />
              </>
            )}
          </div>
        )}

        {/* === STEP 8: GESTURE-POWERED SUMMARY === */}
        {step === 8 && (
          <div className="swipe-screen summary-gesture-screen" id="step-8">
            <video ref={summaryVideoRef} style={{ display: "none" }} autoPlay playsInline muted />
            <canvas ref={summaryCanvasRef} className="summary-gesture-canvas"
              style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 5 }}
            />
            <div className={`flash-overlay ${summaryFlash ? "flash" : ""}`} />

            <div className="summary-gesture-content">
              <div className="summary-gesture-header">
                <h1 className="form-heading" style={{ color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>
                  Your Reaction Photos
                </h1>
                <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1rem", marginTop: "0.5rem" }}>
                  You liked <strong>{likesCount}</strong> spot{likesCount !== 1 ? "s" : ""} in Antwerp
                </p>
              </div>

              <div className="photos-grid summary-photos-grid" id="photos-grid-container">
                {reactionPhotos.length > 0 ? (
                  reactionPhotos.map((photo, i) => (
                    <div key={i} className="photo-cell">
                      <img src={photo.dataUrl} alt={`Reaction to ${photo.locationName}`} />
                      <div className="photo-cell-label">
                        <span className="photo-cell-emoji">📍</span> {photo.locationName}
                      </div>
                      <a className="photo-download" href={photo.dataUrl}
                        download={`reaction-${photo.locationName.replace(/\s+/g, "-").toLowerCase()}.jpg`}
                        title="Download photo">⬇</a>
                    </div>
                  ))
                ) : (
                  <div className="no-photos-msg" style={{ color: "#fff" }}>
                    <p>No reaction photos were captured.</p>
                    {likedLocations.length > 0 && (
                      <div className="summary-list" style={{ marginTop: "1.5rem" }}>
                        <span className="summary-title" style={{ color: "#fff" }}>Your Liked Spots</span>
                        <div className="summary-vibes-tags">
                          {likedLocations.map((loc) => (
                            <span key={loc.keyID} className="summary-vibe-tag">📍 {loc.name}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="summary-gesture-choices">
                <div
                  className={`summary-choice-card summary-choice-card--like ${summaryGestureType === "thumbsUp" ? "active" : ""}`}
                  onClick={() => { setPrintStatus("idle"); setStep("printing"); }}
                  id="summary-choice-like"
                >
                  <div className="summary-choice-icon">👍</div>
                  <div className="summary-choice-label">Print &amp; get QR</div>
                  <div className="summary-choice-hint">Hold thumbs up to print</div>
                  {summaryGestureType === "thumbsUp" && (
                    <div className="summary-progress-bar">
                      <div className="summary-progress-fill summary-progress-fill--like"
                        style={{ width: `${summaryGestureProgress}%` }} />
                    </div>
                  )}
                </div>

                <div
                  className={`summary-choice-card summary-choice-card--dislike ${summaryGestureType === "thumbsDown" ? "active" : ""}`}
                  onClick={() => {
                    setSwipeDone(false);
                    setDeckIndex(0);
                    deckIndexRef.current = 0;
                    setLikesCount(0);
                    likesCountRef.current = 0;
                    setLikedLocations([]);
                    likedLocationsRef.current = [];
                    setReactionPhotos([]);
                    reactionPhotosRef.current = [];
                    setCardSwipeClass("");
                    setTutorialActive(false);
                    tutorialActiveRef.current = false;
                    cardLoadedTimeRef.current = performance.now();
                    setStep(7);
                  }}
                  id="summary-choice-dislike"
                >
                  <div className="summary-choice-icon">👎</div>
                  <div className="summary-choice-label">Swipe again</div>
                  <div className="summary-choice-hint">Hold thumbs down</div>
                  {summaryGestureType === "thumbsDown" && (
                    <div className="summary-progress-bar">
                      <div className="summary-progress-fill summary-progress-fill--dislike"
                        style={{ width: `${summaryGestureProgress}%` }} />
                    </div>
                  )}
                </div>
              </div>

              <div className={`summary-gesture-status ${summaryGestureDetected ? "detected" : ""}`} id="summary-gesture-status">
                {summaryGestureStatus}
              </div>
            </div>
          </div>
        )}

        {/* === STEP "printing": COLLAGE PRINTING SCREEN === */}
        {step === "printing" && (
          <div className="step-container" id="step-printing" style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "100vh", padding: "2rem",
            background: "#0a0a0f", color: "#e8e8ed",
          }}>
            {/* Collage preview */}
            {printCollageUrl && (
              <div style={{
                width: "100%", maxWidth: 560, borderRadius: 16,
                overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "2rem", boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}>
                <img src={printCollageUrl} alt="Your reaction photo collage"
                  style={{ width: "100%", display: "block" }} />
              </div>
            )}

            {printStatus === "printing" && (
              <>
                <div className="loader" style={{ marginBottom: "1.25rem" }} />
                <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                  Printing your collage…
                </h2>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>
                  Sending to the HP Envy 5530 — please wait.
                </p>
              </>
            )}

            {printStatus === "done" && (
              <>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🖨️ ✓</div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem", color: "#2ecc71" }}>
                  Print job sent!
                </h2>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.95rem" }}>
                  Taking you to your QR code…
                </p>
              </>
            )}

            {printStatus === "error" && (
              <>
                <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: "0.5rem", color: "#e74c3c" }}>
                  Couldn't reach the printer
                </h2>
                <p style={{
                  color: "rgba(255,255,255,0.55)", fontSize: "0.9rem",
                  maxWidth: 400, textAlign: "center", marginBottom: "0.5rem",
                }}>
                  {printErrorMsg || "Make sure print-server.js is running (node print-server.js)."}
                </p>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1.25rem", flexWrap: "wrap", justifyContent: "center" }}>
                  <button className="btn-form" onClick={handleStartPrinting}>
                    ↺ Try Again
                  </button>
                  <button className="btn-form btn-form--secondary" onClick={() => setStep(9)}>
                    Skip printing →
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* === STEP 9: QR CODE === */}
        {step === 9 && (
          <div className="step-container" id="step-9">
            <div className="form-header">
              <h1 className="form-heading">Your Antwerp journey awaits! 🎉</h1>
              <p className="form-subheading">
                Scan the QR code below to get your personalised Antwerp itinerary with all your liked spots.
              </p>
            </div>

            <div className="qr-container">
              {sessionSaving || !sessionUserId ? (
                <div className="swipe-loading">
                  <div className="loader" />
                  <p>Generating your itinerary…</p>
                </div>
              ) : (
                <>
                  <div className="qr-code-wrapper">
                    <img
                      className="qr-code-image"
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`https://margotropcke.github.io/integration4/?user=${sessionUserId}`)}`}
                      alt="QR code for your itinerary"
                    />
                  </div>

                  <div className="qr-liked-spots">
                    <p className="qr-spots-label">Your {likesCount} liked spot{likesCount !== 1 ? "s" : ""}:</p>
                    <div className="summary-vibes-tags">
                      {likedLocations.map((loc) => (
                        <span key={loc.keyID || loc.name} className="summary-vibe-tag">
                          📍 {loc.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="qr-traveler-badge">
                    <span>🧭 {travelerType}</span>
                  </div>
                </>
              )}
            </div>

            <div className="summary-actions" style={{ marginTop: "2rem" }}>
              <button onClick={handleReset} className="btn-form btn-form--secondary" id="restart-button">
                ↩ Start Over
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}