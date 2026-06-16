import { GestureRecognizer, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";

// ────────────────────────────────────────────────
// DATA
// ────────────────────────────────────────────────
const LOCATIONS = [
    { id: 1, name: 'The Jane', type: 'restaurant', category: 'restaurant', emoji: '⭐', desc: 'Michelin-starred in a chapel', address: 'Paradeplein 1', lat: 51.2089, lng: 4.3959, tags: ['Fine Dining', 'Iconic', 'Belgian'], neighborhood: 'Berchem', rating: '9.2', gmaps: 'https://maps.google.com/?q=The+Jane+Antwerp' },
    { id: 2, name: 'Grand Central', type: 'restaurant', category: 'restaurant', emoji: '🚂', desc: 'Art Deco brasserie at Central Station', address: 'Koningin Astridplein 27', lat: 51.2170, lng: 4.4214, tags: ['Brasserie', 'Historic', 'Cocktails'], neighborhood: 'Centre', rating: '8.4', gmaps: 'https://maps.google.com/?q=Grand+Central+Antwerp' },
    { id: 3, name: 'Dries Van Noten', type: 'fashion', category: 'fashion', emoji: '👗', desc: 'Flagship store of the Belgian fashion icon', address: 'Nationalestraat 16', lat: 51.2153, lng: 4.3996, tags: ['Luxury', 'Belgian Designer', 'Avant-garde'], neighborhood: 'Fashion Quarter', rating: '9.5', gmaps: 'https://maps.google.com/?q=Dries+Van+Noten+Antwerp' },
    { id: 4, name: 'Café d\'Anvers', type: 'bar', category: 'bar', emoji: '🎵', desc: 'Legendary club in a 19th century church', address: 'Verversrui 15', lat: 51.2282, lng: 4.4013, tags: ['Nightlife', 'Historic', 'Electronic'], neighborhood: 'Schipperskwartier', rating: '8.8', gmaps: 'https://maps.google.com/?q=Cafe+d+Anvers+Antwerp' },
    { id: 5, name: 'Graanmarkt 13', type: 'restaurant', category: 'restaurant', emoji: '🌿', desc: 'Plant-forward cuisine, lifestyle store & hotel', address: 'Graanmarkt 13', lat: 51.2183, lng: 4.3978, tags: ['Vegetable-forward', 'Design', 'Trendy'], neighborhood: 'Centre', rating: '8.9', gmaps: 'https://maps.google.com/?q=Graanmarkt+13+Antwerp' },
    { id: 6, name: 'Ann Demeulemeester', type: 'fashion', category: 'fashion', emoji: '🖤', desc: 'Gothic elegance at its most refined', address: 'Verlatstraat 38', lat: 51.2100, lng: 4.3948, tags: ['Dark', 'Belgian Designer', 'Iconic'], neighborhood: 'Zuid', rating: '9.1', gmaps: 'https://maps.google.com/?q=Ann+Demeulemeester+Antwerp' },
    { id: 7, name: 'Bouchery', type: 'restaurant', category: 'restaurant', emoji: '🥩', desc: 'Zero-waste farm-to-table experience', address: 'Dambruggestraat 23', lat: 51.2145, lng: 4.4200, tags: ['Sustainable', 'Farm-to-Table', 'Creative'], neighborhood: 'Borgerhout', rating: '8.6', gmaps: 'https://maps.google.com/?q=Bouchery+Antwerp' },
    { id: 8, name: 'Normo Espresso', type: 'cafe', category: 'cafe', emoji: '☕', desc: 'Specialty coffee in a minimalist space', address: 'Kammenstraat 13', lat: 51.2181, lng: 4.4026, tags: ['Specialty Coffee', 'Minimal', 'Third Wave'], neighborhood: 'Centre', rating: '8.3', gmaps: 'https://maps.google.com/?q=Normo+Espresso+Antwerp' },
    { id: 9, name: 'Essentiel Antwerp', type: 'fashion', category: 'fashion', emoji: '✨', desc: 'Colour-block prints and bold Belgian style', address: 'Nationalestraat 12', lat: 51.2155, lng: 4.3993, tags: ['Colourful', 'Belgian', 'Contemporary'], neighborhood: 'Fashion Quarter', rating: '8.7', gmaps: 'https://maps.google.com/?q=Essentiel+Antwerp' },
    { id: 10, name: 'Bar Paniek', type: 'bar', category: 'bar', emoji: '🍺', desc: 'Cozy craft beer bar with 200+ Belgian beers', address: 'Oudevaartplaats 12', lat: 51.2220, lng: 4.4052, tags: ['Craft Beer', 'Belgian', 'Cozy'], neighborhood: 'Centre', rating: '8.5', gmaps: 'https://maps.google.com/?q=Bar+Paniek+Antwerp' },
    { id: 11, name: 'Fiskebar', type: 'restaurant', category: 'restaurant', emoji: '🐟', desc: 'Sustainable Nordic-inspired seafood', address: 'Marnixplaats 17', lat: 51.2197, lng: 4.3962, tags: ['Seafood', 'Nordic', 'Sustainable'], neighborhood: 'Centre', rating: '8.8', gmaps: 'https://maps.google.com/?q=Fiskebar+Antwerp' },
    { id: 12, name: 'Louis Vuitton MAS', type: 'fashion', category: 'fashion', emoji: '👜', desc: 'Luxury flagship near the waterfront museum', address: 'Meir 34', lat: 51.2194, lng: 4.4081, tags: ['Luxury', 'Flagship', 'Iconic'], neighborhood: 'Meir', rating: '8.0', gmaps: 'https://maps.google.com/?q=Louis+Vuitton+Antwerp' },
    { id: 13, name: 'Bocca Negra', type: 'cafe', category: 'cafe', emoji: '🫖', desc: 'Art Nouveau café with legendary hot chocolate', address: 'Falconrui 13', lat: 51.2235, lng: 4.4025, tags: ['Art Nouveau', 'Historic', 'Hot Chocolate'], neighborhood: 'Centre', rating: '8.6', gmaps: 'https://maps.google.com/?q=Bocca+Negra+Antwerp' },
    { id: 14, name: 'Zeppelin', type: 'bar', category: 'bar', emoji: '🎸', desc: 'Rock-n-roll bar with local Antwerp vibe', address: 'Sint-Pietersvliet 20', lat: 51.2271, lng: 4.4008, tags: ['Rock', 'Local', 'Live Music'], neighborhood: 'Eilandje', rating: '8.2', gmaps: 'https://maps.google.com/?q=Zeppelin+Bar+Antwerp' },
    { id: 15, name: 'Walter Van Beirendonck', type: 'fashion', category: 'fashion', emoji: '🦄', desc: 'Surreal, playful avant-garde fashion world', address: 'Sint-Antoniusstraat 12', lat: 51.2147, lng: 4.3980, tags: ['Avant-garde', 'Surreal', 'Iconic'], neighborhood: 'Fashion Quarter', rating: '9.3', gmaps: 'https://maps.google.com/?q=Walter+Van+Beirendonck+Antwerp' },
];

const HEATMAP_POINTS = [
    [51.2194, 4.4082, 0.95], [51.2183, 4.4050, 0.9], [51.2200, 4.4060, 0.88],
    [51.2175, 4.4020, 0.85], [51.2210, 4.4030, 0.82],
    [51.2153, 4.3996, 0.78], [51.2160, 4.4010, 0.75], [51.2145, 4.4000, 0.70],
    [51.2202, 4.4003, 0.88], [51.2195, 4.3990, 0.85],
    [51.2120, 4.3970, 0.65], [51.2100, 4.3950, 0.62], [51.2135, 4.3975, 0.68],
    [51.2285, 4.4045, 0.72], [51.2295, 4.4030, 0.68], [51.2270, 4.4038, 0.70],
    [51.2258, 4.4015, 0.75], [51.2270, 4.4000, 0.72],
    [51.2175, 4.4215, 0.92], [51.2165, 4.4200, 0.88], [51.2180, 4.4205, 0.90],
    [51.2140, 4.4175, 0.55], [51.2150, 4.4185, 0.52],
    [51.2092, 4.3960, 0.60], [51.2080, 4.3970, 0.58],
];

// ────────────────────────────────────────────────
// STATE
// ────────────────────────────────────────────────
let currentCategory = 'all';
let deck = [];
let deckIndex = 0;
let likedLocations = [];
let likesCount = 0;
const MAX_LIKES = 6;
let cameraReady = false;
let videoElement = null;
let resultsMapInstance = null;
let heatmapVisible = false;
let reactionPhotos = []; // { dataUrl, locationName, locationEmoji }
let countdownActive = false;
let pendingVoteLike = null; // stored while countdown runs

// Selfie Segmentation & Gesture Recognizer models
let gestureRecognizer = null;
let selfieSegmentation = null;
let showBackgroundReplacement = true;

// Background Swapping Settings
const bgImages = ['../img/background.jpg', '../img/images.jpg'];
let currentBgIndex = 0;

// Gesture Hold Tracker (Time-based system)
let currentGesture = null; // 'thumbsUp', 'thumbsDown', or 'stopHand'
let gestureStartTime = null;
let hasTriggeredActiveGesture = false;
let cardLoadedTime = 0;

// ────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('intro').classList.add('active');
    }, 800);

    document.querySelectorAll('.pill').forEach(p => {
        p.addEventListener('click', () => {
            document.querySelectorAll('.pill').forEach(x => x.classList.remove('active'));
            p.classList.add('active');
            currentCategory = p.dataset.cat;
        });
    });
});

