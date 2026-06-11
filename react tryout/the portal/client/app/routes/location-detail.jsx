import { useOutletContext } from "react-router";
import { getLocation, calculateDistance, formatDistance } from "../data";
import "./location-detail.css";

export const clientLoader = async ({ params }) => {
  const { locationId } = params;
  const location = await getLocation(locationId);
  return { location };
};

export default function LocationDetail({ loaderData }) {
  const { location } = loaderData;
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

  return (
    <div className="location-detail" id="location-detail">
      {/* === COLLAPSED VIEW: always visible === */}
      <div className="location-detail__summary">
        {/* Photo */}
        {location.image && (
          <div className="location-detail__image-wrapper">
            <img
              src={location.image}
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
            <span className="location-detail__distance-icon">📍</span>
            <span>{distanceText}</span>
          </div>
        </div>

        {/* Expand hint */}
        {!expanded && (
          <div className="location-detail__hint">
            <span className="location-detail__hint-text">Tap for details</span>
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
                  <span className="location-detail__maps-icon">🗺️</span>
                  Navigate with Google Maps
                  <span className="location-detail__maps-arrow">↗</span>
                </a>
              )}
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
