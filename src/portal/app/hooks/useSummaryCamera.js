import { useState, useRef, useEffect } from "react";
import { GESTURE_HOLD_SECONDS } from "../constants/constants";

const VISION_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";

/**
 * Drives the step-8 summary gesture overlay.
 * Thumbs-up → proceed to printing. Thumbs-down → swipe again.
 *
 * @param {object}   params
 * @param {boolean}  params.active             - true when step === 8
 * @param {object}   params.gestureRecRef      - shared ref from useSwipeCamera (reuse loaded model)
 * @param {Function} params.onThumbsUp         - called when thumbs-up held
 * @param {Function} params.onThumbsDown       - called when thumbs-down held
 */
export function useSummaryCamera({ active, gestureRecRef, onThumbsUp, onThumbsDown }) {
  const [gestureStatus,   setGestureStatus]   = useState("📷 Camera loading…");
  const [gestureDetected, setGestureDetected] = useState(false);
  const [gestureProgress, setGestureProgress] = useState(0);
  const [gestureType,     setGestureType]     = useState(null);
  const [flash,           setFlash]           = useState(false);

  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const camRef     = useRef(null);
  const localRecRef       = useRef(null);
  const currentGestureRef = useRef(null);
  const gestureStartRef   = useRef(null);
  const hasTriggeredRef   = useRef(false);
  const noCameraRef       = useRef(false);

  // Keep callbacks in refs so the camera loop always calls the latest version
  // without the effect needing to re-run (which would reset gestureStartRef mid-hold)
  const onThumbsUpRef   = useRef(onThumbsUp);
  const onThumbsDownRef = useRef(onThumbsDown);
  useEffect(() => { onThumbsUpRef.current   = onThumbsUp;   }, [onThumbsUp]);
  useEffect(() => { onThumbsDownRef.current = onThumbsDown; }, [onThumbsDown]);

  useEffect(() => {
    if (!active) return;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let stopped = false;
    const ctx = canvas.getContext("2d");

    currentGestureRef.current = null;
    gestureStartRef.current   = null;
    hasTriggeredRef.current   = false;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
        });
        if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
        video.srcObject = stream;
        setGestureStatus("🤖 Initialising gesture recognition…");
      } catch {
        noCameraRef.current = true;
        setGestureStatus("📵 No camera — use buttons below");
        return;
      }

      // Reuse model from step 7 if available
      let rec = gestureRecRef?.current;
      if (!rec) {
        try {
          const { GestureRecognizer, FilesetResolver } = await import(/* @vite-ignore */ VISION_CDN);
          const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
          );
          rec = await GestureRecognizer.createFromModelPath(
            vision,
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
          );
          await rec.setOptions({
            runningMode: "VIDEO",
            minHandDetectionConfidence: 0.4,
            minHandPresenceConfidence:  0.4,
            minTrackingConfidence:      0.4,
          });
          if (gestureRecRef) gestureRecRef.current = rec;
        } catch {
          setGestureStatus("⚠ Could not load gesture model");
          return;
        }
      }
      localRecRef.current = rec;

      if (stopped) return;
      setGestureStatus("👍 Thumbs up → QR code · 👎 Thumbs down → swipe again");

      if (!window.Camera) return;
      try {
        const cam = new window.Camera(video, {
          onFrame: async () => {
            if (stopped || !localRecRef.current) return;

            const ts = performance.now();
            let result;
            try { result = localRecRef.current.recognizeForVideo(video, ts); } catch { return; }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Miniature hand preview (bottom-right corner)
            if (result?.landmarks?.length > 0 && window.drawConnectors && window.drawLandmarks) {
              const mapped = result.landmarks[0].map((lm) => ({
                x: 0.75 + lm.x * 0.25,
                y: 0.70 + lm.y * 0.30,
                z: lm.z,
              }));
              window.drawConnectors(ctx, mapped, window.HAND_CONNECTIONS,
                { color: "rgba(78,205,196,0.4)", lineWidth: 1.5 });
              window.drawLandmarks(ctx, mapped,
                { color: "rgba(255,107,53,0.7)", lineWidth: 1, radius: 3 });
            }

            // Classify
            let gesture = null;
            if (result?.gestures?.length > 0) {
              for (const list of result.gestures) {
                const top = list[0];
                if (top && top.score > 0.6) {
                  if      (top.categoryName === "Thumb_Up")   gesture = "thumbsUp";
                  else if (top.categoryName === "Thumb_Down") gesture = "thumbsDown";
                }
              }
            }

            if (gesture === null || gesture !== currentGestureRef.current) {
              currentGestureRef.current = gesture;
              gestureStartRef.current   = gesture ? performance.now() : null;
              hasTriggeredRef.current   = false;
              setGestureDetected(!!gesture);
              setGestureProgress(0);
              setGestureType(gesture);
              if (!gesture) setGestureStatus("👍 Thumbs up → QR code · 👎 Thumbs down → swipe again");
            } else if (!hasTriggeredRef.current) {
              const elapsed = (performance.now() - gestureStartRef.current) / 1000;
              const pct     = Math.min(elapsed / GESTURE_HOLD_SECONDS, 1);
              setGestureProgress(pct * 100);
              setGestureDetected(true);
              setGestureType(gesture);

              if (gesture === "thumbsUp")   setGestureStatus(`👍 Hold to confirm… (${elapsed.toFixed(1)}s)`);
              else                          setGestureStatus(`👎 Hold to swipe again… (${elapsed.toFixed(1)}s)`);

              if (elapsed >= GESTURE_HOLD_SECONDS) {
                hasTriggeredRef.current   = true;
                currentGestureRef.current = null;
                gestureStartRef.current   = null;

                setFlash(true);
                setTimeout(() => {
                  setFlash(false);
                  if (gesture === "thumbsUp")   onThumbsUpRef.current?.();
                  else                          onThumbsDownRef.current?.();
                }, 400);
              }
            }
          },
          width: 640,
          height: 480,
        });
        await cam.start();
        camRef.current = cam;
      } catch {
        setGestureStatus("⚠ Camera loop unavailable — use buttons");
      }
    };

    init();

    return () => {
      stopped = true;
      window.removeEventListener("resize", resize);
      try { camRef.current?.stop(); } catch { /* ignore */ }
      camRef.current = null;
    };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    videoRef, canvasRef,
    gestureStatus, gestureDetected, gestureProgress, gestureType, flash,
  };
}