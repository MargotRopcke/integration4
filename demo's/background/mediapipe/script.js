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

// DOM Elements
const loaderElement = document.getElementById('loader');
const gestureIndicator = document.getElementById('gestureIndicator');
const gestureTimer = document.getElementById('gestureTimer');
const progressBar = document.getElementById('progressBar');
const bgImg = document.querySelector('.bg-image');

// Background Swapping Settings
const bgImages = ['../img/background.png', '../img/images.jpeg'];
let currentBgIndex = 0;

// Gesture Hold Tracker
let thumbsUpStartTime = null;
let hasSwappedBackground = false;

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

    let isThumbsUpDetected = false;

    if (result && result.gestures && result.gestures.length > 0) {
        for (const gestureList of result.gestures) {
            const topGesture = gestureList[0];
            if (topGesture && topGesture.categoryName === 'Thumb_Up' && topGesture.score > 0.6) {
                isThumbsUpDetected = true;
                break;
            }
        }
    }

    handleThumbsUpState(isThumbsUpDetected);
}

// Process Thumbs Up hold logic
function handleThumbsUpState(isDetected) {
    if (isDetected) {
        if (hasSwappedBackground) {
            // Already swapped this gesture sequence, ignore until they release
            return;
        }

        const now = performance.now();
        if (thumbsUpStartTime === null) {
            thumbsUpStartTime = now;
            gestureIndicator.classList.add('active');
        }

        const elapsed = (now - thumbsUpStartTime) / 1000;

        // Update UI Progress
        gestureTimer.textContent = `(${elapsed.toFixed(1)}s)`;
        const percentage = Math.min((elapsed / 1.5) * 100, 100);
        progressBar.style.width = `${percentage}%`;

        if (elapsed >= 1.5) {
            swapBackground();
            hasSwappedBackground = true;
            thumbsUpStartTime = null;
            gestureIndicator.classList.remove('active');
        }
    } else {
        // Reset hold state
        thumbsUpStartTime = null;
        hasSwappedBackground = false;
        gestureIndicator.classList.remove('active');
        progressBar.style.width = '0%';
        gestureTimer.textContent = '(0.0s)';
    }
}

// Swap background with fade transition
function swapBackground() {
    currentBgIndex = (currentBgIndex + 1) % bgImages.length;

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