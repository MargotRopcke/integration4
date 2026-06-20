// Inline SVG icons — outline version (instruction) and filled version (progress)

const ThumbUpSVG = ({ color, filled = false, size = 120 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {filled
            ? <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-10v4a2 2 0 0 1-2 2H9l-2 7v1h11a2 2 0 0 0 2-2l1-5a2 2 0 0 0-2-2h-4V4a2 2 0 0 0-2-2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} />
            : <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3m7-10v4a2 2 0 0 1-2 2H9l-2 7v1h11a2 2 0 0 0 2-2l1-5a2 2 0 0 0-2-2h-4V4a2 2 0 0 0-2-2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        }
    </svg>


    /*<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 148 150" fill="none">
        <path d="M40.3255 143.776H19.5966C15.9315 143.776 12.4165 142.322 9.82492 139.734C7.2333 137.146 5.77734 133.636 5.77734 129.976L5.77734 81.6764C5.77734 78.0164 7.2333 74.5063 9.82492 71.9184C12.4165 69.3304 15.9315 67.8765 19.5966 67.8765H40.3255M88.693 54.0765V26.4767C88.693 20.9868 86.5091 15.7217 82.6217 11.8397C78.7342 7.95773 73.4617 5.77686 67.9641 5.77686L40.3255 67.8765L40.3255 143.776H118.266C121.599 143.814 124.833 142.647 127.373 140.492C129.912 138.336 131.586 135.337 132.086 132.046L141.621 69.9464C141.921 67.9686 141.788 65.9492 141.229 64.028C140.671 62.1069 139.701 60.3299 138.386 58.8204C137.072 57.3108 135.444 56.1047 133.617 55.2855C131.789 54.4664 129.805 54.0539 127.802 54.0765L88.693 54.0765Z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>*/
);

const ThumbDownSVG = ({ color, filled = false, size = 120 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {filled
            ? <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3M10 20v-4a2 2 0 0 1 2-2h5l2-7V6H8a2 2 0 0 0-2 2l-1 5a2 2 0 0 0 2 2h4v4a2 2 0 0 0 2 2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} />
            : <path d="M17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3M10 20v-4a2 2 0 0 1 2-2h5l2-7V6H8a2 2 0 0 0-2 2l-1 5a2 2 0 0 0 2 2h4v4a2 2 0 0 0 2 2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        }
    </svg>
);

const StopHandSVG = ({ color, filled = false, size = 120 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {filled
            ? <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8l-1.5-1.5A1.5 1.5 0 0 0 2.38 12.5l3.13 5.25A6 6 0 0 0 11 21h1a6 6 0 0 0 6-6v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill={color} />
            : <path d="M18 11V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2M14 10V4a2 2 0 0 0-2-2 2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v8l-1.5-1.5A1.5 1.5 0 0 0 2.38 12.5l3.13 5.25A6 6 0 0 0 11 21h1a6 6 0 0 0 6-6v-4a2 2 0 0 0-2-2 2 2 0 0 0-2 2z"
                stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        }
    </svg>
);

// Config per tutorial step
const TUTORIAL_CONFIG = {
    2: {
        panelBg: "#b6e388",
        titleColor: "#16434f",
        descColor: "#16434f",
        title: "Like the spot?",
        desc: <>Show a thumb up motion to try <strong>a like</strong>.</>,
        // Progress icon (top) — fills from outline to solid as hold progresses
        ProgressIcon: ({ progress, size }) => {
            const filled = progress > 0;
            const color = filled ? "#b6e388" : "#b6e388";
            return (
                <div className="tutorial-progress-icon" style={{ "--progress": `${progress}%` }}>
                    <ThumbUpSVG color={color} filled={filled} size={size} />
                </div>
            );
        },
        // Instruction icon (middle) — always teal outline
        InstructionIcon: ({ size }) => <ThumbUpSVG color="#0582a8" size={size} />,
    },
    3: {
        panelBg: "#e13b2c",
        titleColor: "#fff",
        descColor: "#fff",
        title: "Don't like the spot?",
        desc: <>Show a thumb down motion to try <strong>a dislike</strong>.</>,
        ProgressIcon: ({ progress, size }) => {
            const filled = progress > 0;
            return (
                <div className="tutorial-progress-icon" style={{ "--progress": `${progress}%` }}>
                    <ThumbDownSVG color="#f4b8b8" filled={filled} size={size} />
                </div>
            );
        },
        InstructionIcon: ({ size }) => <ThumbDownSVG color="#0582a8" size={size} />,
    },
    4: {
        panelBg: "#ffcc00",
        titleColor: "#16434f",
        descColor: "#16434f",
        title: "Undo a (dis)like?",
        desc: "Try a return by doing a stop motion.",
        ProgressIcon: ({ progress, size }) => {
            const filled = progress > 0;
            return (
                <div className="tutorial-progress-icon" style={{ "--progress": `${progress}%` }}>
                    <StopHandSVG color="#ffdd66" filled={filled} size={size} />
                </div>
            );
        },
        InstructionIcon: ({ size }) => <StopHandSVG color="#0582a8" size={size} />,
    },
};

export function TutorialScreen({ tutorialStep, tutorialHoldBars, nextTutorialStep }) {
    // ── STEP 1: Footprint marker ──────────────────────────────────────────────
    if (tutorialStep === 1) {
        return (
            <div className="tutorial-screen tutorial-screen--step1">
                <img
                    src="/images/discover.svg"
                    alt=""
                    className="tutorial-sticker"
                    aria-hidden="true"
                />
                <div className="tutorial-text-block">
                    <h2 className="tutorial-heading">Step onto the marker.</h2>
                    <p className="tutorial-body">
                        After the instructions, we'll give you a selection of personalised local spots.
                    </p>
                </div>
                <div className="tutorial-footprint" onClick={nextTutorialStep} role="button" tabIndex={0}>
                    <span className="tutorial-footprint__icon">👟👟</span>
                </div>
            </div>
        );
    }

    // ── STEPS 2–4: Gesture tutorials ─────────────────────────────────────────
    const cfg = TUTORIAL_CONFIG[tutorialStep];
    if (!cfg) return null;

    const progress = tutorialHoldBars[tutorialStep] ?? 0;
    const { ProgressIcon, InstructionIcon } = cfg;

    return (
        <div className="tutorial-screen tutorial-screen--gesture">
            <div className="tutorial-icons">
                {/* Top icon — progress loader, fills with color as gesture is held */}
                <div className="tutorial-icon tutorial-icon--progress">
                    <ProgressIcon progress={progress} size={80} />
                </div>

                {/* Middle icon — static instruction showing what gesture to make */}
                <div className="tutorial-icon tutorial-icon--instruction">
                    <InstructionIcon size={140} />
                </div>
            </div>

            {/* Bottom colored panel */}
            <div className="tutorial-panel" style={{ background: cfg.panelBg }}>
                <h2 className="tutorial-heading" style={{ color: cfg.titleColor }}>
                    {cfg.title}
                </h2>
                <p className="tutorial-body" style={{ color: cfg.descColor }}>
                    {cfg.desc}
                </p>
            </div>
        </div>
    );
}