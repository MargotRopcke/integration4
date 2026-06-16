import { Link } from "react-router";
import "./intro.css";

// routes/map.jsx
import { useSearchParams } from 'react-router';
import { getSessionLocations } from '../data';

export async function clientLoader({ request }) {
  const userId = new URL(request.url).searchParams.get('user');
  return getSessionLocations(userId);
}

export default function Intro() {
  return (

    <div className="intro" id="intro-screen">

      <div className="mobile-container">
        {/* Header Sectie */}
        <header className="header-section">
          <h1 className="welcome-text">
            HI <span className="name-handwritten"><img src="" alt="" />Femke</span>
          </h1>
          <p className="subtitle">db type traveller</p>
        </header>
        {/* Collage Sectie */}
        <main className="collage-container">
          {/* Groene 'Welcome to Antwerp' banner die erdoorheen loopt */}
          <div className="ticker-tape">
            <span>Welcome to Antwerp • Welcome to Antwerp • Welcome to Antwerp</span>
          </div>

          {/* Polaroid 1: Links (Wit/Geelachtig) */}
          <div className="polaroid polaroid-left">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400" alt="Terras" />
            </div>
          </div>

          {/* Polaroid 2: Midden (Roze, ligt bovenop) */}
          <div className="polaroid polaroid-center">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400" alt="Interieur" />
            </div>
          </div>

          {/* Polaroid 3: Rechts (Groen, Chef/Keuken) */}
          <div className="polaroid polaroid-right">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400" alt="Chef" />
            </div>
          </div>

          {/* Polaroid 4: Achtergrond/Onder (Blauw/Donker) */}
          <div className="polaroid polaroid-bg-dark">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400" alt="Bar" />
            </div>
          </div>
          {/* Polaroid 5: Rechts (Groen, Chef/Keuken) */}
          <div className="polaroid polaroid-right">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400" alt="Chef" />
            </div>
          </div>

          {/* Polaroid 6: Achtergrond/Onder (Blauw/Donker) */}
          <div className="polaroid polaroid-bg-dark">
            <div className="polaroid-img-wrapper">
              <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400" alt="Bar" />
            </div>
          </div>


          {/* Type Icon/Illustratie linksonder */}
          <div className="type-icon">
          </div>
        </main>


        <Link to="/map" className="intro__button" id="enter-button">
          Let's discover your taste
        </Link>
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