function buildDeck() {
    const all = currentCategory === 'all'
        ? [...LOCATIONS]
        : LOCATIONS.filter(l => l.category === currentCategory);
    for (let i = all.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
}

function startSwipe() {
    deck = buildDeck();
    deckIndex = 0;
    likedLocations = [];
    reactionPhotos = [];
    likesCount = 0;
    updateLikesUI();
    showScreen('swipe');
    document.getElementById('cat-badge').textContent =
        currentCategory === 'all' ? 'All Spots' :
            currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1) + 's';
    renderCard();
    initCamera();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// ────────────────────────────────────────────────
// CARD RENDER
// ────────────────────────────────────────────────
function renderCard() {
    if (deckIndex >= deck.length) {
        showDoneOverlay();
        return;
    }
    const loc = deck[deckIndex];
    document.getElementById('card-image').textContent = loc.emoji;
    document.getElementById('card-type').textContent = loc.type.toUpperCase() + ' · ' + loc.neighborhood;
    document.getElementById('card-name').textContent = loc.name;
    document.getElementById('card-meta').textContent = '📍 ' + loc.address + '  ⭐ ' + loc.rating;
    const tagsEl = document.getElementById('card-tags');
    tagsEl.innerHTML = loc.tags.map(t => `<span class="tag">${t}</span>`).join('');

    document.getElementById('overlay-like').style.opacity = 0;
    document.getElementById('overlay-nope').style.opacity = 0;

    const pct = (deckIndex / deck.length) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';

    const card = document.getElementById('location-card');
    card.style.transform = '';
    card.style.opacity = '';
    card.classList.remove('swipe-right', 'swipe-left');

    cardLoadedTime = performance.now();
}

// ────────────────────────────────────────────────
// COUNTDOWN + PHOTO CAPTURE
// ────────────────────────────────────────────────
function triggerCountdownAndVote(liked) {
    if (countdownActive) return;

    // For dislikes, skip the countdown entirely
    if (!liked) {
        commitVote(false);
        return;
    }

    if (likesCount >= MAX_LIKES) {
        document.getElementById('heart-icon').classList.add('heart-pulse');
        setTimeout(() => document.getElementById('heart-icon').classList.remove('heart-pulse'), 400);
        return;
    }

    countdownActive = true;
    const overlay = document.getElementById('countdown-overlay');
    const numEl = document.getElementById('countdown-number');
    overlay.classList.add('visible');

    const steps = ['3', '2', '1', '📸 Say Cheese!'];
    let step = 0;

    function nextStep() {
        if (step >= steps.length) {
            overlay.classList.remove('visible');
            capturePhoto();
            countdownActive = false;
            commitVote(true);
            return;
        }
        numEl.className = 'countdown-number' + (step === 3 ? ' cheese' : '');
        numEl.textContent = steps[step];
        // re-trigger animation
        numEl.style.animation = 'none';
        numEl.offsetHeight; // reflow
        numEl.style.animation = '';
        step++;
        setTimeout(nextStep, step === 4 ? 900 : 800);
    }

    nextStep();
}

function capturePhoto() {
    if (!videoElement || !cameraReady) return;

    // Flash effect
    const flash = document.getElementById('flash-overlay');
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 200);

    const captureCanvas = document.createElement('canvas');
    const vw = 1280;
    const vh = 720;
    captureCanvas.width = vw;
    captureCanvas.height = vh;
    const ctx = captureCanvas.getContext('2d');

    const outputCanvas = document.querySelector('.output_canvas');
    const bgImg = document.querySelector('.bg-image');

    if (showBackgroundReplacement && bgImg && outputCanvas) {
        // Draw the custom background first
        ctx.drawImage(bgImg, 0, 0, vw, vh);
        // Draw the segmented person on top
        ctx.drawImage(outputCanvas, 0, 0, vw, vh);
    } else {
        // Fallback: draw just the camera/canvas contents
        if (outputCanvas) {
            ctx.drawImage(outputCanvas, 0, 0, vw, vh);
        } else {
            ctx.drawImage(videoElement, 0, 0, vw, vh);
        }
    }

    const dataUrl = captureCanvas.toDataURL('image/jpeg', 0.85);
    const loc = deck[deckIndex];
    reactionPhotos.push({
        dataUrl,
        locationName: loc.name,
        locationEmoji: loc.emoji,
    });
}

