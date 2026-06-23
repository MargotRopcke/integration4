import { useState, useRef, useEffect, useCallback } from "react";
import { GESTURE_HOLD_SECONDS } from "../constants/constants";

const VISION_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";

/**
 * Initialises the step-7 camera, selfie segmentation, and gesture recognition.
 * Calls handleGestureAction from useSwipeDeck when a gesture is held long enough.
 *
 * @param {object} params
 * @param {boolean}  params.active                - true when step === 7 and deck is loaded
 * @param {Function} params.handleGestureAction   - from useSwipeDeck
 * @param {object}   params.countdownActiveRef    - from useSwipeDeck
 * @param {object}   params.tutorialActiveRef     - from useSwipeDeck
 * @param {object}   params.tutorialStepRef       - from useSwipeDeck
 * @param {object}   params.cardLoadedTimeRef     - from useSwipeDeck
 * @param {Function} params.setTutorialHoldBars   - from useSwipeDeck
 */
export function useSwipeCamera({
  active,
  handleGestureAction,
  countdownActiveRef,
  tutorialActiveRef,
  tutorialStepRef,
  cardLoadedTimeRef,
  setTutorialHoldBars,
}) {
  const [cameraReady, setCameraReady] = useState(false);
  const [gestureStatus, setGestureStatus] = useState("📷 Camera loading…");
  const [gestureDetected, setGestureDetected] = useState(false);
  const [noCameraNotice, setNoCameraNotice] = useState(false);
  const [gestureProgress, setGestureProgress] = useState(0);
  const [gestureType, setGestureType] = useState(null);

  // DOM refs (passed back so StepSwipe can attach them to elements)
  const videoRef = useRef(null);
  const canvasOverlayRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const bgImageRef = useRef(null);

  // Internal refs
  const cameraReadyRef = useRef(false);
  const gestureRecRef = useRef(null);
  const selfieSegRef = useRef(null);
  const cameraInstanceRef = useRef(null);
  const currentGestureRef = useRef(null);
  const gestureStartTimeRef = useRef(null);
  const hasTriggeredRef = useRef(false);
  const showBgReplacementRef = useRef(true);

  // Expose capturePhoto so useSwipeDeck can call it
  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cameraReadyRef.current) return null;

    const c = document.createElement("canvas");
    c.width = 1280;
    c.height = 720;
    const ctx = c.getContext("2d");

    const out = outputCanvasRef.current;
    const bgImg = bgImageRef.current;

    if (showBgReplacementRef.current && bgImg && out) {
      ctx.drawImage(bgImg, 0, 0, 1280, 720);
      ctx.drawImage(out, 0, 0, 1280, 720);
    } else if (out) {
      ctx.drawImage(out, 0, 0, 1280, 720);
    } else {
      ctx.drawImage(video, 0, 0, 1280, 720);
    }

    return c.toDataURL("image/jpeg", 0.85);
  }, []);

  useEffect(() => {
    if (!active) return;

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

    const out = outputCanvasRef.current;
    if (out) { out.width = 1280; out.height = 720; }

    // Selfie segmentation results handler
    const onSelfieResults = (results) => {
      if (!out) return;
      const ctx2 = out.getContext("2d");
      ctx2.save();
      ctx2.clearRect(0, 0, out.width, out.height);
      ctx2.translate(out.width, 0);
      ctx2.scale(-1, 1);
      if (showBgReplacementRef.current) {
        ctx2.drawImage(results.segmentationMask, 0, 0, out.width, out.height);
        ctx2.globalCompositeOperation = "source-in";
        ctx2.drawImage(results.image, 0, 0, out.width, out.height);
      } else {
        ctx2.drawImage(results.image, 0, 0, out.width, out.height);
      }
      ctx2.restore();
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
        setGestureStatus("🤖 Initialising AI models…");
      } catch {
        setNoCameraNotice(true);
        setGestureStatus("📵 No camera — use buttons below");
        return;
      }

      // Selfie segmentation
      if (!selfieSegRef.current && window.SelfieSegmentation) {
        selfieSegRef.current = new window.SelfieSegmentation({
          locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${f}`,
        });
        selfieSegRef.current.setOptions({ modelSelection: 1 });
      }
      selfieSegRef.current?.onResults(onSelfieResults);

      // Gesture recognizer
      if (!gestureRecRef.current) {
        try {
          const { GestureRecognizer, FilesetResolver } = await import(/* @vite-ignore */ VISION_CDN);
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
          );
          gestureRecRef.current = await GestureRecognizer.createFromModelPath(
            vision,
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
          );
          await gestureRecRef.current.setOptions({
            runningMode: "VIDEO",
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.4,
          });
        } catch (err) {
          console.error("Failed to init GestureRecognizer:", err);
        }
      }

      if (stopped) return;
      setGestureStatus("👋 Show thumbs up, thumbs down, or stop hand");

      if (!window.Camera) return;
      try {
        const cam = new window.Camera(video, {
          onFrame: async () => {
            if (stopped) return;

            // ── Gesture recognition ────────────────────────────────────────
            if (gestureRecRef.current) {
              const ts = performance.now();
              let result;
              try { result = gestureRecRef.current.recognizeForVideo(video, ts); } catch { /* ignore */ }

              ctx.clearRect(0, 0, canvas.width, canvas.height);

              // Block gestures during countdown or card-load grace period
              const inGrace = !tutorialActiveRef.current &&
                (performance.now() - cardLoadedTimeRef.current < 2000);

              if (countdownActiveRef.current || inGrace) {
                currentGestureRef.current = null;
                gestureStartTimeRef.current = null;
                hasTriggeredRef.current = false;
                setGestureStatus("👋 Show thumbs up, thumbs down, or stop hand");
                setGestureDetected(false);
                setGestureProgress(0);
                setGestureType(null);
                setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
              } else {
                // Classify gesture
                let gesture = null;
                if (result?.gestures?.length > 0) {
                  for (const list of result.gestures) {
                    const top = list[0];
                    if (!top) continue;
                    const threshold = top.categoryName === "Open_Palm" ? 0.45 : 0.6;
                    if (top.score > threshold) {
                      if (top.categoryName === "Thumb_Up") gesture = "thumbsUp";
                      else if (top.categoryName === "Thumb_Down") gesture = "thumbsDown";
                      else if (top.categoryName === "Open_Palm") gesture = "stopHand";
                    }
                  }
                }

                if (gesture === null || gesture !== currentGestureRef.current) {
                  currentGestureRef.current = gesture;
                  gestureStartTimeRef.current = gesture ? performance.now() : null;
                  hasTriggeredRef.current = false;
                  setGestureProgress(0);
                  setGestureType(gesture);
                  setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                  if (!gesture) {
                    setGestureStatus("👋 Show thumbs up, thumbs down, or stop hand");
                    setGestureDetected(false);
                  }
                } else if (!hasTriggeredRef.current) {
                  const elapsed = (performance.now() - gestureStartTimeRef.current) / 1000;
                  const pct = Math.min(elapsed / GESTURE_HOLD_SECONDS, 1);
                  setGestureProgress(pct * 100);
                  setGestureType(gesture);

                  // Tutorial progress bars
                  const ts2 = tutorialStepRef.current;
                  const correctTutorial =
                      tutorialActiveRef.current && (
                          (ts2 === 2 && gesture === "thumbsUp") ||
                          (ts2 === 3 && gesture === "thumbsDown") ||
                          (ts2 === 4 && gesture === "stopHand")
                      );
                  setTutorialHoldBars(correctTutorial
                      ? (prev) => ({ ...prev, [ts2]: pct * 100 })
                      : { 2: 0, 3: 0, 4: 0 });

                  setGestureDetected(true);
                  if (gesture === "thumbsUp") setGestureStatus(`👍 Hold (${elapsed.toFixed(1)}s)${pct >= 1 ? " ✓ LIKED!" : ""}`);
                  else if (gesture === "thumbsDown") setGestureStatus(`👎 Hold (${elapsed.toFixed(1)}s)${pct >= 1 ? " ✓ NOPE!" : ""}`);
                  else if (gesture === "stopHand") setGestureStatus(`✋ Hold (${elapsed.toFixed(1)}s)${pct >= 1 ? " ✓ BACK!" : ""}`);

                  // Arc progress (drawn only when swiping locations, not during tutorial)
                  if (!tutorialActiveRef.current) {
                    const cx = canvas.width * 0.5, cy = 80;
                    ctx.beginPath();
                    ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
                    ctx.strokeStyle = gesture === "thumbsUp" ? "#2ecc71" : gesture === "thumbsDown" ? "#e74c3c" : "#00c6ff";
                    ctx.lineWidth = 4;
                    ctx.stroke();
                  }

                  if (elapsed >= GESTURE_HOLD_SECONDS) {
                    if (tutorialActiveRef.current && !correctTutorial) return;
                    hasTriggeredRef.current = true;
                    gestureStartTimeRef.current = null;
                    currentGestureRef.current = null;
                    setGestureProgress(0);
                    setGestureType(null);
                    handleGestureAction(gesture);
                    setTutorialHoldBars({ 2: 0, 3: 0, 4: 0 });
                  }
                }
              }
            }

            // ── Selfie segmentation ────────────────────────────────────────
            if (selfieSegRef.current) {
              showBgReplacementRef.current = !(tutorialActiveRef.current && tutorialStepRef.current >= 2);
              try { await selfieSegRef.current.send({ image: video }); } catch { /* ignore */ }
            }
          },
          width: 1280,
          height: 720,
        });
        await cam.start();
        cameraInstanceRef.current = cam;
      } catch {
        setGestureStatus("⚠ Camera loop unavailable");
      }
    };

    initCamera();

    return () => {
      stopped = true;
      window.removeEventListener("resize", resizeCanvas);
      try { cameraInstanceRef.current?.stop(); } catch { /* ignore */ }
      cameraInstanceRef.current = null;
    };
  }, [active, handleGestureAction, countdownActiveRef, tutorialActiveRef,
    tutorialStepRef, cardLoadedTimeRef, setTutorialHoldBars]);

  const stopCamera = useCallback(() => {
    try { cameraInstanceRef.current?.stop(); } catch { /* ignore */ }
    cameraInstanceRef.current = null;
  }, []);

  return {
    // state
    cameraReady, gestureStatus, gestureDetected, noCameraNotice,
    gestureProgress, gestureType,
    // DOM refs for StepSwipe
    videoRef, canvasOverlayRef, outputCanvasRef, bgImageRef,
    // actions
    capturePhoto, stopCamera,
    // internal ref exposed for usePrint
    gestureRecRef,
  };
}