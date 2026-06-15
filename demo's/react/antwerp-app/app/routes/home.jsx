import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(timer);
  }, []);

  const categories = [
    { key: "all", label: "All" },
    { key: "restaurant", label: "🍽 Restaurants" },
    { key: "fashion", label: "👗 Fashion" },
    { key: "cafe", label: "☕ Cafés" },
    { key: "bar", label: "🍺 Bars" },
  ];

  function handleStart() {
    navigate(`/swipe?category=${currentCategory}`);
  }

  // Generate film holes
  const filmHoles = Array.from({ length: 22 }, (_, i) => (
    <div key={i} className="film-hole" />
  ));

  if (loading) {
    return (
      <div id="loading-screen">
        <div className="loader-film" />
        <p>developing your film…</p>
      </div>
    );
  }

  return (
    <div className="screen intro-screen">
      <div className="film-holes top">{filmHoles}</div>
      <div className="film-holes bottom">{filmHoles}</div>

      <div className="intro-polaroid">
        <h1>
          Discover
          <br />
          <span>Antwerp</span>
        </h1>
        <p className="sub">
          Swipe the city's best spots.
          <br />
          👍 like · 👎 pass · we'll snap your reaction!
        </p>
        <div className="stamp" style={{ margin: ".5rem 0 1rem" }}>
          est. 2025 · Belgium
        </div>
      </div>

      <div className="category-pills">
        {categories.map((cat) => (
          <div
            key={cat.key}
            className={`pill ${currentCategory === cat.key ? "active" : ""}`}
            onClick={() => setCurrentCategory(cat.key)}
          >
            {cat.label}
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleStart}>
        ✦ Start Swiping
      </button>
      <p className="intro-note">grant camera access for gestures + reaction photos</p>
    </div>
  );
}
