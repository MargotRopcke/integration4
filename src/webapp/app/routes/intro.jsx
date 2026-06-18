import { useLoaderData, Link } from "react-router";
import { getSessionLocations } from '../data';
import { NoUserFallback } from "../components/NoUserFallback";
import "./intro.css";

// intro.jsx
export async function clientLoader({ request }) {
  let userId = new URL(request.url).searchParams.get('user');
  console.log('userId from URL:', userId, typeof userId);

  if (userId) {
    localStorage.setItem('portal_user_id', userId);
  } else {
    userId = localStorage.getItem('portal_user_id');
    console.log('userId from localStorage:', userId);
  }

  if (!userId || isNaN(Number(userId))) {
    return { noUser: true, session: null, locations: [], sessionPhotos: [], userId: null };
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  );

  // Raw query to see exactly what's in the table
  const { data, error } = await supabase
    .from("sessions_photos")
    .select("*")
    .limit(5);
  console.log('ALL recent sessions_photos:', data, error);

  try {
    return { ...(await getSessionLocations(userId)), noUser: false };
  } catch (e) {
    console.error("Failed to load session locations:", e);
    return { session: null, locations: [], sessionPhotos: [], userId, noUser: false };
  }
}

export default function Intro() {
  const { session, locations, sessionPhotos, userId, noUser } = useLoaderData();

  if (noUser) {
    return <NoUserFallback />;
  }

  console.log('sessionPhotos:', sessionPhotos);
  console.log('first photo value:', sessionPhotos?.[0]?.photo?.slice(0, 50));
  // Prefer the user's own reaction selfies for the polaroids;
  // fall back to location images if no photos were captured.
  const polaroidSources =
    sessionPhotos && sessionPhotos.length > 0
      ? sessionPhotos.slice(0, 6).map((p) => {
        const matchingLoc = (locations || []).find((l) => l.keyID === p.location_id);
        const hasPhoto = p.photo && p.photo.trim() !== "";
        return {
          src: hasPhoto ? p.photo : (matchingLoc?.image || ""),
          alt: matchingLoc?.name || "Your reaction"
        };
      })
      : (locations || []).slice(0, 6).map((l) => ({ src: l.image, alt: l.name }));

  return (
    <div className="intro" id="intro-screen">
      <div className="mobile-container">

        <header className="header-section">
          <div className="header-text-wrapper">
            <h1 className="welcome-text">
              HI{" "}
            </h1>
            <span className="name-handwritten">
              {session?.photo_name
                ? <img src={session.photo_name} alt="your name" style={{ width: '50%', height: '50%', objectFit: 'cover' }} />
                : "Traveler"}
            </span>
          </div>
          <p className="subtitle">{session?.traveler_type?.name || "Explorer"}</p>
        </header>

        <main className="collage-container">
          <div className="ticker-tape">
            <span>Welcome to Antwerp • Welcome to Antwerp • Welcome to Antwerp</span>
          </div>

          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`polaroid polaroid-${i}`}>
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

          <Link to={`/map?user=${userId || ''}`} className="intro__button" id="enter-button">
            Let's discover your taste
          </Link>
        </main>
      </div>
    </div>
  );
}