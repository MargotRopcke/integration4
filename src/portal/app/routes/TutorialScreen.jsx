import { useEffect, useRef } from "react";
import { GestureProgressIcon } from "../components/GestureIcons.jsx";
import feetAnimation from "../../assets/animations/feet.json";
const TUTORIAL_CONFIG = {
  2: {
    panelBg: "#b6e388", titleColor: "#16434f",
    title: "Like the spot?",
    desc: <><strong>Thumbs up</strong> and hold to like a spot.</>,
    gesture: "thumbsUp",
  },
  3: {
    panelBg: "#e13b2c", titleColor: "#fff",
    title: "Don't like the spot?",
    desc: <><strong>Thumbs down</strong> and hold to skip a spot.</>,
    gesture: "thumbsDown",
  },
  4: {
    panelBg: "#ffcc00", titleColor: "#16434f",
    title: "Undo a (dis)like?",
    desc: "Show an open palm and hold to go back one card.",
    gesture: "stopHand",
  },
};

export function TutorialScreen({ tutorialStep, tutorialHoldBars, nextTutorialStep }) {
  const feetRef = useRef(null);

  useEffect(() => {
    if (tutorialStep !== 1) return;
    const t = setTimeout(() => nextTutorialStep(), 4000);
    return () => clearTimeout(t);
  }, [tutorialStep, nextTutorialStep]);

  useEffect(() => {
    if (tutorialStep !== 1 || !feetRef.current) return;
    let anim;
    let cancelled = false;

    import("lottie-web").then((lottie) => {
      if (cancelled || !feetRef.current) return;
      feetRef.current.innerHTML = "";
      anim = lottie.default.loadAnimation({
        container: feetRef.current,
        renderer: "svg",
        loop: 2,
        autoplay: true,
        animationData: feetAnimation,
      });
    });

    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, [tutorialStep]);

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
          <div ref={feetRef} style={{ width: 1000, height: 1000 }} />
        </div>
      </div>
    );
  }


  const cfg = TUTORIAL_CONFIG[tutorialStep];
  if (!cfg) return null;

  const progress = tutorialHoldBars?.[tutorialStep] ?? 0;

  return (
    <div className="tutorial-screen tutorial-screen--gesture">

      <div className="tutorial-icons">
        {/* Small progress icon — fills as user holds */}
        <div className="tutorial-icon tutorial-icon--progress">
          <GestureProgressIcon gesture={cfg.gesture} progress={progress} size={72} />
        </div>

        {/* Large instruction icon — always fully shown so user knows what gesture to make */}
        <div className="tutorial-icon tutorial-icon--instruction">
          <GestureProgressIcon gesture={cfg.gesture} progress={100} size={150} />
        </div>
      </div>

      <div className="tutorial-panel" style={{ background: cfg.panelBg }}>
        <h2 className="tutorial-heading" style={{ color: cfg.titleColor }}>{cfg.title}</h2>
        <p className="tutorial-body" style={{ color: cfg.titleColor }}>{cfg.desc}</p>
      </div>
    </div>
  );
}
