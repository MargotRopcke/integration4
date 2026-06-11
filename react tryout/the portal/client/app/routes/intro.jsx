import { Link } from "react-router";
import "./intro.css";

export default function Intro() {
  return (
    <div className="intro" id="intro-screen">
      {/* Animated background glows */}
      <div className="intro__glow intro__glow--top" />
      <div className="intro__glow intro__glow--bottom" />

      {/* Main content */}
      <div className="intro__content">
        {/* Animated portal icon */}
        <div className="intro__icon">
          <div className="intro__icon-ring" />
          <div className="intro__icon-ring intro__icon-ring--inner" />
          <div className="intro__icon-dot" />
        </div>

        <h1 className="intro__title">The Portal</h1>
        <p className="intro__subtitle">
          Discover 6 hidden gems across Antwerp. Explore the city through a new lens.
        </p>

        <Link to="/map" className="intro__button" id="enter-button">
          Enter
          <span className="intro__button-arrow">→</span>
        </Link>
      </div>

      {/* Bottom decoration dots */}
      <div className="intro__decoration">
        <div className="intro__decoration-dot" />
        <div className="intro__decoration-dot" />
        <div className="intro__decoration-dot" />
      </div>
    </div>
  );
}

export function meta() {
  return [
    { title: "The Portal — Discover Antwerp" },
    { name: "description", content: "Discover 6 hidden locations across Antwerp through The Portal." },
  ];
}
