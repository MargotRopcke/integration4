import { useOutletContext } from "react-router";
import { getLocation, getReactionPhoto, calculateDistance, formatDistance } from "../data";
import "./location-detail.css";

export const clientLoader = async ({ request, params }) => {
  const { locationId } = params;
  const userId = new URL(request.url).searchParams.get("user");

  const [location, reactionPhoto] = await Promise.all([
    getLocation(locationId),
    userId ? getReactionPhoto(userId, locationId) : Promise.resolve(null),
  ]);

  return { location, reactionPhoto };
};

export default function LocationDetail({ loaderData }) {
  const { location, reactionPhoto } = loaderData;
  // Get merged context from detail-panel layout (expanded + userPosition from map)
  const context = useOutletContext() || {};
  const { expanded = false, userPosition } = context;

  if (!location) {
    return (
      <div className="location-detail" id="location-detail">
        <p className="location-detail__error">Location not found.</p>
      </div>
    );
  }

  // Calculate distance from user to this location
  let distanceText = "—";
  if (userPosition && location.latitude && location.longitude) {
    const dist = calculateDistance(
      userPosition.lat,
      userPosition.lng,
      parseFloat(location.latitude),
      parseFloat(location.longitude)
    );
    distanceText = formatDistance(dist);
  }

  // Google Maps navigation link
  const googleMapsUrl = location.latitude && location.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : location.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`
      : null;

  let imageSource = location.image;
  if (reactionPhoto) {
    imageSource = reactionPhoto;
  }
  return (
    <div className="location-detail" id="location-detail">
      {/* === COLLAPSED VIEW: always visible === */}
      <div className="location-detail__summary">
        {/* Photo */}
        {imageSource && (
          <div className="location-detail__image-wrapper">
            <img
              src={imageSource}
              alt={location.name}
              className="location-detail__image"
              loading="lazy"
            />
          </div>
        )}

        {/* Name & distance */}
        <div className="location-detail__info">
          <h2 className="location-detail__name">{location.name}</h2>
          <div className="location-detail__distance">
            <span className="location-detail__distance-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
              <path d="M9.40727 5.59188C10.816 5.59188 11.9532 4.4547 11.9532 3.04594C11.9532 1.63719 10.816 0.5 9.40727 0.5C7.99852 0.5 6.86133 1.63719 6.86133 3.04594C6.86133 4.4547 7.99852 5.59188 9.40727 5.59188Z" stroke="#144552" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M14.5156 10.5564C14.2355 9.91143 13.4802 9.62289 12.8437 9.90294C12.1733 10.2933 11.3671 10.3612 10.6457 10.0812C8.7872 9.07127 10.5778 7.62008 8.57503 6.94965C4.94282 5.73608 1.90468 6.69506 0.58079 10.3188C0.419547 10.7431 0.504412 11.2268 0.792952 11.5833C1.08149 11.9397 1.54823 12.1009 1.99802 12.0246C2.4478 11.9482 2.82122 11.6257 2.97398 11.2014C3.20312 10.3273 3.80565 9.58895 4.61186 9.1816C5.19743 8.96943 5.84241 8.95246 6.44495 9.1137L3.12673 18.33C2.90608 18.9835 3.25403 19.6963 3.899 19.934C4.55246 20.1716 5.27382 19.8406 5.51992 19.1956L7.46331 13.7982L7.08143 14.859L8.64294 19.1956C8.78721 19.6369 9.16061 19.9594 9.61888 20.0443C10.0771 20.1291 10.5354 19.9594 10.8324 19.6115C11.1295 19.255 11.2058 18.7713 11.0446 18.3385L8.89752 11.9567C9.06725 12.1009 9.24548 12.2282 9.44067 12.3386C10.8494 13.026 12.4958 12.992 13.8791 12.2622C14.1846 12.1264 14.4307 11.8718 14.558 11.5578C14.6853 11.2438 14.6768 10.8959 14.541 10.5819L14.5156 10.5564Z" stroke="#144552" stroke-linecap="round" stroke-linejoin="round" />
            </svg></span>
            <p>{distanceText}</p>
          </div>
        </div>

        {/* Expand hint */}
        {!expanded && (
          <div className="location-detail__hint">

            <span className="location-detail__hint-chevron">▲</span>
          </div>
        )}
      </div>

      {/* === EXPANDED VIEW: only visible when expanded === */}
      {expanded && (
        <div className="location-detail__expanded">
          {/* Divider */}
          <div className="location-detail__divider" />

          {/* Address & Google Maps */}
          {location.address && (
            <div className="location-detail__section">
              <h3 className="location-detail__section-title">Address</h3>
              <p className="location-detail__address">{location.address}</p>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="location-detail__maps-link"
                  id="google-maps-link"
                >

                  Navigate with Google Maps
                  <span className="location-detail__maps-arrow">↗</span>
                </a>
              )}
            </div>
          )}

          {/* Specialization Category Image */}
          {location.specialization_categories?.image && (
            <div className="location-detail__section" id="location-specialization">
              <h3 className="location-detail__section-title">Specialization</h3>
              <div className="location-detail__specialization-image-wrapper">
                <img
                  src={location.specialization_categories.image}
                  alt={location.specialization_categories.name || "Specialization"}
                  className="location-detail__specialization-image"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Quote */}
          {location.quote && (
            <div className="location-detail__section">
              <h3 className="location-detail__section-title">Quote</h3>
              <blockquote className="location-detail__quote">
                "{location.quote}"
              </blockquote>
            </div>
          )}

          {/* Price */}
          {location.price && (
            <div className="location-detail__section">
              <h3 className="location-detail__section-title">Price</h3>
              <p className="location-detail__price">{location.price}</p>
            </div>
          )}

          {/* Vibe categories */}
          <div className="location-detail__section">
            <h3 className="location-detail__section-title">Vibes</h3>
            {location.primary_category_id ? (
              <div className="location-detail__vibes">
                <span className="location-detail__vibe-tag">
                  {location.primary_category_id}
                </span>
              </div>
            ) : (
              <p className="location-detail__coming-soon">Coming soon</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
