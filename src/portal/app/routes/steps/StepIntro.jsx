import "./StepIntro.css";
import { useEffect, useRef } from "react";
import touchAnimation from "../../../assets/animations/touch.json";

const LipsSVG = () => (
  <img src="../../../assets/stickers/lips-green.svg" alt="lips" />
);

const BagSVG = () => (
  <img src="../../../assets/stickers/bag-yellow.svg" alt="bag" />
);

const SilhouetteSVG = () => (
  <img src="../../../assets/stickers/silhouette.svg" alt="silhouette" />
);
const TasteSVG = () => (
  <img src="../../../assets/stickers/taste.svg" alt="silhouette" />
);
const StreetPhoto = () => (
  <img src="../../../assets/images/intro-bg.png" alt="street in Antwerp" />
);

export function StepIntro({ onStart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let anim;
    let cancelled = false;
    import("lottie-web").then((lottie) => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";
      anim = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: touchAnimation,
      });
    });
    return () => {
      cancelled = true;
      anim?.destroy();
    };
  }, []);

  return (
    <div className="step-intro" id="step-0" onClick={onStart}>

      {/* ── Title block: 3-col grid [lips | THE/PORTAL | bag] ── */}
      <div className="intro-title-block">
        <div className="intro-sticker--lips"><LipsSVG /></div>
        <span className="intro-title-the">THE</span>
        <div className="intro-sticker--bag"><BagSVG /></div>
        {/* PORTAL spans the full middle column on row 2 */}
        <span className="intro-title-portal">PORTAL</span>
      </div>

      {/* ── Polaroid card: grid [photo / stamp + silhouette] ── */}
      <div className="intro-card">
        <div className="intro-card-photo-wrap">
          <StreetPhoto />
        </div>
        <div className="intro-card-sticker"><TasteSVG /></div>
        <div className="intro-card-silhouette"><SilhouetteSVG /></div>
      </div>

      {/* ── Subheading ── */}
      <p className="intro-subheading">
        One step and you enter your version of Antwerp.
      </p>

      {/* ── CTA: grid [button / icon / badge] ── */}
      <div className="intro-cta">
        <button
          className="btn-intro"
          onClick={(e) => { e.stopPropagation(); onStart(); }}
          id="start-button"
        >
          Click screen to start
        </button>

        <div className="intro-portal-icon">
          <div ref={containerRef} style={{ width: 80, height: 80 }} />
        </div>

        <div className="intro-antwerp-badge" aria-label="Visit Antwerp">
          <img src="../../../assets/icons/a-logo.svg" alt="logo visit antwerp" />
        </div>
      </div>

    </div>
  );
}