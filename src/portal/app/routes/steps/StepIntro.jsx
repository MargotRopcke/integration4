import "./StepIntro.css";
import { useEffect, useRef } from "react";
import touchAnimation from "../../../assets/animations/touch.json";

export function StepIntro({ onStart }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let anim;
    let cancelled = false;

    import("lottie-web").then((lottie) => {
      if (cancelled || !containerRef.current) return;
      // Clear any existing animation first
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
    <div className="step-intro" id="step-0">

      <h1 className="intro-heading">The Portal</h1>
      <p className="intro-subheading">
        One step and you enter your version of Antwerp.
      </p>
      <button className="btn-intro" onClick={onStart} style={{ marginTop: "2rem" }} id="start-button">
        Click screen to start
      </button>
      <div className="intro-portal-icon">
        <div ref={containerRef} style={{ width: 90, height: 90 }} />
      </div>
    </div>
  );
}