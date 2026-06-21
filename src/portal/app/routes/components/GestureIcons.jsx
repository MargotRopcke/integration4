/**
 * GestureIcons.jsx — single source of truth for all gesture icons.
 *
 * ONE component: GestureProgressIcon
 *   - progress=0   → faint base (idle state, shown in buttons at rest)
 *   - progress=1–99 → filling bottom-up as user holds gesture
 *   - progress=100  → fully filled + pulse animation
 *
 * Used identically in:
 *   - StepSwipe bottom buttons (idle + filling on detect)
 *   - StepSwipe done overlay buttons (idle + filling on detect)
 *   - StepSwipe gesture hint top (filling on detect)
 *   - StepSummary action buttons (idle + filling on detect)
 *   - StepSummary gesture hint top (filling on detect)
 *   - TutorialScreen progress indicator (filling as user holds)
 *   - TutorialScreen instruction icons (static at progress=100)
 */

import "./GestureIcons.css";
import { useId } from "react";

const GESTURES = {
  thumbsUp: {
    viewBox: "0 0 229 232", w: 229, h: 232,
    path: "M60.0533 223.758L27.2395 223.132C21.4376 223.021 15.9174 220.61 11.8932 216.428C7.86893 212.246 5.67034 206.636 5.78105 200.833L7.24212 124.247C7.35284 118.444 9.76379 112.922 13.9446 108.897C18.1254 104.872 23.7336 102.673 29.5355 102.783L62.3493 103.409M139.332 82.9884L140.167 39.2253C140.333 30.5203 137.035 22.1058 130.999 15.833C124.963 9.56027 116.682 5.94298 107.98 5.77695L62.3493 103.409L60.0533 223.758L183.433 226.112C188.708 226.272 193.863 224.52 197.948 221.179C202.033 217.838 204.773 213.132 205.664 207.93L222.637 109.751C223.173 106.624 223.022 103.417 222.196 100.354C221.37 97.2912 219.888 94.4444 217.853 92.0111C215.818 89.5777 213.278 87.6161 210.41 86.2621C207.541 84.9081 204.413 84.194 201.241 84.1695L139.332 82.9884Z",
    sw: 11.5541, fill: "#B5E28D", stroke: "#5aad1e",
  },
  thumbsDown: {
    viewBox: "0 0 229 232", w: 229, h: 232,
    path: "M168.675 8.14112L201.489 8.76713C207.291 8.87781 212.811 11.2893 216.835 15.4712C220.86 19.653 223.058 25.2627 222.947 31.066L221.486 107.651C221.376 113.455 218.965 118.976 214.784 123.002C210.603 127.027 204.995 129.226 199.193 129.116L166.379 128.49M89.3962 148.911L88.5613 192.674C88.3952 201.379 91.6931 209.793 97.7295 216.066C103.766 222.339 112.046 225.956 120.749 226.122L166.379 128.49L168.675 8.14112L45.2952 5.78732C40.0207 5.62702 34.8659 7.37886 30.7807 10.7201C26.6955 14.0613 23.9551 18.7667 23.0645 23.9693L6.09165 122.148C5.55594 125.275 5.70631 128.481 6.53236 131.545C7.35841 134.608 8.84037 137.455 10.8756 139.888C12.9108 142.321 15.4506 144.283 18.319 145.637C21.1874 146.991 24.3158 147.705 27.4875 147.729L89.3962 148.911Z",
    sw: 11.5541, fill: "#DA9B97", stroke: "#E03C31",
  },
  stopHand: {
    viewBox: "0 0 249 274", w: 249, h: 274,
    path: "M116.338 136.943V41.4334C116.338 31.1635 123.917 22.8335 133.261 22.8335C142.605 22.8335 150.184 31.1635 150.184 41.4334V136.943V58.5498C150.184 48.2799 157.763 39.9499 167.107 39.9499C176.451 39.9499 184.03 48.2799 184.03 58.5498V136.943H184.134V97.3471C184.134 87.7619 191.713 79.8883 201.057 79.8883C210.297 79.8883 217.876 87.7619 217.876 97.3471V188.407C217.876 223.21 190.778 251.167 157.036 251.167H142.709C128.381 251.167 115.611 245.918 105.54 238.044L36.1873 167.524C29.4389 160.564 29.4389 148.582 36.1873 141.622C42.9357 134.661 53.1103 136.144 59.8587 143.105L82.492 165.699V68.8197C82.492 59.2345 90.071 51.3609 99.415 51.3609C108.759 51.3609 116.338 59.2345 116.338 68.8197V137.856",
    sw: 10, fill: "#FAECB3", stroke: "#FFCD00",
  },
};

/**
 * GestureProgressIcon
 *
 * @param {"thumbsUp"|"thumbsDown"|"stopHand"} gesture
 * @param {number} progress  0–100. 0 = idle (faint), 100 = full + pulse.
 * @param {number} size      Height in px. Width scales with viewBox aspect ratio.
 */
export function GestureProgressIcon({ gesture, progress = 0, size = 60 }) {
  const uid = useId();
  const g = GESTURES[gesture];
  if (!g) return null;

  const pct     = Math.min(Math.max(progress, 0), 100);
  const done    = pct >= 100;
  const aspect  = g.w / g.h;
  const clipTop = g.h - (g.h * pct) / 100;

  return (
    <div
      className={`gpi${done ? " gpi--done" : ""}`}
      aria-hidden="true"
    >
      <svg
        width={size * aspect}
        height={size}
        viewBox={g.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id={`gpi-${uid}`}>
            {/* Rect grows upward: at 0% clipTop=h (nothing shown), at 100% clipTop=0 (fully shown) */}
            <rect x="0" y={clipTop} width={g.w} height={g.h} />
          </clipPath>
        </defs>

        {/* Base layer — always visible, very faint — shows shape at rest */}
        <path
          d={g.path}
          fill={g.fill}
          fillOpacity={0.15}
          stroke={g.stroke}
          strokeOpacity={0.3}
          strokeWidth={g.sw}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Fill layer — revealed bottom-up as progress rises */}
        <path
          d={g.path}
          fill={g.fill}
          fillOpacity={0.8}
          stroke={g.stroke}
          strokeOpacity={1}
          strokeWidth={g.sw}
          strokeLinecap="round"
          strokeLinejoin="round"
          clipPath={`url(#gpi-${uid})`}
        />
      </svg>
    </div>
  );
}
