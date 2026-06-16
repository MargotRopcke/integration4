import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { Form, Link, Links, Meta, NavLink, Outlet, Scripts, ScrollRestoration, ServerRouter, UNSAFE_withComponentProps, UNSAFE_withErrorBoundaryProps, UNSAFE_withHydrateFallbackProps, isRouteErrorResponse, redirect, useFetcher, useNavigate, useNavigation, useSearchParams, useSubmit } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
//#region \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
//#endregion
//#region node_modules/@react-router/dev/dist/config/defaults/entry.server.node.tsx
var entry_server_node_exports = /* @__PURE__ */ __exportAll({
	default: () => handleRequest,
	streamTimeout: () => streamTimeout
});
var streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
	if (request.method.toUpperCase() === "HEAD") return new Response(null, {
		status: responseStatusCode,
		headers: responseHeaders
	});
	return new Promise((resolve, reject) => {
		let shellRendered = false;
		let userAgent = request.headers.get("user-agent");
		let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
		let timeoutId = setTimeout(() => abort(), 6e3);
		const { pipe, abort } = renderToPipeableStream(/* @__PURE__ */ jsx(ServerRouter, {
			context: routerContext,
			url: request.url
		}), {
			[readyOption]() {
				shellRendered = true;
				const body = new PassThrough({ final(callback) {
					clearTimeout(timeoutId);
					timeoutId = void 0;
					callback();
				} });
				const stream = createReadableStreamFromReadable(body);
				responseHeaders.set("Content-Type", "text/html");
				pipe(body);
				resolve(new Response(stream, {
					headers: responseHeaders,
					status: responseStatusCode
				}));
			},
			onShellError(error) {
				reject(error);
			},
			onError(error) {
				responseStatusCode = 500;
				if (shellRendered) console.error(error);
			}
		});
	});
}
//#endregion
//#region app/root.jsx
var root_exports = /* @__PURE__ */ __exportAll({
	ErrorBoundary: () => ErrorBoundary,
	HydrateFallback: () => HydrateFallback,
	Layout: () => Layout,
	default: () => root_default,
	links: () => links
});
var links = () => [
	{
		rel: "preconnect",
		href: "https://fonts.googleapis.com"
	},
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous"
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Special+Elite&family=DM+Sans:wght@300;400;500;600&family=Caveat:wght@400;600&display=swap"
	},
	{
		rel: "stylesheet",
		href: "https://unpkg.com/maplibre-gl@^4.0.0/dist/maplibre-gl.css"
	}
];
function Layout({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "en",
		children: [/* @__PURE__ */ jsxs("head", { children: [
			/* @__PURE__ */ jsx("meta", { charSet: "utf-8" }),
			/* @__PURE__ */ jsx("meta", {
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			}),
			/* @__PURE__ */ jsx(Meta, {}),
			/* @__PURE__ */ jsx(Links, {}),
			/* @__PURE__ */ jsx("script", {
				src: "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("script", {
				src: "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("script", {
				src: "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
				crossOrigin: "anonymous"
			}),
			/* @__PURE__ */ jsx("script", {
				src: "https://unpkg.com/maplibre-gl@^4.0.0/dist/maplibre-gl.js",
				crossOrigin: "anonymous"
			})
		] }), /* @__PURE__ */ jsxs("body", { children: [
			children,
			/* @__PURE__ */ jsx(ScrollRestoration, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
var root_default = UNSAFE_withComponentProps(function App() {
	return /* @__PURE__ */ jsx(Outlet, {});
});
var ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary({ error }) {
	let message = "Oops!";
	let details = "An unexpected error occurred.";
	let stack;
	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? "404" : "Error";
		details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
	}
	return /* @__PURE__ */ jsxs("main", {
		style: {
			padding: "2rem",
			fontFamily: "monospace"
		},
		children: [
			/* @__PURE__ */ jsx("h1", { children: message }),
			/* @__PURE__ */ jsx("p", { children: details }),
			stack
		]
	});
});
var HydrateFallback = UNSAFE_withHydrateFallbackProps(function HydrateFallback() {
	return /* @__PURE__ */ jsxs("div", {
		id: "loading-splash",
		children: [/* @__PURE__ */ jsx("div", { id: "loading-splash-spinner" }), /* @__PURE__ */ jsx("p", { children: "Loading, please wait..." })]
	});
});
//#endregion
//#region app/routes/home.jsx
var home_exports = /* @__PURE__ */ __exportAll({ default: () => home_default });
var home_default = UNSAFE_withComponentProps(function Home() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [currentCategory, setCurrentCategory] = useState("all");
	useEffect(() => {
		const timer = setTimeout(() => setLoading(false), 900);
		return () => clearTimeout(timer);
	}, []);
	const categories = [
		{
			key: "all",
			label: "All"
		},
		{
			key: "restaurant",
			label: "🍽 Restaurants"
		},
		{
			key: "fashion",
			label: "👗 Fashion"
		},
		{
			key: "cafe",
			label: "☕ Cafés"
		},
		{
			key: "bar",
			label: "🍺 Bars"
		}
	];
	function handleStart() {
		navigate(`/swipe?category=${currentCategory}`);
	}
	const filmHoles = Array.from({ length: 22 }, (_, i) => /* @__PURE__ */ jsx("div", { className: "film-hole" }, i));
	if (loading) return /* @__PURE__ */ jsxs("div", {
		id: "loading-screen",
		children: [/* @__PURE__ */ jsx("div", { className: "loader-film" }), /* @__PURE__ */ jsx("p", { children: "developing your film…" })]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "screen intro-screen",
		children: [
			/* @__PURE__ */ jsx("div", {
				className: "film-holes top",
				children: filmHoles
			}),
			/* @__PURE__ */ jsx("div", {
				className: "film-holes bottom",
				children: filmHoles
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "intro-polaroid",
				children: [
					/* @__PURE__ */ jsxs("h1", { children: [
						"Discover",
						/* @__PURE__ */ jsx("br", {}),
						/* @__PURE__ */ jsx("span", { children: "Antwerp" })
					] }),
					/* @__PURE__ */ jsxs("p", {
						className: "sub",
						children: [
							"Swipe the city's best spots.",
							/* @__PURE__ */ jsx("br", {}),
							"👍 like · 👎 pass · we'll snap your reaction!"
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "stamp",
						style: { margin: ".5rem 0 1rem" },
						children: "est. 2025 · Belgium"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: "category-pills",
				children: categories.map((cat) => /* @__PURE__ */ jsx("div", {
					className: `pill ${currentCategory === cat.key ? "active" : ""}`,
					onClick: () => setCurrentCategory(cat.key),
					children: cat.label
				}, cat.key))
			}),
			/* @__PURE__ */ jsx("button", {
				className: "btn-primary",
				onClick: handleStart,
				children: "✦ Start Swiping"
			}),
			/* @__PURE__ */ jsx("p", {
				className: "intro-note",
				children: "grant camera access for gestures + reaction photos"
			})
		]
	});
});
//#endregion
//#region app/js/locations.js
/**
* Antwerp locations data + utility functions
*/
var LOCATIONS = [
	{
		id: 1,
		name: "The Jane",
		type: "restaurant",
		category: "restaurant",
		emoji: "⭐",
		address: "Paradeplein 1",
		lat: 51.2089,
		lng: 4.3959,
		tags: [
			"Fine Dining",
			"Iconic",
			"Belgian"
		],
		neighborhood: "Berchem",
		rating: "9.2",
		gmaps: "https://maps.google.com/?q=The+Jane+Antwerp"
	},
	{
		id: 2,
		name: "Grand Central",
		type: "restaurant",
		category: "restaurant",
		emoji: "🚂",
		address: "Koningin Astridplein 27",
		lat: 51.217,
		lng: 4.4214,
		tags: [
			"Brasserie",
			"Historic",
			"Cocktails"
		],
		neighborhood: "Centre",
		rating: "8.4",
		gmaps: "https://maps.google.com/?q=Grand+Central+Antwerp"
	},
	{
		id: 3,
		name: "Dries Van Noten",
		type: "fashion",
		category: "fashion",
		emoji: "👗",
		address: "Nationalestraat 16",
		lat: 51.2153,
		lng: 4.3996,
		tags: [
			"Luxury",
			"Belgian Designer",
			"Avant-garde"
		],
		neighborhood: "Fashion Quarter",
		rating: "9.5",
		gmaps: "https://maps.google.com/?q=Dries+Van+Noten+Antwerp"
	},
	{
		id: 4,
		name: "Café d'Anvers",
		type: "bar",
		category: "bar",
		emoji: "🎵",
		address: "Verversrui 15",
		lat: 51.2282,
		lng: 4.4013,
		tags: [
			"Nightlife",
			"Historic",
			"Electronic"
		],
		neighborhood: "Schipperskwartier",
		rating: "8.8",
		gmaps: "https://maps.google.com/?q=Cafe+d+Anvers+Antwerp"
	},
	{
		id: 5,
		name: "Graanmarkt 13",
		type: "restaurant",
		category: "restaurant",
		emoji: "🌿",
		address: "Graanmarkt 13",
		lat: 51.2183,
		lng: 4.3978,
		tags: [
			"Vegetable-forward",
			"Design",
			"Trendy"
		],
		neighborhood: "Centre",
		rating: "8.9",
		gmaps: "https://maps.google.com/?q=Graanmarkt+13+Antwerp"
	},
	{
		id: 6,
		name: "Ann Demeulemeester",
		type: "fashion",
		category: "fashion",
		emoji: "🖤",
		address: "Verlatstraat 38",
		lat: 51.21,
		lng: 4.3948,
		tags: [
			"Dark",
			"Belgian Designer",
			"Iconic"
		],
		neighborhood: "Zuid",
		rating: "9.1",
		gmaps: "https://maps.google.com/?q=Ann+Demeulemeester+Antwerp"
	},
	{
		id: 7,
		name: "Bouchery",
		type: "restaurant",
		category: "restaurant",
		emoji: "🥩",
		address: "Dambruggestraat 23",
		lat: 51.2145,
		lng: 4.42,
		tags: [
			"Sustainable",
			"Farm-to-Table",
			"Creative"
		],
		neighborhood: "Borgerhout",
		rating: "8.6",
		gmaps: "https://maps.google.com/?q=Bouchery+Antwerp"
	},
	{
		id: 8,
		name: "Normo Espresso",
		type: "cafe",
		category: "cafe",
		emoji: "☕",
		address: "Kammenstraat 13",
		lat: 51.2181,
		lng: 4.4026,
		tags: [
			"Specialty Coffee",
			"Minimal",
			"Third Wave"
		],
		neighborhood: "Centre",
		rating: "8.3",
		gmaps: "https://maps.google.com/?q=Normo+Espresso+Antwerp"
	},
	{
		id: 9,
		name: "Essentiel Antwerp",
		type: "fashion",
		category: "fashion",
		emoji: "✨",
		address: "Nationalestraat 12",
		lat: 51.2155,
		lng: 4.3993,
		tags: [
			"Colourful",
			"Belgian",
			"Contemporary"
		],
		neighborhood: "Fashion Quarter",
		rating: "8.7",
		gmaps: "https://maps.google.com/?q=Essentiel+Antwerp"
	},
	{
		id: 10,
		name: "Bar Paniek",
		type: "bar",
		category: "bar",
		emoji: "🍺",
		address: "Oudevaartplaats 12",
		lat: 51.222,
		lng: 4.4052,
		tags: [
			"Craft Beer",
			"Belgian",
			"Cozy"
		],
		neighborhood: "Centre",
		rating: "8.5",
		gmaps: "https://maps.google.com/?q=Bar+Paniek+Antwerp"
	},
	{
		id: 11,
		name: "Fiskebar",
		type: "restaurant",
		category: "restaurant",
		emoji: "🐟",
		address: "Marnixplaats 17",
		lat: 51.2197,
		lng: 4.3962,
		tags: [
			"Seafood",
			"Nordic",
			"Sustainable"
		],
		neighborhood: "Centre",
		rating: "8.8",
		gmaps: "https://maps.google.com/?q=Fiskebar+Antwerp"
	},
	{
		id: 12,
		name: "Louis Vuitton MAS",
		type: "fashion",
		category: "fashion",
		emoji: "👜",
		address: "Meir 34",
		lat: 51.2194,
		lng: 4.4081,
		tags: [
			"Luxury",
			"Flagship",
			"Iconic"
		],
		neighborhood: "Meir",
		rating: "8.0",
		gmaps: "https://maps.google.com/?q=Louis+Vuitton+Antwerp"
	},
	{
		id: 13,
		name: "Bocca Negra",
		type: "cafe",
		category: "cafe",
		emoji: "🫖",
		address: "Falconrui 13",
		lat: 51.2235,
		lng: 4.4025,
		tags: [
			"Art Nouveau",
			"Historic",
			"Hot Chocolate"
		],
		neighborhood: "Centre",
		rating: "8.6",
		gmaps: "https://maps.google.com/?q=Bocca+Negra+Antwerp"
	},
	{
		id: 14,
		name: "Zeppelin",
		type: "bar",
		category: "bar",
		emoji: "🎸",
		address: "Sint-Pietersvliet 20",
		lat: 51.2271,
		lng: 4.4008,
		tags: [
			"Rock",
			"Local",
			"Live Music"
		],
		neighborhood: "Eilandje",
		rating: "8.2",
		gmaps: "https://maps.google.com/?q=Zeppelin+Bar+Antwerp"
	},
	{
		id: 15,
		name: "Walter Van Beirendonck",
		type: "fashion",
		category: "fashion",
		emoji: "🦄",
		address: "Sint-Antoniusstraat 12",
		lat: 51.2147,
		lng: 4.398,
		tags: [
			"Avant-garde",
			"Surreal",
			"Iconic"
		],
		neighborhood: "Fashion Quarter",
		rating: "9.3",
		gmaps: "https://maps.google.com/?q=Walter+Van+Beirendonck+Antwerp"
	}
];
var HEATMAP_POINTS = [
	[
		51.2194,
		4.4082,
		.95
	],
	[
		51.2183,
		4.405,
		.9
	],
	[
		51.22,
		4.406,
		.88
	],
	[
		51.2175,
		4.402,
		.85
	],
	[
		51.221,
		4.403,
		.82
	],
	[
		51.2153,
		4.3996,
		.78
	],
	[
		51.216,
		4.401,
		.75
	],
	[
		51.2145,
		4.4,
		.7
	],
	[
		51.2202,
		4.4003,
		.88
	],
	[
		51.2195,
		4.399,
		.85
	],
	[
		51.212,
		4.397,
		.65
	],
	[
		51.21,
		4.395,
		.62
	],
	[
		51.2135,
		4.3975,
		.68
	],
	[
		51.2285,
		4.4045,
		.72
	],
	[
		51.2295,
		4.403,
		.68
	],
	[
		51.227,
		4.4038,
		.7
	],
	[
		51.2258,
		4.4015,
		.75
	],
	[
		51.227,
		4.4,
		.72
	],
	[
		51.2175,
		4.4215,
		.92
	],
	[
		51.2165,
		4.42,
		.88
	],
	[
		51.218,
		4.4205,
		.9
	],
	[
		51.214,
		4.4175,
		.55
	],
	[
		51.215,
		4.4185,
		.52
	],
	[
		51.2092,
		4.396,
		.6
	],
	[
		51.208,
		4.397,
		.58
	]
];
var BUSY_LEVELS = [
	"quiet",
	"moderate",
	"busy",
	"very busy"
];
function getBusy(loc) {
	return BUSY_LEVELS[(loc.id * 7 + 3) % 4];
}
function getWalkMin(loc) {
	return 5 + (loc.id * 3 + 1) % 18;
}
function buildDeck(category) {
	const all = category === "all" ? [...LOCATIONS] : LOCATIONS.filter((l) => l.category === category);
	for (let i = all.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[all[i], all[j]] = [all[j], all[i]];
	}
	return all;
}
//#endregion
//#region app/js/gestures.js
/**
* Gesture classification from MediaPipe hand landmarks.
*/
function classifyGesture(lm) {
	const fingerExtended = (tip, base) => lm[tip].y < lm[base].y;
	const fingersClosed = !fingerExtended(8, 6) && !fingerExtended(12, 10) && !fingerExtended(16, 14) && !fingerExtended(20, 18);
	const thumbTip = lm[4];
	const thumbMcp = lm[2];
	const wrist = lm[0];
	if (fingersClosed && thumbTip.y < wrist.y - .1 && thumbTip.y < thumbMcp.y) return "thumbsUp";
	if (fingersClosed && thumbTip.y > wrist.y + .05 && thumbTip.y > thumbMcp.y) return "thumbsDown";
	return null;
}
var cameraReady = false;
var gestureHoldCount = 0;
var lastGesture = null;
function capturePhoto(video, captureCanvas, locationName, locationEmoji) {
	if (!video || !cameraReady) return null;
	captureCanvas.width = video.videoWidth || 640;
	captureCanvas.height = video.videoHeight || 480;
	captureCanvas.getContext("2d").drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
	return {
		dataUrl: captureCanvas.toDataURL("image/jpeg", .82),
		locationName,
		locationEmoji
	};
}
async function initCamera(video, canvas, callbacks) {
	const ctx = canvas.getContext("2d");
	function resizeCanvas() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	resizeCanvas();
	window.addEventListener("resize", resizeCanvas);
	try {
		video.srcObject = await navigator.mediaDevices.getUserMedia({ video: {
			facingMode: "user",
			width: 1280,
			height: 720
		} });
		cameraReady = true;
		callbacks.onHandStatus("🤖 loading hand tracking…", false);
	} catch (e) {
		callbacks.onHandStatus("📵 no camera — use buttons below", false);
		return false;
	}
	try {
		if (typeof window.Hands === "undefined") throw new Error("MediaPipe Hands not loaded");
		const hands = new window.Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
		hands.setOptions({
			maxNumHands: 1,
			modelComplexity: 1,
			minDetectionConfidence: .7,
			minTrackingConfidence: .6
		});
		hands.onResults((res) => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			if (!res.multiHandLandmarks?.length) {
				gestureHoldCount = 0;
				lastGesture = null;
				callbacks.onHandStatus("✋ show your hand", false);
				return;
			}
			const lm = res.multiHandLandmarks[0];
			if (window.drawConnectors) window.drawConnectors(ctx, lm, window.HAND_CONNECTIONS, {
				color: "rgba(201,151,42,.5)",
				lineWidth: 2
			});
			if (window.drawLandmarks) window.drawLandmarks(ctx, lm, {
				color: "rgba(200,57,43,.8)",
				lineWidth: 1,
				radius: 3
			});
			if (callbacks.isCountdownActive()) return;
			const g = classifyGesture(lm);
			if (g) {
				if (g === lastGesture) {
					gestureHoldCount++;
					if (gestureHoldCount === 12) {
						callbacks.onGestureTriggered(g);
						gestureHoldCount = 0;
						lastGesture = null;
						return;
					}
				} else {
					lastGesture = g;
					gestureHoldCount = 1;
				}
				const pct = Math.min(gestureHoldCount / 12, 1);
				callbacks.onGestureProgress(g, pct);
				const cx = canvas.width * .5;
				const cy = 72;
				ctx.beginPath();
				ctx.arc(cx, cy, 26, -Math.PI / 2, -Math.PI / 2 + pct * 2 * Math.PI);
				ctx.strokeStyle = g === "thumbsUp" ? "#2d6a4f" : "#c8392b";
				ctx.lineWidth = 3.5;
				ctx.stroke();
			} else {
				gestureHoldCount = 0;
				lastGesture = null;
				callbacks.onHandStatus("👋 thumbs up or down", false);
			}
		});
		await new window.Camera(video, {
			onFrame: async () => await hands.send({ image: video }),
			width: 1280,
			height: 720
		}).start();
		callbacks.onHandStatus("👋 show thumbs up or down", false);
	} catch (e) {
		console.warn("Hand tracking unavailable:", e);
		callbacks.onHandStatus("⚠ tracking unavailable — use buttons", false);
		return true;
	}
	return true;
}
function resetCamera() {
	cameraReady = false;
	gestureHoldCount = 0;
	lastGesture = null;
}
//#endregion
//#region app/routes/swipe.jsx
var swipe_exports = /* @__PURE__ */ __exportAll({ default: () => swipe_default });
var swipe_default = UNSAFE_withComponentProps(function Swipe() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const category = searchParams.get("category") || "all";
	const [deck, setDeck] = useState([]);
	const [deckIndex, setDeckIndex] = useState(0);
	const [likedLocations, setLikedLocations] = useState([]);
	const [reactionPhotos, setReactionPhotos] = useState([]);
	const [handStatus, setHandStatus] = useState("📷 camera loading…");
	const [handDetected, setHandDetected] = useState(false);
	const [countdownActive, setCountdownActive] = useState(false);
	const [countdownVal, setCountdownVal] = useState("3");
	const [showFlash, setShowFlash] = useState(false);
	const [showDone, setShowDone] = useState(false);
	const [swipeClass, setSwipeClass] = useState("");
	const [heartPulse, setHeartPulse] = useState(false);
	const [dragStyle, setDragStyle] = useState({});
	const [likeOpacity, setLikeOpacity] = useState(0);
	const [nopeOpacity, setNopeOpacity] = useState(0);
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const captureCanvasRef = useRef(null);
	const cardRef = useRef(null);
	const isDraggingRef = useRef(false);
	const startXRef = useRef(0);
	const countdownActiveRef = useRef(false);
	const deckRef = useRef([]);
	const deckIndexRef = useRef(0);
	const likedLocationsRef = useRef([]);
	const reactionPhotosRef = useRef([]);
	useEffect(() => {
		deckRef.current = deck;
		deckIndexRef.current = deckIndex;
		likedLocationsRef.current = likedLocations;
		reactionPhotosRef.current = reactionPhotos;
	}, [
		deck,
		deckIndex,
		likedLocations,
		reactionPhotos
	]);
	useEffect(() => {
		sessionStorage.removeItem("likedLocations");
		sessionStorage.removeItem("reactionPhotos");
		setDeck(buildDeck(category));
		const video = videoRef.current;
		const canvas = canvasRef.current;
		let active = true;
		if (video && canvas) initCamera(video, canvas, {
			onHandStatus: (text, isDetected) => {
				if (!active) return;
				setHandStatus(text);
				setHandDetected(isDetected);
			},
			isCountdownActive: () => countdownActiveRef.current,
			onGestureTriggered: (gesture) => {
				if (!active) return;
				handleVote(gesture === "thumbsUp");
			},
			onGestureProgress: (gesture, pct) => {
				if (!active) return;
				setHandStatus(gesture === "thumbsUp" ? `👍 thumbs up ${pct < 1 ? "— hold…" : "→ liked!"}` : `👎 thumbs down ${pct < 1 ? "— hold…" : "→ nope!"}`);
				setHandDetected(true);
			}
		});
		return () => {
			active = false;
			resetCamera();
		};
	}, [category]);
	useEffect(() => {
		function onMouseMove(e) {
			if (!isDraggingRef.current) return;
			const currentX = (e.type === "touchmove" ? e.touches[0].clientX : e.clientX) - startXRef.current;
			setDragStyle({ transform: `translateX(${currentX}px) rotate(${currentX * .05}deg)` });
			setLikeOpacity(Math.min(Math.max(0, currentX / 100), 1));
			setNopeOpacity(Math.min(Math.max(0, -currentX / 100), 1));
		}
		function onMouseUp() {
			if (!isDraggingRef.current) return;
			isDraggingRef.current = false;
			const match = (cardRef.current?.style.transform || "").match(/translateX\(([-]?\d+(?:\.\d+)?)/);
			const x = match ? parseFloat(match[1]) : 0;
			if (x > 80) handleVote(true);
			else if (x < -80) handleVote(false);
			else {
				setDragStyle({});
				setLikeOpacity(0);
				setNopeOpacity(0);
			}
		}
		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", onMouseUp);
		document.addEventListener("touchmove", onMouseMove, { passive: true });
		document.addEventListener("touchend", onMouseUp);
		return () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", onMouseUp);
			document.removeEventListener("touchmove", onMouseMove);
			document.removeEventListener("touchend", onMouseUp);
		};
	}, [
		deck,
		deckIndex,
		likedLocations
	]);
	function handleVote(liked) {
		if (deckIndexRef.current >= deckRef.current.length || countdownActiveRef.current) return;
		if (!liked) {
			commitVote(false);
			return;
		}
		if (likedLocationsRef.current.length >= 6) {
			setHeartPulse(true);
			setTimeout(() => setHeartPulse(false), 400);
			return;
		}
		countdownActiveRef.current = true;
		setCountdownActive(true);
		const steps = [
			"3",
			"2",
			"1",
			"📸 Say Cheese!"
		];
		let step = 0;
		function nextStep() {
			if (step >= steps.length) {
				setCountdownActive(false);
				countdownActiveRef.current = false;
				setShowFlash(true);
				setTimeout(() => setShowFlash(false), 220);
				const curIndex = deckIndexRef.current;
				const curDeck = deckRef.current;
				const photo = capturePhoto(videoRef.current, captureCanvasRef.current, curDeck[curIndex].name, curDeck[curIndex].emoji);
				if (photo) {
					const updatedPhotos = [...reactionPhotosRef.current, photo];
					setReactionPhotos(updatedPhotos);
					sessionStorage.setItem("reactionPhotos", JSON.stringify(updatedPhotos));
				}
				commitVote(true);
				return;
			}
			setCountdownVal(steps[step]);
			step++;
			setTimeout(nextStep, step === 4 ? 950 : 820);
		}
		nextStep();
	}
	function commitVote(liked) {
		setSwipeClass(liked ? "swipe-right" : "swipe-left");
		const curIndex = deckIndexRef.current;
		const curDeck = deckRef.current;
		let updatedLikes = [...likedLocationsRef.current];
		if (liked) {
			updatedLikes.push(curDeck[curIndex]);
			setLikedLocations(updatedLikes);
			sessionStorage.setItem("likedLocations", JSON.stringify(updatedLikes));
		}
		setTimeout(() => {
			const nextIndex = curIndex + 1;
			setDeckIndex(nextIndex);
			setSwipeClass("");
			setDragStyle({});
			setLikeOpacity(0);
			setNopeOpacity(0);
			if (nextIndex >= curDeck.length || updatedLikes.length >= 6) setShowDone(true);
		}, 370);
	}
	function handleDragStart(e) {
		if (showDone || countdownActiveRef.current) return;
		isDraggingRef.current = true;
		startXRef.current = e.type === "touchstart" ? e.touches[0].clientX : e.clientX;
	}
	function handleReset() {
		sessionStorage.removeItem("likedLocations");
		sessionStorage.removeItem("reactionPhotos");
		resetCamera();
		navigate("/");
	}
	function handleResults() {
		navigate("/results");
	}
	const currentLoc = deck[deckIndex];
	return /* @__PURE__ */ jsxs("div", {
		className: "screen active",
		id: "swipe",
		children: [
			/* @__PURE__ */ jsx("video", {
				ref: videoRef,
				id: "video-bg",
				autoPlay: true,
				playsInline: true,
				muted: true
			}),
			/* @__PURE__ */ jsx("canvas", {
				ref: canvasRef,
				id: "canvas-overlay"
			}),
			/* @__PURE__ */ jsx("canvas", {
				ref: captureCanvasRef,
				id: "capture-canvas"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "swipe-ui",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "top-bar",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "logo",
								children: ["ant", /* @__PURE__ */ jsx("span", { children: "werp" })]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: `likes-counter ${heartPulse ? "heart-pulse" : ""}`,
								children: [
									/* @__PURE__ */ jsx("span", {
										className: "heart",
										id: "heart-icon",
										children: "♥"
									}),
									/* @__PURE__ */ jsx("span", {
										id: "likes-count",
										children: likedLocations.length
									}),
									" / 6"
								]
							}),
							/* @__PURE__ */ jsx("div", {
								className: "category-badge",
								id: "cat-badge",
								children: category === "all" ? "All Spots" : category.charAt(0).toUpperCase() + category.slice(1) + "s"
							})
						]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "progress-film",
						id: "progress-film",
						children: deck.map((_, i) => /* @__PURE__ */ jsx("div", { className: `film-frame ${i < deckIndex ? "done" : ""}` }, i))
					}),
					/* @__PURE__ */ jsx("div", {
						className: `gesture-status ${handDetected ? "detected" : ""}`,
						id: "gesture-status",
						children: handStatus
					}),
					/* @__PURE__ */ jsx("div", {
						className: "card-area",
						children: currentLoc && /* @__PURE__ */ jsxs("div", {
							ref: cardRef,
							className: `location-card ${swipeClass}`,
							id: "location-card",
							style: dragStyle,
							onMouseDown: handleDragStart,
							onTouchStart: handleDragStart,
							children: [
								/* @__PURE__ */ jsxs("div", {
									className: "card-inner",
									children: [/* @__PURE__ */ jsx("div", {
										className: "card-image",
										id: "card-image",
										children: currentLoc.emoji
									}), /* @__PURE__ */ jsxs("div", {
										className: "card-body",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "card-type",
												id: "card-type",
												children: [
													currentLoc.type,
													" · ",
													currentLoc.neighborhood
												]
											}),
											/* @__PURE__ */ jsx("div", {
												className: "card-name",
												id: "card-name",
												children: currentLoc.name
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "card-meta",
												id: "card-meta",
												children: [
													"📍 ",
													currentLoc.address,
													" ⭐ ",
													currentLoc.rating
												]
											}),
											/* @__PURE__ */ jsx("div", {
												className: "card-tags",
												id: "card-tags",
												children: currentLoc.tags.map((tag, i) => /* @__PURE__ */ jsx("span", {
													className: "tag",
													children: tag
												}, i))
											})
										]
									})]
								}),
								/* @__PURE__ */ jsx("div", {
									className: "card-vote-overlay like",
									id: "overlay-like",
									style: { opacity: likeOpacity },
									children: "keeper!"
								}),
								/* @__PURE__ */ jsx("div", {
									className: "card-vote-overlay nope",
									id: "overlay-nope",
									style: { opacity: nopeOpacity },
									children: "nope"
								})
							]
						})
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "gesture-indicator",
						children: [/* @__PURE__ */ jsx("button", {
							className: "gesture-btn dislike",
							id: "btn-dislike",
							onClick: () => handleVote(false),
							title: "Pass",
							children: "👎"
						}), /* @__PURE__ */ jsx("button", {
							className: "gesture-btn like",
							id: "btn-like",
							onClick: () => handleVote(true),
							title: "Like",
							children: "👍"
						})]
					}),
					/* @__PURE__ */ jsx("div", {
						className: "no-camera-notice",
						id: "no-camera-notice",
						children: "no camera — use buttons below"
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: `done-overlay ${showDone ? "visible" : ""}`,
				id: "done-overlay",
				children: [
					/* @__PURE__ */ jsx("div", {
						className: "done-emoji",
						children: "🎞"
					}),
					/* @__PURE__ */ jsx("h2", { children: "Roll complete!" }),
					/* @__PURE__ */ jsxs("p", { children: [
						"You loved ",
						/* @__PURE__ */ jsx("strong", {
							id: "done-likes",
							children: likedLocations.length
						}),
						" spots. Time to develop the film."
					] }),
					/* @__PURE__ */ jsx("button", {
						className: "btn-primary",
						onClick: handleResults,
						children: "See my picks →"
					}),
					/* @__PURE__ */ jsx("button", {
						className: "btn-back",
						onClick: handleReset,
						children: "↩ reshoot"
					})
				]
			}),
			/* @__PURE__ */ jsx("div", {
				className: `countdown-overlay-container ${countdownActive ? "visible" : ""}`,
				id: "countdown-overlay",
				children: /* @__PURE__ */ jsx("div", {
					className: `countdown-number ${countdownVal.includes("Cheese") ? "cheese" : ""}`,
					children: countdownVal
				})
			}),
			/* @__PURE__ */ jsx("div", {
				className: `flash-overlay-container ${showFlash ? "flash" : ""}`,
				id: "flash-overlay"
			})
		]
	});
});
//#endregion
//#region app/routes/results.jsx
var results_exports = /* @__PURE__ */ __exportAll({ default: () => results_default });
var results_default = UNSAFE_withComponentProps(function Results() {
	const navigate = useNavigate();
	const [likedLocations, setLikedLocations] = useState([]);
	const [reactionPhotos, setReactionPhotos] = useState([]);
	const [activeIdx, setActiveIdx] = useState(0);
	const [heatmapOn, setHeatmapOn] = useState(false);
	const [photosOpen, setPhotosOpen] = useState(false);
	const mapContainerRef = useRef(null);
	const mapInstanceRef = useRef(null);
	const markersRef = useRef([]);
	const sheetTrackRef = useRef(null);
	const isScrollingRef = useRef(false);
	useEffect(() => {
		const storedLikes = JSON.parse(sessionStorage.getItem("likedLocations") || "[]");
		const storedPhotos = JSON.parse(sessionStorage.getItem("reactionPhotos") || "[]");
		setLikedLocations(storedLikes);
		setReactionPhotos(storedPhotos);
	}, []);
	useEffect(() => {
		if (likedLocations.length === 0) return;
		if (mapInstanceRef.current) return;
		const map = new window.maplibregl.Map({
			container: mapContainerRef.current,
			style: {
				version: 8,
				sources: { osm: {
					type: "raster",
					tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
					tileSize: 256,
					attribution: "© OpenStreetMap"
				} },
				layers: [{
					id: "osm",
					type: "raster",
					source: "osm"
				}]
			},
			center: [4.4025, 51.2194],
			zoom: 13
		});
		mapInstanceRef.current = map;
		map.on("load", () => {
			markersRef.current.forEach((m) => m.remove());
			markersRef.current = [];
			const bounds = likedLocations.reduce((b, l) => b.extend([l.lng, l.lat]), new window.maplibregl.LngLatBounds([likedLocations[0].lng, likedLocations[0].lat], [likedLocations[0].lng, likedLocations[0].lat]));
			likedLocations.forEach((loc, i) => {
				const wrap = document.createElement("div");
				wrap.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:center;";
				const photo = reactionPhotos[i];
				const bubble = document.createElement("div");
				bubble.className = `pin-photo-bubble ${photo ? "show" : ""}`;
				if (photo) {
					const img = document.createElement("img");
					img.src = photo.dataUrl;
					bubble.appendChild(img);
				}
				const pin = document.createElement("div");
				pin.className = `map-pin ${i === 0 ? "active-pin" : ""}`;
				const inner = document.createElement("div");
				inner.className = "map-pin-inner";
				inner.textContent = loc.emoji;
				pin.appendChild(inner);
				wrap.appendChild(bubble);
				wrap.appendChild(pin);
				pin.addEventListener("click", () => {
					handleFocusCard(i);
				});
				const marker = new window.maplibregl.Marker({
					element: wrap,
					anchor: "bottom"
				}).setLngLat([loc.lng, loc.lat]).addTo(map);
				markersRef.current.push(marker);
			});
			map.fitBounds(bounds, {
				padding: {
					top: 140,
					bottom: 250,
					left: 40,
					right: 40
				},
				maxZoom: 15
			});
			map.addSource("hs", {
				type: "geojson",
				data: {
					type: "FeatureCollection",
					features: HEATMAP_POINTS.map(([lat, lng, w]) => ({
						type: "Feature",
						properties: { weight: w },
						geometry: {
							type: "Point",
							coordinates: [lng, lat]
						}
					}))
				}
			});
			map.addLayer({
				id: "hl",
				type: "heatmap",
				source: "hs",
				layout: { visibility: "none" },
				paint: {
					"heatmap-weight": ["get", "weight"],
					"heatmap-intensity": 1.2,
					"heatmap-radius": 50,
					"heatmap-opacity": .72,
					"heatmap-color": [
						"interpolate",
						["linear"],
						["heatmap-density"],
						0,
						"rgba(0,0,0,0)",
						.1,
						"#00f5ff",
						.3,
						"#00ff88",
						.55,
						"#ffff00",
						.8,
						"#ff8800",
						1,
						"#ff0000"
					]
				}
			});
		});
		return () => {
			if (mapInstanceRef.current) {
				mapInstanceRef.current.remove();
				mapInstanceRef.current = null;
			}
		};
	}, [likedLocations, reactionPhotos]);
	function handleFocusCard(idx) {
		isScrollingRef.current = true;
		setActiveIdx(idx);
		const track = sheetTrackRef.current;
		if (track) track.scrollTo({
			left: idx * track.clientWidth,
			behavior: "smooth"
		});
		const loc = likedLocations[idx];
		const map = mapInstanceRef.current;
		if (map && loc) {
			map.flyTo({
				center: [loc.lng, loc.lat],
				zoom: 15,
				duration: 500
			});
			highlightPin(idx);
		}
		setTimeout(() => {
			isScrollingRef.current = false;
		}, 600);
	}
	function handleTrackScroll() {
		if (isScrollingRef.current) return;
		const track = sheetTrackRef.current;
		const map = mapInstanceRef.current;
		if (!track) return;
		const w = track.clientWidth;
		const idx = Math.round(track.scrollLeft / w);
		if (idx !== activeIdx && idx >= 0 && idx < likedLocations.length) {
			setActiveIdx(idx);
			const loc = likedLocations[idx];
			if (map && loc) {
				map.flyTo({
					center: [loc.lng, loc.lat],
					zoom: 15,
					duration: 600
				});
				highlightPin(idx);
			}
		}
	}
	function highlightPin(activeIdx) {
		markersRef.current.forEach((m, i) => {
			const pin = m.getElement().querySelector(".map-pin");
			if (pin) pin.classList.toggle("active-pin", i === activeIdx);
		});
	}
	function toggleHeatmap() {
		const map = mapInstanceRef.current;
		if (!map) return;
		const nextVal = !heatmapOn;
		setHeatmapOn(nextVal);
		map.setLayoutProperty("hl", "visibility", nextVal ? "visible" : "none");
	}
	function handleReset() {
		sessionStorage.removeItem("likedLocations");
		sessionStorage.removeItem("reactionPhotos");
		navigate("/");
	}
	const gmapsDirUrl = `https://www.google.com/maps/dir/${likedLocations.map((l) => encodeURIComponent(`${l.name}, ${l.address}, Antwerp`)).join("/")}`;
	const dateStr = (() => {
		const d = /* @__PURE__ */ new Date();
		return [
			String(d.getDate()).padStart(2, "0"),
			String(d.getMonth() + 1).padStart(2, "0"),
			String(d.getFullYear()).slice(-2)
		].join(".");
	})();
	if (likedLocations.length === 0) return /* @__PURE__ */ jsxs("div", {
		className: "screen active",
		style: {
			flexDirection: "column",
			justifyContent: "center",
			alignItems: "center",
			gap: "1.5rem",
			padding: "2rem",
			textAlign: "center"
		},
		children: [
			/* @__PURE__ */ jsx("div", {
				style: { fontSize: "3rem" },
				children: "🗺"
			}),
			/* @__PURE__ */ jsx("h2", { children: "No spots saved yet!" }),
			/* @__PURE__ */ jsx("p", { children: "Go back and swipe some spots to view your Antwerp map." }),
			/* @__PURE__ */ jsx("button", {
				className: "btn-primary",
				onClick: () => navigate("/"),
				children: "Start Swiping"
			})
		]
	});
	return /* @__PURE__ */ jsxs("div", {
		className: "screen active",
		id: "results",
		children: [
			/* @__PURE__ */ jsx("div", {
				ref: mapContainerRef,
				id: "results-map"
			}),
			/* @__PURE__ */ jsx("button", {
				className: "btn-back",
				onClick: handleReset,
				title: "Back",
				children: "←"
			}),
			/* @__PURE__ */ jsx("button", {
				id: "photos-fab",
				onClick: () => setPhotosOpen(true),
				style: {
					position: "absolute",
					top: "1rem",
					right: "1rem",
					zIndex: 30,
					width: "36px",
					height: "36px",
					borderRadius: "50%",
					background: "rgba(250, 247, 240, .92)",
					border: "1px solid rgba(26,18,8,.15)",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontSize: "1rem",
					cursor: "pointer",
					backdropFilter: "blur(8px)",
					boxShadow: "0 2px 6px rgba(26,18,8,.12)"
				},
				title: "Reaction photos",
				children: "📸"
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "map-topbar",
				children: [/* @__PURE__ */ jsx("div", {
					className: "map-topbar-row",
					children: /* @__PURE__ */ jsxs("div", {
						className: "map-title-pill",
						children: [/* @__PURE__ */ jsxs("svg", {
							width: "14",
							height: "14",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							children: [/* @__PURE__ */ jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }), /* @__PURE__ */ jsx("circle", {
								cx: "12",
								cy: "10",
								r: "3"
							})]
						}), /* @__PURE__ */ jsxs("span", {
							id: "results-subtitle",
							children: [
								"your ",
								likedLocations.length,
								" favourite spot",
								likedLocations.length !== 1 ? "s" : ""
							]
						})]
					})
				}), /* @__PURE__ */ jsxs("div", {
					className: "map-topbar-row",
					children: [/* @__PURE__ */ jsxs("a", {
						id: "gmaps-link",
						className: "btn-maps",
						href: gmapsDirUrl,
						target: "_blank",
						rel: "noopener noreferrer",
						children: [/* @__PURE__ */ jsxs("svg", {
							width: "14",
							height: "14",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "currentColor",
							strokeWidth: "2.5",
							children: [/* @__PURE__ */ jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }), /* @__PURE__ */ jsx("circle", {
								cx: "12",
								cy: "10",
								r: "3"
							})]
						}), "Open all in Google Maps"]
					}), /* @__PURE__ */ jsx("button", {
						className: `btn-heatmap ${heatmapOn ? "on" : ""}`,
						id: "heatmap-btn",
						onClick: toggleHeatmap,
						children: heatmapOn ? "🔥 Hide" : "🔥 Heatmap"
					})]
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: `heatmap-legend ${heatmapOn ? "visible" : ""}`,
				id: "heatmap-legend",
				children: [
					/* @__PURE__ */ jsx("h4", { children: "busyness — Antwerp (simulated friday evening)" }),
					/* @__PURE__ */ jsx("div", { className: "heatmap-gradient" }),
					/* @__PURE__ */ jsxs("div", {
						className: "heatmap-labels",
						children: [
							/* @__PURE__ */ jsx("span", { children: "quiet" }),
							/* @__PURE__ */ jsx("span", { children: "moderate" }),
							/* @__PURE__ */ jsx("span", { children: "very busy" })
						]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "heatmap-note",
						children: "⚠ simulated — real-time requires Google Maps Platform."
					})
				]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "map-bottom-sheet",
				children: [/* @__PURE__ */ jsx("div", {
					className: "sheet-dots",
					id: "sheet-dots",
					children: likedLocations.map((_, i) => /* @__PURE__ */ jsx("div", {
						className: `sheet-dot ${i === activeIdx ? "active" : ""}`,
						onClick: () => handleFocusCard(i)
					}, i))
				}), /* @__PURE__ */ jsx("div", {
					className: "sheet-track-wrap",
					children: /* @__PURE__ */ jsx("div", {
						ref: sheetTrackRef,
						className: "sheet-track",
						id: "sheet-track",
						onScroll: handleTrackScroll,
						children: likedLocations.map((loc, i) => {
							const busy = getBusy(loc);
							const walk = getWalkMin(loc);
							const isBusy = busy === "busy" || busy === "very busy";
							const photo = reactionPhotos[i];
							const placeUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loc.name}, ${loc.address}, Antwerp`)}`;
							return /* @__PURE__ */ jsxs("div", {
								className: "sheet-card",
								onClick: () => handleFocusCard(i),
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "sheet-card-img",
										children: [/* @__PURE__ */ jsx("span", {
											style: {
												position: "relative",
												zIndex: 1
											},
											children: loc.emoji
										}), photo && /* @__PURE__ */ jsx("div", {
											className: "sheet-card-photo",
											children: /* @__PURE__ */ jsx("img", {
												src: photo.dataUrl,
												alt: "reaction"
											})
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "sheet-card-body",
										children: [
											/* @__PURE__ */ jsxs("div", {
												className: "sheet-card-type",
												children: [
													loc.type,
													" · ",
													loc.neighborhood
												]
											}),
											/* @__PURE__ */ jsx("div", {
												className: "sheet-card-name",
												children: loc.name
											}),
											/* @__PURE__ */ jsxs("div", {
												className: "sheet-card-address",
												children: ["📍 ", loc.address]
											})
										]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "sheet-card-footer",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "sheet-card-pills",
											children: [/* @__PURE__ */ jsxs("div", {
												className: "sheet-pill",
												children: [
													"🚶 ",
													walk,
													" min"
												]
											}), /* @__PURE__ */ jsxs("div", {
												className: `sheet-pill ${isBusy ? "busy" : "quiet"}`,
												children: [/* @__PURE__ */ jsx("span", { className: "busy-dot" }), busy.charAt(0).toUpperCase() + busy.slice(1)]
											})]
										}), /* @__PURE__ */ jsx("a", {
											className: "sheet-gmaps-btn",
											href: placeUrl,
											target: "_blank",
											rel: "noopener noreferrer",
											onClick: (e) => e.stopPropagation(),
											title: "Open in Google Maps",
											children: "→"
										})]
									})
								]
							}, loc.id);
						})
					})
				})]
			}),
			/* @__PURE__ */ jsxs("div", {
				className: `photos-overlay ${photosOpen ? "visible" : ""}`,
				id: "photos-overlay",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "photos-overlay-header",
					children: [/* @__PURE__ */ jsx("h2", { children: "📸 reaction roll" }), /* @__PURE__ */ jsx("button", {
						className: "photos-close",
						onClick: () => setPhotosOpen(false),
						children: "✕"
					})]
				}), /* @__PURE__ */ jsxs("div", {
					id: "photos-tab-inner",
					children: [/* @__PURE__ */ jsx("div", {
						className: "photos-section-title",
						children: "your reaction shots"
					}), /* @__PURE__ */ jsx("div", {
						id: "photos-grid-container",
						children: reactionPhotos.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "no-photos-msg",
							children: "no shots taken — camera access was needed."
						}) : /* @__PURE__ */ jsx("div", {
							className: "photos-grid",
							children: reactionPhotos.map((photo, index) => /* @__PURE__ */ jsxs("div", {
								className: "photo-cell",
								children: [
									/* @__PURE__ */ jsxs("div", {
										className: "photo-cell-img-wrap",
										children: [/* @__PURE__ */ jsx("img", {
											src: photo.dataUrl,
											alt: `Reaction to ${photo.locationName}`
										}), /* @__PURE__ */ jsx("div", {
											className: "photo-date-stamp",
											children: dateStr
										})]
									}),
									/* @__PURE__ */ jsxs("div", {
										className: "photo-cell-label",
										children: [/* @__PURE__ */ jsxs("div", {
											className: "photo-cell-name",
											children: [
												/* @__PURE__ */ jsx("span", { children: photo.locationEmoji }),
												" ",
												photo.locationName
											]
										}), /* @__PURE__ */ jsx("div", {
											className: "photo-cell-place",
											children: "antwerp, BE"
										})]
									}),
									/* @__PURE__ */ jsx("a", {
										className: "photo-download",
										href: photo.dataUrl,
										download: `antwerp-${photo.locationName.replace(/\s+/g, "-").toLowerCase()}.jpg`,
										title: "download",
										children: "⬇"
									})
								]
							}, index))
						})
					})]
				})]
			})
		]
	});
});
//#endregion
//#region app/data.js
var supabase = createClient(void 0, void 0);
async function getContacts(search) {
	try {
		let query = supabase.from("Contacts").select("*");
		if (search) query = query.or(`first.ilike.%${search}%,last.ilike.%${search}%`);
		query = query.order("last").order("createdAt");
		let { data, error } = await query;
		return data;
	} catch (error) {
		console.error("Error fetching contacts:", error);
		throw error;
	}
}
async function createEmptyContact() {
	try {
		const { data, error } = await supabase.from("Contacts").insert([{}]).select();
		return data[0];
	} catch (error) {
		console.error("Error adding contact:", error);
		throw error;
	}
}
async function getContact(id) {
	try {
		let { data, error } = await supabase.from("Contacts").select("*").eq("id", id);
		if (!error) {
			if (data.length === 0) return null;
			return data;
		} else console.log(" get contact err", error);
	} catch (error) {
		console.error("Error fetching contact", error);
		throw error;
	}
}
async function updateContact(id, updates) {
	try {
		if (!await getContact(id)) throw "Not found";
		const { data, error } = await supabase.from("Contacts").update(updates).eq("id", id).select();
		return data[0];
	} catch (error) {
		console.error("Error updating contact", error);
		throw error;
	}
}
async function deleteContact(id) {
	try {
		const { error } = await supabase.from("Contacts").delete().eq("id", id);
		console.log("delete error", error);
	} catch (error) {
		console.error("Error deleting contact", error);
		throw error;
	}
}
//#endregion
//#region app/layouts/sidebar.jsx
var sidebar_exports = /* @__PURE__ */ __exportAll({
	default: () => sidebar_default,
	loader: () => loader$2
});
async function loader$2({ request }) {
	const q = new URL(request.url).searchParams.get("q");
	return {
		contacts: await getContacts(q),
		q
	};
}
var sidebar_default = UNSAFE_withComponentProps(function SidebarLayout({ loaderData }) {
	const { contacts, q } = loaderData;
	const navigation = useNavigation();
	const submit = useSubmit();
	const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");
	useEffect(() => {
		const searchField = document.getElementById("q");
		if (searchField instanceof HTMLInputElement) searchField.value = q || "";
	}, [q]);
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("div", {
		id: "sidebar",
		children: [
			/* @__PURE__ */ jsx("h1", { children: /* @__PURE__ */ jsx(Link, {
				to: "/contacts",
				children: "React Router Contacts"
			}) }),
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsxs(Form, {
				id: "search-form",
				role: "search",
				onChange: (event) => {
					const isFirstSearch = q === null;
					submit(event.currentTarget, { replace: !isFirstSearch });
				},
				children: [/* @__PURE__ */ jsx("input", {
					"aria-label": "Search contacts",
					className: searching ? "loading" : "",
					defaultValue: q || "",
					id: "q",
					name: "q",
					placeholder: "Search",
					type: "search"
				}), /* @__PURE__ */ jsx("div", {
					"aria-hidden": true,
					hidden: !searching,
					id: "search-spinner"
				})]
			}), /* @__PURE__ */ jsx(Form, {
				method: "post",
				action: "/contacts",
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					children: "New"
				})
			})] }),
			/* @__PURE__ */ jsx("nav", { children: contacts && contacts.length ? /* @__PURE__ */ jsx("ul", { children: contacts.map((contact) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(NavLink, {
				className: ({ isActive, isPending }) => isActive ? "active" : isPending ? "pending" : "",
				to: `/contacts/${contact.id}`,
				children: [contact.first || contact.last ? /* @__PURE__ */ jsxs(Fragment, { children: [
					contact.first,
					" ",
					contact.last
				] }) : /* @__PURE__ */ jsx("i", { children: "No Name" }), contact.favorite ? /* @__PURE__ */ jsx("span", { children: "★" }) : null]
			}) }, contact.id)) }) : /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("i", { children: "No contacts" }) }) })
		]
	}), /* @__PURE__ */ jsx("div", {
		className: navigation.state === "loading" && !searching ? "loading" : "",
		id: "detail",
		children: /* @__PURE__ */ jsx(Outlet, {})
	})] });
});
//#endregion
//#region app/routes/contacts-index.jsx
var contacts_index_exports = /* @__PURE__ */ __exportAll({
	action: () => action$3,
	default: () => contacts_index_default
});
async function action$3() {
	return redirect(`/contacts/${(await createEmptyContact()).id}/edit`);
}
var contacts_index_default = UNSAFE_withComponentProps(function ContactsIndex() {
	return /* @__PURE__ */ jsxs("p", {
		id: "zero-state",
		children: [
			"This is a demo for React Router.",
			/* @__PURE__ */ jsx("br", {}),
			"Check out",
			" ",
			/* @__PURE__ */ jsx("a", {
				href: "https://reactrouter.com",
				target: "_blank",
				rel: "noopener noreferrer",
				children: "the docs at reactrouter.com"
			}),
			"."
		]
	});
});
//#endregion
//#region app/routes/contact.jsx
var contact_exports = /* @__PURE__ */ __exportAll({
	action: () => action$2,
	default: () => contact_default,
	loader: () => loader$1
});
async function loader$1({ params }) {
	const contactData = await getContact(params.contactId);
	if (!contactData) throw new Response("Not Found", { status: 404 });
	return { contact: Array.isArray(contactData) ? contactData[0] : contactData };
}
async function action$2({ params, request }) {
	const formData = await request.formData();
	return updateContact(params.contactId, { favorite: formData.get("favorite") === "true" });
}
var contact_default = UNSAFE_withComponentProps(function Contact({ loaderData }) {
	const contact = Array.isArray(loaderData.contact) ? loaderData.contact[0] : loaderData.contact;
	return /* @__PURE__ */ jsxs("div", {
		id: "contact",
		children: [/* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("img", {
			alt: `${contact.first || ""} ${contact.last || ""} avatar`,
			src: contact.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((contact.first || "") + " " + (contact.last || ""))}`
		}, contact.avatar || "") }), /* @__PURE__ */ jsxs("div", { children: [
			/* @__PURE__ */ jsxs("h1", { children: [contact.first || contact.last ? /* @__PURE__ */ jsxs(Fragment, { children: [
				contact.first,
				" ",
				contact.last
			] }) : /* @__PURE__ */ jsx("i", { children: "No Name" }), /* @__PURE__ */ jsx(Favorite, { contact })] }),
			contact.twitter ? /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsx("a", {
				href: `https://twitter.com/${contact.twitter}`,
				target: "_blank",
				rel: "noopener noreferrer",
				children: contact.twitter
			}) }) : null,
			contact.notes ? /* @__PURE__ */ jsx("p", { children: contact.notes }) : null,
			/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx(Form, {
				action: "edit",
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					children: "Edit"
				})
			}), /* @__PURE__ */ jsx(Form, {
				action: "destroy",
				method: "post",
				onSubmit: (event) => {
					if (!confirm("Please confirm you want to delete this record.")) event.preventDefault();
				},
				children: /* @__PURE__ */ jsx("button", {
					type: "submit",
					children: "Delete"
				})
			})] })
		] })]
	});
});
function Favorite({ contact }) {
	const fetcher = useFetcher();
	const favorite = fetcher.formData ? fetcher.formData.get("favorite") === "true" : contact.favorite;
	return /* @__PURE__ */ jsx(fetcher.Form, {
		method: "post",
		children: /* @__PURE__ */ jsx("button", {
			"aria-label": favorite ? "Remove from favorites" : "Add to favorites",
			name: "favorite",
			value: favorite ? "true" : "false",
			children: favorite ? "★" : "☆"
		})
	});
}
//#endregion
//#region app/routes/edit-contact.jsx
var edit_contact_exports = /* @__PURE__ */ __exportAll({
	action: () => action$1,
	default: () => edit_contact_default,
	loader: () => loader
});
async function action$1({ params, request }) {
	const formData = await request.formData();
	const updates = Object.fromEntries(formData);
	await updateContact(params.contactId, updates);
	return redirect(`/contacts/${params.contactId}`);
}
async function loader({ params }) {
	const contactData = await getContact(params.contactId);
	if (!contactData) throw new Response("Not Found", { status: 404 });
	return { contact: Array.isArray(contactData) ? contactData[0] : contactData };
}
var edit_contact_default = UNSAFE_withComponentProps(function EditContact({ loaderData }) {
	const contact = Array.isArray(loaderData.contact) ? loaderData.contact[0] : loaderData.contact;
	const navigate = useNavigate();
	return /* @__PURE__ */ jsxs(Form, {
		id: "contact-form",
		method: "post",
		children: [
			/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("span", { children: "Name" }),
				/* @__PURE__ */ jsx("input", {
					"aria-label": "First name",
					defaultValue: contact.first || "",
					name: "first",
					placeholder: "First",
					type: "text"
				}),
				/* @__PURE__ */ jsx("input", {
					"aria-label": "Last name",
					defaultValue: contact.last || "",
					name: "last",
					placeholder: "Last",
					type: "text"
				})
			] }),
			/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("span", { children: "Twitter" }), /* @__PURE__ */ jsx("input", {
				defaultValue: contact.twitter || "",
				name: "twitter",
				placeholder: "@jack",
				type: "text"
			})] }),
			/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("span", { children: "Avatar URL" }), /* @__PURE__ */ jsx("input", {
				"aria-label": "Avatar URL",
				defaultValue: contact.avatar || "",
				name: "avatar",
				placeholder: "https://example.com/avatar.jpg",
				type: "text"
			})] }),
			/* @__PURE__ */ jsxs("label", { children: [/* @__PURE__ */ jsx("span", { children: "Notes" }), /* @__PURE__ */ jsx("textarea", {
				defaultValue: contact.notes || "",
				name: "notes",
				rows: 6
			})] }),
			/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("button", {
				type: "submit",
				children: "Save"
			}), /* @__PURE__ */ jsx("button", {
				onClick: () => navigate(-1),
				type: "button",
				children: "Cancel"
			})] })
		]
	}, contact.id);
});
//#endregion
//#region app/routes/destroy-contact.jsx
var destroy_contact_exports = /* @__PURE__ */ __exportAll({ action: () => action });
async function action({ params }) {
	await deleteContact(params.contactId);
	return redirect("/contacts");
}
//#endregion
//#region \0virtual:react-router/server-manifest
var server_manifest_default = {
	"entry": {
		"module": "/assets/entry.client-ChOif__n.js",
		"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
		"css": []
	},
	"routes": {
		"root": {
			"id": "root",
			"parentId": void 0,
			"path": "",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": true,
			"module": "/assets/root-RjNiu9Yb.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": ["/assets/root-B5aJJtW8.css"],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/home": {
			"id": "routes/home",
			"parentId": "root",
			"path": void 0,
			"index": true,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/home-nsD5092R.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/swipe": {
			"id": "routes/swipe",
			"parentId": "root",
			"path": "swipe",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/swipe-DEw7Rssl.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js", "/assets/locations-D54xw2ra.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/results": {
			"id": "routes/results",
			"parentId": "root",
			"path": "results",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/results-edYN2H4f.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js", "/assets/locations-D54xw2ra.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"layouts/sidebar": {
			"id": "layouts/sidebar",
			"parentId": "root",
			"path": void 0,
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": false,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/sidebar-CV--f5Kp.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/contacts-index": {
			"id": "routes/contacts-index",
			"parentId": "layouts/sidebar",
			"path": "contacts",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": true,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/contacts-index-ChzBpZ_V.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/contact": {
			"id": "routes/contact",
			"parentId": "layouts/sidebar",
			"path": "contacts/:contactId",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": true,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/contact-CXETeT4p.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/edit-contact": {
			"id": "routes/edit-contact",
			"parentId": "layouts/sidebar",
			"path": "contacts/:contactId/edit",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": true,
			"hasLoader": true,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": true,
			"hasErrorBoundary": false,
			"module": "/assets/edit-contact-BglVOEqb.js",
			"imports": ["/assets/jsx-runtime-Cld90IRz.js"],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		},
		"routes/destroy-contact": {
			"id": "routes/destroy-contact",
			"parentId": "layouts/sidebar",
			"path": "contacts/:contactId/destroy",
			"index": void 0,
			"caseSensitive": void 0,
			"hasAction": true,
			"hasLoader": false,
			"hasClientAction": false,
			"hasClientLoader": false,
			"hasClientMiddleware": false,
			"hasDefaultExport": false,
			"hasErrorBoundary": false,
			"module": "/assets/destroy-contact-BvRk9kiK.js",
			"imports": [],
			"css": [],
			"clientActionModule": void 0,
			"clientLoaderModule": void 0,
			"clientMiddlewareModule": void 0,
			"hydrateFallbackModule": void 0
		}
	},
	"url": "/assets/manifest-9f49acef.js",
	"version": "9f49acef",
	"sri": void 0
};
//#endregion
//#region \0virtual:react-router/server-build
var assetsBuildDirectory = "build/client";
var basename = "/";
var future = {
	"unstable_optimizeDeps": false,
	"v8_passThroughRequests": false,
	"v8_trailingSlashAwareDataRequests": false,
	"unstable_previewServerPrerendering": false,
	"v8_middleware": false,
	"v8_splitRouteModules": false,
	"v8_viteEnvironmentApi": false
};
var ssr = true;
var isSpaMode = false;
var prerender = [];
var routeDiscovery = {
	"mode": "lazy",
	"manifestPath": "/__manifest"
};
var publicPath = "/";
var entry = { module: entry_server_node_exports };
var routes = {
	"root": {
		id: "root",
		parentId: void 0,
		path: "",
		index: void 0,
		caseSensitive: void 0,
		module: root_exports
	},
	"routes/home": {
		id: "routes/home",
		parentId: "root",
		path: void 0,
		index: true,
		caseSensitive: void 0,
		module: home_exports
	},
	"routes/swipe": {
		id: "routes/swipe",
		parentId: "root",
		path: "swipe",
		index: void 0,
		caseSensitive: void 0,
		module: swipe_exports
	},
	"routes/results": {
		id: "routes/results",
		parentId: "root",
		path: "results",
		index: void 0,
		caseSensitive: void 0,
		module: results_exports
	},
	"layouts/sidebar": {
		id: "layouts/sidebar",
		parentId: "root",
		path: void 0,
		index: void 0,
		caseSensitive: void 0,
		module: sidebar_exports
	},
	"routes/contacts-index": {
		id: "routes/contacts-index",
		parentId: "layouts/sidebar",
		path: "contacts",
		index: void 0,
		caseSensitive: void 0,
		module: contacts_index_exports
	},
	"routes/contact": {
		id: "routes/contact",
		parentId: "layouts/sidebar",
		path: "contacts/:contactId",
		index: void 0,
		caseSensitive: void 0,
		module: contact_exports
	},
	"routes/edit-contact": {
		id: "routes/edit-contact",
		parentId: "layouts/sidebar",
		path: "contacts/:contactId/edit",
		index: void 0,
		caseSensitive: void 0,
		module: edit_contact_exports
	},
	"routes/destroy-contact": {
		id: "routes/destroy-contact",
		parentId: "layouts/sidebar",
		path: "contacts/:contactId/destroy",
		index: void 0,
		caseSensitive: void 0,
		module: destroy_contact_exports
	}
};
var allowedActionOrigins = false;
//#endregion
export { allowedActionOrigins, server_manifest_default as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, prerender, publicPath, routeDiscovery, routes, ssr };