// ────────────────────────────────────────────────
// VOTING
// ────────────────────────────────────────────────
function vote(liked) {
    if (deckIndex >= deck.length) return;
    if (countdownActive) return;
    triggerCountdownAndVote(liked);
}

function commitVote(liked) {
    const loc = deck[deckIndex];
    const card = document.getElementById('location-card');

    if (liked) {
        likedLocations.push(loc);
        likesCount++;
        updateLikesUI();
        card.classList.add('swipe-right');
        document.getElementById('btn-like').classList.add('active-gesture');
        setTimeout(() => document.getElementById('btn-like').classList.remove('active-gesture'), 400);
    } else {
        card.classList.add('swipe-left');
        document.getElementById('btn-dislike').classList.add('active-gesture');
        setTimeout(() => document.getElementById('btn-dislike').classList.remove('active-gesture'), 400);
    }

    setTimeout(() => {
        deckIndex++;
        if (deckIndex >= deck.length || likesCount >= MAX_LIKES) {
            showDoneOverlay();
        } else {
            renderCard();
            swapBackground(1);
        }
    }, 360);
}

function updateLikesUI() {
    document.getElementById('likes-count').textContent = likesCount;
}

function showDoneOverlay() {
    document.getElementById('done-likes').textContent = likesCount;
    document.getElementById('done-overlay').classList.add('visible');
}

