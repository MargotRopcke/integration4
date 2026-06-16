import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";

const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');

// Set canvas resolution to match camera (no stretching)
const CAM_WIDTH = 1280;
const CAM_HEIGHT = 720;
canvasElement.width = CAM_WIDTH;
canvasElement.height = CAM_HEIGHT;

// State Variables
let gestureRecognizer = null;
let isModelsLoaded = false;
let isCameraStarted = false;
let showBackgroundReplacement = true;

// DOM Elements
const loaderElement = document.getElementById('loader');
const gestureIndicator = document.getElementById('gestureIndicator');
const gestureIcon = document.querySelector('.gesture-icon');
const gestureLabel = document.querySelector('.gesture-label');
const gestureTimer = document.getElementById('gestureTimer');
const progressBar = document.getElementById('progressBar');
const bgImg = document.querySelector('.bg-image');

// Background Swapping Settings
const bgImages = ['../img/background.jpg', '../img/images.jpg'];
let currentBgIndex = 0;

// Gesture Hold Tracker
let currentGesture = null; // 'Thumb_Up', 'Thumb_Down', or 'Open_Palm'
let gestureStartTime = null;
let hasTriggeredActiveGesture = false;

function onResults(results) {
    if (!isCameraStarted) {
        isCameraStarted = true;
        checkAndHideLoader();
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Flip horizontally for a mirror/selfie view
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);

    if (showBackgroundReplacement) {
        // 1. Draw the segmentation mask onto the canvas
        //    White = person, black = background
        canvasCtx.drawImage(
            results.segmentationMask, 0, 0,
            canvasElement.width, canvasElement.height
        );

        // 2. 'source-in': only draw where the mask is white (= the person)
        //    The rest of the canvas stays transparent, showing the CSS background image behind it
        canvasCtx.globalCompositeOperation = 'source-in';
        canvasCtx.drawImage(
            results.image, 0, 0,
            canvasElement.width, canvasElement.height
        );
    } else {
        // Just draw the full camera image (hiding the custom background)
        canvasCtx.drawImage(
            results.image, 0, 0,
            canvasElement.width, canvasElement.height
        );
    }

    canvasCtx.restore();
}

// Set up MediaPipe Selfie Segmentation
const selfieSegmentation = new SelfieSegmentation({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`;
    }
});

// modelSelection: 0 = general, 1 = landscape (faster)
selfieSegmentation.setOptions({
    modelSelection: 1,
});

selfieSegmentation.onResults(onResults);

// Setup Camera
const camera = new Camera(videoElement, {
    onFrame: async () => {
        if (gestureRecognizer) {
            detectGestures();
        }
        await selfieSegmentation.send({ image: videoElement });
    },
    width: CAM_WIDTH,
    height: CAM_HEIGHT
});

// Initialize Gesture Recognizer
async function initializeGestureRecognizer() {
    try {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
        );
        gestureRecognizer = await GestureRecognizer.createFromModelPath(
            vision,
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
        );
        await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
        console.log("Gesture Recognizer successfully initialized");
    } catch (error) {
        console.error("Failed to initialize Gesture Recognizer:", error);
    }
}

// Check and Hide Loading Screen
function checkAndHideLoader() {
    if (isModelsLoaded && isCameraStarted) {
        loaderElement.classList.add('hidden');
    }
}

// Detect Gestures in Video Stream
function detectGestures() {
    const timestamp = performance.now();
    const result = gestureRecognizer.recognizeForVideo(videoElement, timestamp);

    let detectedGesture = null;

    if (result && result.gestures && result.gestures.length > 0) {
        for (const gestureList of result.gestures) {
            const topGesture = gestureList[0];
            if (topGesture && topGesture.score > 0.6) {
                if (topGesture.categoryName === 'Thumb_Up' ||
                    topGesture.categoryName === 'Thumb_Down' ||
                    topGesture.categoryName === 'Open_Palm') {
                    detectedGesture = topGesture.categoryName;
                    break;
                }
            }
        }
    }

    handleGestureState(detectedGesture);
}

// Process Gesture hold logic
function handleGestureState(detectedGesture) {
    if (detectedGesture === null || detectedGesture !== currentGesture) {
        currentGesture = detectedGesture;
        gestureStartTime = detectedGesture ? performance.now() : null;
        hasTriggeredActiveGesture = false;

        if (!detectedGesture) {
            gestureIndicator.classList.remove('active');
            progressBar.style.width = '0%';
            gestureTimer.textContent = '(0.0s)';
        }
        return;
    }

    if (hasTriggeredActiveGesture) {
        return;
    }

    const now = performance.now();
    const elapsed = (now - gestureStartTime) / 1000;

    // Update UI Progress Info
    gestureIndicator.classList.add('active');

    let icon = "👍";
    let label = "Thumbs Up Detected";
    let progressColor = "linear-gradient(90deg, #ff007f 0%, #7f00ff 100%)";
    let glowColor = "0 0 12px rgba(255, 0, 127, 0.8)";

    if (currentGesture === 'Thumb_Down') {
        icon = "👎";
        label = "Thumbs Down Detected";
        progressColor = "linear-gradient(90deg, #ff4e50 0%, #f9d423 100%)";
        glowColor = "0 0 12px rgba(255, 78, 80, 0.8)";
    } else if (currentGesture === 'Open_Palm') {
        icon = "✋";
        label = "Stop Hand Detected";
        progressColor = "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)";
        glowColor = "0 0 12px rgba(0, 198, 255, 0.8)";
    }

    gestureIcon.textContent = icon;
    gestureLabel.textContent = label;
    progressBar.style.background = progressColor;
    progressBar.style.boxShadow = glowColor;

    gestureTimer.textContent = `(${elapsed.toFixed(1)}s)`;
    const percentage = Math.min((elapsed / 1.5) * 100, 100);
    progressBar.style.width = `${percentage}%`;

    if (elapsed >= 1.5) {
        triggerGestureAction(currentGesture);
        hasTriggeredActiveGesture = true;
        gestureStartTime = null;
        currentGesture = null;
        gestureIndicator.classList.remove('active');
    }
}

// Trigger action based on completed gesture
function triggerGestureAction(gesture) {
    if (gesture === 'Thumb_Up') {
        swapBackground(1);
    } else if (gesture === 'Thumb_Down') {
        swapBackground(-1);
    } else if (gesture === 'Open_Palm') {
        toggleBackgroundReplacement();
    }
}

// Toggle background replacement on/off
function toggleBackgroundReplacement(forceState) {
    if (typeof forceState === 'boolean') {
        showBackgroundReplacement = forceState;
    } else {
        showBackgroundReplacement = !showBackgroundReplacement;
    }

    if (showBackgroundReplacement) {
        bgImg.style.display = 'block';
    } else {
        bgImg.style.display = 'none';
    }
}

// Swap background with fade transition
function swapBackground(direction) {
    if (!showBackgroundReplacement) {
        toggleBackgroundReplacement(true);
    }

    currentBgIndex = (currentBgIndex + direction + bgImages.length) % bgImages.length;

    bgImg.classList.add('fade-out');

    // Preload image to avoid flicker
    const tempImg = new Image();
    tempImg.src = bgImages[currentBgIndex];
    tempImg.onload = () => {
        bgImg.src = bgImages[currentBgIndex];
        bgImg.classList.remove('fade-out');
    };
}

// Initialize Application
async function init() {
    await initializeGestureRecognizer();
    isModelsLoaded = true;
    checkAndHideLoader();
    camera.start();
}

// Run Initialization
init();