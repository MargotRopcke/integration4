/**
 * Camera initialization and photo capture utilities.
 */

import { classifyGesture, GESTURE_HOLD_FRAMES } from './gestures';

let videoElement = null;
let cameraReady = false;
let gestureHoldCount = 0;
let lastGesture = null;

export function getVideoElement() {
  return videoElement;
}

export function isCameraReady() {
  return cameraReady;
}

export function capturePhoto(video, captureCanvas, locationName, locationEmoji) {
  if (!video || !cameraReady) return null;

  captureCanvas.width = video.videoWidth || 640;
  captureCanvas.height = video.videoHeight || 480;
  captureCanvas.getContext('2d').drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);

  return {
    dataUrl: captureCanvas.toDataURL('image/jpeg', 0.82),
    locationName,
    locationEmoji,
  };
}

export async function initCamera(video, canvas, callbacks) {
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: 1280, height: 720 },
    });
    video.srcObject = stream;
    videoElement = video;
    cameraReady = true;
    callbacks.onHandStatus('🤖 loading hand tracking…', false);
  } catch (e) {
    callbacks.onHandStatus('📵 no camera — use buttons below', false);
    return false;
  }

  try {
    if (typeof window.Hands === 'undefined') throw new Error('MediaPipe Hands not loaded');

    const hands = new window.Hands({
      locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
    });
    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.6,
    });

    hands.onResults((res) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!res.multiHandLandmarks?.length) {
        gestureHoldCount = 0;
        lastGesture = null;
        callbacks.onHandStatus('✋ show your hand', false);
        return;
      }

      const lm = res.multiHandLandmarks[0];

      if (window.drawConnectors) {
        window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, { color: 'rgba(201,151,42,.5)', lineWidth: 2 });
      }
      if (window.drawLandmarks) {
        window.drawLandmarks(ctx, lm, { color: 'rgba(200,57,43,.8)', lineWidth: 1, radius: 3 });
      }

      if (callbacks.isCountdownActive()) return;

      const g = classifyGesture(lm);
      if (g) {
        if (g === lastGesture) {
          gestureHoldCount++;
          if (gestureHoldCount === GESTURE_HOLD_FRAMES) {
            callbacks.onGestureTriggered(g);
            gestureHoldCount = 0;
            lastGesture = null;
            return;
          }
        } else {
          lastGesture = g;
          gestureHoldCount = 1;
        }

        const pct = Math.min(gestureHoldCount / GESTURE_HOLD_FRAMES, 1);
        callbacks.onGestureProgress(g, pct);

        const cx = canvas.width * 0.5;
        const cy = 72;
        ctx.beginPath();
        ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
        ctx.strokeStyle = g === 'thumbsUp' ? '#2d6a4f' : '#c8392b';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      } else {
        gestureHoldCount = 0;
        lastGesture = null;
        callbacks.onHandStatus('👋 thumbs up or down', false);
      }
    });

    const cam = new window.Camera(video, {
      onFrame: async () => await hands.send({ image: video }),
      width: 1280,
      height: 720,
    });
    await cam.start();
    callbacks.onHandStatus('👋 show thumbs up or down', false);
  } catch (e) {
    console.warn('Hand tracking unavailable:', e);
    callbacks.onHandStatus('⚠ tracking unavailable — use buttons', false);
    return true;
  }

  return true;
}

export function resetCamera() {
  videoElement = null;
  cameraReady = false;
  gestureHoldCount = 0;
  lastGesture = null;
}
