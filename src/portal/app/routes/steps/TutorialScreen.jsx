import { useEffect } from "react";
import { GestureProgressIcon, ThumbUpSVG, ThumbDownSVG, StopHandSVG } from "../components/GestureIcons.jsx";

const TUTORIAL_CONFIG = {
  2: {
    panelBg:    "#b6e388",
    titleColor: "#16434f",
    descColor:  "#16434f",
    title:      "Like the spot?",
    desc:       <><strong>Thumbs up</strong> and hold to like a spot.</>,
    gesture:    "thumbsUp",
    Icon:       ({ size }) => <ThumbUpSVG size={size} />,
  },
  3: {
    panelBg:    "#e13b2c",
    titleColor: "#fff",
    descColor:  "#fff",
    title:      "Don't like the spot?",
    desc:       <><strong>Thumbs down</strong> and hold to skip a spot.</>,
    gesture:    "thumbsDown",
    Icon:       ({ size }) => <ThumbDownSVG size={size} />,
  },
  4: {
    panelBg:    "#ffcc00",
    titleColor: "#16434f",
    descColor:  "#16434f",
    title:      "Undo a (dis)like?",
    desc:       "Show an open palm and hold to go back one card.",
    gesture:    "stopHand",
    Icon:       ({ size }) => <StopHandSVG size={size} />,
  },
};

export function TutorialScreen({ tutorialStep, tutorialHoldBars, nextTutorialStep }) {
  useEffect(() => {
    if (tutorialStep !== 1) return;
    const t = setTimeout(() => nextTutorialStep(), 4000);
    return () => clearTimeout(t);
  }, [tutorialStep, nextTutorialStep]);

  if (tutorialStep === 1) {
    return (
      <div className="tutorial-screen tutorial-screen--step1">
        <img src="/assets/stickers/discover.svg" alt="" className="tutorial-sticker" aria-hidden="true" />
        <div className="tutorial-text-block">
          <h2 className="tutorial-heading">Step onto the marker.</h2>
          <p className="tutorial-body">
            After the instructions, we'll give you a selection of personalised local spots.
          </p>
        </div>
        <div className="tutorial-footprint" aria-hidden="true">
          <span className="tutorial-footprint__icon">👟👟</span>
        </div>
      </div>
    );
  }

  const cfg = TUTORIAL_CONFIG[tutorialStep];
  if (!cfg) return null;

  const progress = tutorialHoldBars?.[tutorialStep] ?? 0;

  return (
    <div className="tutorial-screen tutorial-screen--gesture">

      {/* Upper area: progress icon (small, filling) + large instruction icon */}
      <div className="tutorial-icons">
        <div className="tutorial-icon tutorial-icon--progress">
          <GestureProgressIcon gesture={cfg.gesture} progress={progress} size={72} />
        </div>
        <div className="tutorial-icon tutorial-icon--instruction">
          <cfg.Icon size={150} />
        </div>
      </div>

      {/* Colored bottom panel */}
      <div className="tutorial-panel" style={{ background: cfg.panelBg }}>
        <h2 className="tutorial-heading" style={{ color: cfg.titleColor }}>{cfg.title}</h2>
        <p className="tutorial-body" style={{ color: cfg.descColor }}>{cfg.desc}</p>
        <div className="tutorial-hold-track">
          <div className="tutorial-hold-fill" style={{ width: `${progress}%`, background: cfg.titleColor }} />
        </div>
      </div>
    </div>
  );
}
