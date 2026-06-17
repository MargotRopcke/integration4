import { useLoaderData, Link } from "react-router";
import { getSessionLocations } from '../data';
import "./intro.css";

// intro.jsx
export async function clientLoader({ request }) {
  const userId = new URL(request.url).searchParams.get('user');

  // werkt alleen met een user id die dan via de qr zou gegeven moeten worden
  return getSessionLocations(userId);

  // --> als we niet door heel de form willen gaan moet deze code geactiveerd worden
  //   if (!userId) return { locations: [] };
  // try {
  //   return await getSessionLocations(userId);
  // } catch (e) {
  //   console.error("Failed to load session locations:", e);
  //   return { locations: [] };
  // }
}

export default function Intro() {
  const { session, locations, sessionPhotos, userId } = useLoaderData(); // ← read it here

  // ...



  //export default function Intro() {
  //const { session, locations, sessionPhotos } = useLoaderData();

  // Prefer the user's own reaction selfies for the polaroids;
  // fall back to location images if no photos were captured.
  const polaroidSources =
    sessionPhotos && sessionPhotos.length > 0
      ? sessionPhotos.slice(0, 6).map((p) => ({ src: p.photo, alt: "Your reaction" }))
      : (locations || []).slice(0, 6).map((l) => ({ src: l.image, alt: l.name }));

  return (
    <div className="intro" id="intro-screen">
      <div className="mobile-container">

        <header className="header-section">
          <h1 className="welcome-text">
            HI{" "}
            <span className="name-handwritten">
              {session?.photo_name
                ? <img src={session.photo_name} alt="your name" style={{ width: '50%', height: '50%', objectFit: 'cover' }} />
                : "Traveler"}
            </span>
          </h1>
          <p className="subtitle">{session?.traveler_type?.name || "Explorer"}</p>
        </header>

        <main className="collage-container">
          <div className="ticker-tape">
            <span>Welcome to Antwerp • Welcome to Antwerp • Welcome to Antwerp</span>
          </div>

          {["polaroid-left", "polaroid-center", "polaroid-right",
            "polaroid-bg-dark", "polaroid-right", "polaroid-bg-dark"
          ].map((cls, i) => (
            <div key={i} className={`polaroid ${cls}`}>
              <div className="polaroid-img-wrapper">
                {polaroidSources[i] && (
                  <img
                    src={polaroidSources[i].src}
                    alt={polaroidSources[i].alt}
                  />
                )}
              </div>
            </div>
          ))}

          <div className="type-icon">
            {session?.primary_category?.name?.toLowerCase() === 'style' ? '👗' : '🍽'}
          </div>


  // ...
          <Link to={`/map?user=${userId || ''}`} className="intro__button" id="enter-button">
            Let's discover your taste
          </Link>
        </main>
      </div>
    </div>
  );
}
