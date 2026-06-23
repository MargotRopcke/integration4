import { useLoaderData, Link } from "react-router";
import { getSessionLocations } from '../data';
import { NoUserFallback } from "../components/NoUserFallback";
import "./intro.css";

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
  const polaroidSources = (
    sessionPhotos && sessionPhotos.length > 0
      ? sessionPhotos.slice(0, 6).map((p) => {
        const matchingLoc = (locations || []).find((l) => l.keyID === p.location_id);
        const hasPhoto = p.photo && p.photo.trim() !== "";
        return {
          src: hasPhoto ? p.photo : (matchingLoc?.image || ""),
          alt: matchingLoc?.name || "Your reaction"
        };
      })
      : (locations || []).slice(0, 6).map((l) => ({ src: l.image, alt: l.name }))
  ).filter((item) => item.src && item.src.trim() !== "");

  return (
    <div className="intro" id="intro-screen">
      <div className="mobile-container">

        <header className="header-section">
          <div className="header-text-wrapper">
            <h1 className="welcome-text">
              hi
            </h1>
            {session?.photo_name
              ? <img className="welcome-name" src={session.photo_name} alt="your name" />
              : "Traveler"}
          </div>
          <p className="subtitle">The {session?.traveler_type?.name || "Explorer"}</p>
        </header>

        <div className="banner">
          <div className="banner-track">
            <span>Welcome to Antwerp</span>
            <span>Welcome to Antwerp</span>
            <span>Welcome to Antwerp</span>
            <span>Welcome to Antwerp</span>
          </div>
        </div>

        <main className="collage-container">
          {polaroidSources.map((source, i) => (
            <div key={i} className={`polaroid polaroid-${i}`}>
              <div className="polaroid-img-wrapper">
                <img
                  src={source.src}
                  alt={source.alt}
                />
              </div>
            </div>
          ))}

          <div className="type-icon">
            {session?.primary_category?.image && (
              <img
                src={session.primary_category.image}
                alt={session.primary_category.name || "Category Icon"}
              />
            )}
          </div>
        </main>

        <footer>
          <Link to={`/map?user=${userId || ''}`} className="intro__button" id="enter-button">
            Let's discover your taste
          </Link>
        </footer>
      </div>
    </div>
  );
}