function showResults() {
    showScreen('results');
    document.getElementById('results-subtitle').textContent =
        `You loved ${likesCount} spots in Antwerp`;

    // Update photos tab badge
    const photosBtn = document.getElementById('photos-tab-btn');
    photosBtn.textContent = `📸 Reaction Photos (${reactionPhotos.length})`;

    renderLikedList();
    renderPhotosGrid();
    setTimeout(buildResultsMap, 300);
}

function resetApp() {
    document.getElementById('done-overlay').classList.remove('visible');
    likedLocations = [];
    reactionPhotos = [];
    likesCount = 0;
    resultsMapInstance = null;
    heatmapVisible = false;
    countdownActive = false;
    videoElement = null;
    cameraReady = false;
    showScreen('intro');
    if (handsModel) { handsModel = null; }
}

// ────────────────────────────────────────────────
// TABS
// ────────────────────────────────────────────────
function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

    const tabMap = { list: 0, map: 1, photos: 2 };
    document.querySelectorAll('.tab')[tabMap[tab]].classList.add('active');

    const contentMap = { list: 'list-tab', map: 'map-tab', photos: 'photos-tab-content' };
    document.getElementById(contentMap[tab]).classList.add('active');

    if (tab === 'map' && !resultsMapInstance) {
        setTimeout(buildResultsMap, 100);
    }
}

// ────────────────────────────────────────────────
// LIKED LIST
// ────────────────────────────────────────────────
function renderLikedList() {
    const el = document.getElementById('liked-list');
    if (likedLocations.length === 0) {
        el.innerHTML = '<p style="padding:2rem;color:var(--text2)">You didn\'t like any spots! Go back and swipe some. 😊</p>';
        return;
    }
    el.innerHTML = likedLocations.map(loc => `
    <div class="liked-card">
      <div class="liked-card-img">${loc.emoji}</div>
      <div class="liked-card-body">
        <div class="card-type">${loc.type.toUpperCase()} · ${loc.neighborhood}</div>
        <div class="card-name">${loc.name}</div>
        <div class="card-meta">📍 ${loc.address} · ⭐ ${loc.rating}</div>
        <div class="card-tags" style="margin-bottom:.75rem">${loc.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
        <a href="${loc.gmaps}" target="_blank" rel="noopener">Open in Google Maps ↗</a>
      </div>
    </div>
  `).join('');
}

// ────────────────────────────────────────────────
// PHOTOS GRID
// ────────────────────────────────────────────────
function renderPhotosGrid() {
    const container = document.getElementById('photos-grid-container');
    if (reactionPhotos.length === 0) {
        container.innerHTML = '<p class="no-photos-msg">No reaction photos — camera access was needed to capture them.</p>';
        return;
    }
    const grid = document.createElement('div');
    grid.className = 'photos-grid';

    reactionPhotos.forEach((photo, i) => {
        const cell = document.createElement('div');
        cell.className = 'photo-cell';

        const img = document.createElement('img');
        img.src = photo.dataUrl;
        img.alt = `Reaction to ${photo.locationName}`;

        const label = document.createElement('div');
        label.className = 'photo-cell-label';
        label.innerHTML = `<span class="photo-cell-emoji">${photo.locationEmoji}</span> ${photo.locationName}`;

        const dlLink = document.createElement('a');
        dlLink.className = 'photo-download';
        dlLink.href = photo.dataUrl;
        dlLink.download = `reaction-${photo.locationName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        dlLink.title = 'Download photo';
        dlLink.textContent = '⬇';

        cell.appendChild(img);
        cell.appendChild(label);
        cell.appendChild(dlLink);
        grid.appendChild(cell);
    });

    container.innerHTML = '';
    container.appendChild(grid);
}

// ────────────────────────────────────────────────
// MAPLIBRE RESULTS MAP
// ────────────────────────────────────────────────
function buildResultsMap() {
    if (resultsMapInstance) return;
    const el = document.getElementById('results-map');
    if (!el || likedLocations.length === 0) {
        el.innerHTML = '<p style="padding:2rem;color:var(--text2)">Like some locations first!</p>';
        return;
    }

    resultsMapInstance = new maplibregl.Map({
        container: 'results-map',
        style: {
            version: 8,
            sources: {
                'osm': {
                    type: 'raster',
                    tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                    tileSize: 256,
                    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                }
            },
            layers: [{ id: 'osm', type: 'raster', source: 'osm' }]
        },
        center: [4.4025, 51.2194],
        zoom: 13,
    });

    const bounds = likedLocations.reduce((b, loc) => {
        return b.extend([loc.lng, loc.lat]);
    }, new maplibregl.LngLatBounds([likedLocations[0].lng, likedLocations[0].lat], [likedLocations[0].lng, likedLocations[0].lat]));

    resultsMapInstance.on('load', () => {
        likedLocations.forEach((loc) => {
            const markerEl = document.createElement('div');
            markerEl.style.cssText = `
                width:36px;height:36px;border-radius:50%;
                background:#ff6b35;border:2px solid #fff;
                display:flex;align-items:center;justify-content:center;
                font-size:16px;cursor:pointer;
                box-shadow:0 2px 10px rgba(0,0,0,.4);
            `;
            markerEl.textContent = loc.emoji;

            new maplibregl.Marker({ element: markerEl })
                .setLngLat([loc.lng, loc.lat])
                .setPopup(new maplibregl.Popup({ offset: 20 }).setHTML(`
                    <strong style="font-family:'DM Serif Display',serif;font-size:1rem">${loc.name}</strong><br>
                    <span style="font-size:.82rem;color:#9999b0">${loc.address}</span><br>
                    <a href="${loc.gmaps}" target="_blank" style="color:#ff6b35;font-size:.82rem;text-decoration:none;font-weight:500">Open in Google Maps ↗</a>
                `))
                .addTo(resultsMapInstance);
        });

        resultsMapInstance.fitBounds(bounds, { padding: 80, maxZoom: 15 });

        resultsMapInstance.addSource('heatmap-source', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: HEATMAP_POINTS.map(([lat, lng, weight]) => ({
                    type: 'Feature',
                    properties: { weight },
                    geometry: { type: 'Point', coordinates: [lng, lat] }
                }))
            }
        });

        resultsMapInstance.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heatmap-source',
            layout: { visibility: 'none' },
            paint: {
                'heatmap-weight': ['get', 'weight'],
                'heatmap-intensity': 1.2,
                'heatmap-radius': 50,
                'heatmap-opacity': 0.75,
                'heatmap-color': [
                    'interpolate', ['linear'], ['heatmap-density'],
                    0, 'rgba(0,0,0,0)',
                    0.1, '#00f5ff',
                    0.3, '#00ff88',
                    0.55, '#ffff00',
                    0.8, '#ff8800',
                    1, '#ff0000'
                ]
            }
        });
    });

    const gmapsBase = 'https://www.google.com/maps/dir/';
    const waypoints = likedLocations.map(l => `${l.lat},${l.lng}`).join('/');
    document.getElementById('gmaps-link').href = gmapsBase + waypoints;
}

// Heatmap toggle
function toggleHeatmap() {
    if (!resultsMapInstance) return;
    heatmapVisible = !heatmapVisible;
    resultsMapInstance.setLayoutProperty('heatmap-layer', 'visibility', heatmapVisible ? 'visible' : 'none');
    const btn = document.getElementById('heatmap-btn');
    const legend = document.getElementById('heatmap-legend');
    btn.classList.toggle('on', heatmapVisible);
    btn.textContent = heatmapVisible ? '🔥 Hide Busy Heatmap' : '🔥 Toggle Busy Heatmap';
    legend.classList.toggle('visible', heatmapVisible);
}

// ────────────────────────────────────────────────
// MEDIAPIPE SELFIE SEGMENTATION & GESTURE RECOGNIZER
// ────────────────────────────────────────────────
function onSelfieResults(results) {
    const canvasElement = document.querySelector('.output_canvas');
    if (!canvasElement) return;
    const canvasCtx = canvasElement.getContext('2d');

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Flip horizontally for a mirror/selfie view
    canvasCtx.translate(canvasElement.width, 0);
    canvasCtx.scale(-1, 1);

    if (showBackgroundReplacement) {
        // 1. Draw the segmentation mask onto the canvas
        canvasCtx.drawImage(
            results.segmentationMask, 0, 0,
            canvasElement.width, canvasElement.height
        );

        // 2. 'source-in': only draw where the mask is white (= the person)
        canvasCtx.globalCompositeOperation = 'source-in';
        canvasCtx.drawImage(
            results.image, 0, 0,
            canvasElement.width, canvasElement.height
        );
    } else {
        // Just draw the full camera image
        canvasCtx.drawImage(
            results.image, 0, 0,
            canvasElement.width, canvasElement.height
        );
    }

    canvasCtx.restore();
}

async function initCamera() {
    const video = document.getElementById('video-bg');
    const canvas = document.getElementById('canvas-overlay');
    const ctx = canvas.getContext('2d');
    const statusEl = document.getElementById('gesture-status');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
        video.srcObject = stream;
        videoElement = video;
        cameraReady = true;
        statusEl.textContent = '🤖 Initialising AI models…';
    } catch (e) {
        document.getElementById('no-camera-notice').style.display = 'block';
        statusEl.textContent = '📵 No camera — use buttons below';
        return;
    }

    const outputCanvas = document.querySelector('.output_canvas');
    if (outputCanvas) {
        outputCanvas.width = 1280;
        outputCanvas.height = 720;
    }

    // Initialize Selfie Segmentation
    if (!selfieSegmentation) {
        selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
        });
        selfieSegmentation.setOptions({
            modelSelection: 1, // landscape
        });
        selfieSegmentation.onResults(onSelfieResults);
    }

    // Initialize Gesture Recognizer
    if (!gestureRecognizer) {
        try {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
            );
            gestureRecognizer = await GestureRecognizer.createFromModelPath(
                vision,
                "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task"
            );
            await gestureRecognizer.setOptions({ runningMode: "VIDEO" });
        } catch (error) {
            console.error("Failed to initialize Gesture Recognizer:", error);
        }
    }

    statusEl.textContent = '👋 Show thumbs up, thumbs down, or stop hand';

    // Start Camera loop
    try {
        const cameraInstance = new Camera(video, {
            onFrame: async () => {
                // Run gesture recognizer
                if (gestureRecognizer) {
                    const timestamp = performance.now();
                    const result = gestureRecognizer.recognizeForVideo(video, timestamp);

                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Draw hand skeleton/connectors on canvas-overlay
                    if (result && result.landmarks && result.landmarks.length > 0) {
                        const landmarks = result.landmarks[0];
                        if (window.drawConnectors && window.drawLandmarks) {
                            window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: 'rgba(78,205,196,0.5)', lineWidth: 2 });
                            window.drawLandmarks(ctx, landmarks, { color: 'rgba(255,107,53,0.8)', lineWidth: 1, radius: 4 });
                        }
                    }

                    // Don't process gestures during countdown or for 2 seconds after a card loads
                    if (countdownActive || (performance.now() - cardLoadedTime < 2000)) {
                        currentGesture = null;
                        gestureStartTime = null;
                        hasTriggeredActiveGesture = false;
                        statusEl.textContent = '👋 Show thumbs up, thumbs down, or stop hand';
                        statusEl.classList.remove('detected');
                    } else {
                        // Classify active gesture
                        let gesture = null;
                        if (result && result.gestures && result.gestures.length > 0) {
                            for (const gestureList of result.gestures) {
                                const topGesture = gestureList[0];
                                if (topGesture && topGesture.score > 0.6) {
                                    if (topGesture.categoryName === 'Thumb_Up') {
                                        gesture = 'thumbsUp';
                                    } else if (topGesture.categoryName === 'Thumb_Down') {
                                        gesture = 'thumbsDown';
                                    } else if (topGesture.categoryName === 'Open_Palm') {
                                        gesture = 'stopHand';
                                    }
                                }
                            }
                        }

                        // Handle holds and trigger actions using the 1.5s timer
                        if (gesture === null || gesture !== currentGesture) {
                            currentGesture = gesture;
                            gestureStartTime = gesture ? performance.now() : null;
                            hasTriggeredActiveGesture = false;

                            if (!gesture) {
                                statusEl.textContent = '👋 Show thumbs up, thumbs down, or stop hand';
                                statusEl.classList.remove('detected');
                            }
                        } else if (!hasTriggeredActiveGesture) {
                            const now = performance.now();
                            const elapsed = (now - gestureStartTime) / 1000;
                            const pct = Math.min(elapsed / 1.5, 1);

                            statusEl.classList.add('detected');
                            if (gesture === 'thumbsUp') {
                                statusEl.textContent = `👍 Thumbs Up detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : '✓ LIKED!'}`;
                            } else if (gesture === 'thumbsDown') {
                                statusEl.textContent = `👎 Thumbs Down detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : '✓ NOPE!'}`;
                            } else if (gesture === 'stopHand') {
                                statusEl.textContent = `✋ Stop Hand detected ${pct < 1 ? `— hold (${elapsed.toFixed(1)}s)` : '✓ GOING BACK!'}`;
                            }

                            const cx = canvas.width * 0.5, cy = 80;
                            ctx.beginPath();
                            ctx.arc(cx, cy, 30, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
                            ctx.strokeStyle = gesture === 'thumbsUp' ? '#2ecc71' : (gesture === 'thumbsDown' ? '#e74c3c' : '#00c6ff');
                            ctx.lineWidth = 4;
                            ctx.stroke();

                            if (elapsed >= 1.5) {
                                triggerGestureAction(currentGesture);
                                hasTriggeredActiveGesture = true;
                                gestureStartTime = null;
                                currentGesture = null;
                            }
                        }
                    }
                }

                // Run Selfie Segmentation
                if (selfieSegmentation) {
                    await selfieSegmentation.send({ image: video });
                }
            },
            width: 1280, height: 720
        });
        await cameraInstance.start();
    } catch (err) {
        console.warn('Camera failed:', err);
        statusEl.textContent = '⚠ Camera loop unavailable';
    }
}

// Toggle background replacement on/off
function toggleBackgroundReplacement(forceState) {
    if (typeof forceState === 'boolean') {
        showBackgroundReplacement = forceState;
    } else {
        showBackgroundReplacement = !showBackgroundReplacement;
    }
    const bgImg = document.querySelector('.bg-image');
    if (bgImg) {
        bgImg.style.display = showBackgroundReplacement ? 'block' : 'none';
    }
}

// Swap background with fade transition
function swapBackground(direction) {
    const bgImg = document.querySelector('.bg-image');
    if (!bgImg) return;

    if (!showBackgroundReplacement) {
        toggleBackgroundReplacement(true);
    }

    currentBgIndex = (currentBgIndex + direction + bgImages.length) % bgImages.length;

    bgImg.classList.add('fade-out');

    const tempImg = new Image();
    tempImg.src = bgImages[currentBgIndex];
    tempImg.onload = () => {
        bgImg.src = bgImages[currentBgIndex];
        bgImg.classList.remove('fade-out');
    };
}

function triggerGestureAction(gesture) {
    if (gesture === 'thumbsUp') {
        vote(true);
    } else if (gesture === 'thumbsDown') {
        vote(false);
    } else if (gesture === 'stopHand') {
        resetApp();
    }
}

// ────────────────────────────────────────────────
// DRAG TO SWIPE
// ────────────────────────────────────────────────
(function setupDrag() {
    let startX = 0, isDragging = false, currentX = 0;

    const getCard = () => document.getElementById('location-card');

    function onStart(e) {
        if (document.getElementById('done-overlay').classList.contains('visible')) return;
        if (countdownActive) return;
        isDragging = true;
        startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        getCard().classList.add('dragging');
    }
    function onMove(e) {
        if (!isDragging) return;
        currentX = (e.type === 'touchmove' ? e.touches[0].clientX : e.clientX) - startX;
        const card = getCard();
        const rotate = currentX * 0.05;
        card.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;
        const likeO = Math.max(0, currentX / 100);
        const nopeO = Math.max(0, -currentX / 100);
        document.getElementById('overlay-like').style.opacity = Math.min(likeO, 1);
        document.getElementById('overlay-nope').style.opacity = Math.min(nopeO, 1);
    }
    function onEnd() {
        if (!isDragging) return;
        isDragging = false;
        const card = getCard();
        card.classList.remove('dragging');
        if (currentX > 80) vote(true);
        else if (currentX < -80) vote(false);
        else {
            card.style.transform = '';
            document.getElementById('overlay-like').style.opacity = 0;
            document.getElementById('overlay-nope').style.opacity = 0;
        }
        currentX = 0;
    }

    document.getElementById('location-card').addEventListener('mousedown', onStart);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.getElementById('location-card').addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd);
})();

// Expose module functions globally for HTML event handlers
window.startSwipe = startSwipe;
window.vote = vote;
window.showResults = showResults;
window.resetApp = resetApp;
window.switchTab = switchTab;
window.toggleHeatmap = toggleHeatmap;
