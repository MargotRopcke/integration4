import { useOutletContext } from "react-router";
import { getLocation, getReactionPhoto, calculateDistance, formatDistance } from "../data";
import "./location-detail.css";

export const clientLoader = async ({ request, params }) => {
  const { locationId } = params;
  let userId = new URL(request.url).searchParams.get("user");

  if (userId) {
    localStorage.setItem('portal_user_id', userId);
  } else {
    userId = localStorage.getItem('portal_user_id');
  }

  const [location, reactionPhoto] = await Promise.all([
    getLocation(locationId),
    userId ? getReactionPhoto(userId, locationId) : Promise.resolve(null),
  ]);

  return { location, reactionPhoto };
};

export default function LocationDetail({ loaderData }) {
  const { location, reactionPhoto } = loaderData;
  const context = useOutletContext() || {};
  const { expanded = false, userPosition } = context;

  if (!location) {
    return (
      <div className="location-detail" id="location-detail">
        <p className="location-detail__error">Location not found.</p>
      </div>
    );
  }

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

  const googleMapsUrl = location.latitude && location.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
    : location.address
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location.address)}`
      : null; return (
        <div className="location-detail" id="location-detail">
          {!expanded ? (
            <div className="location-detail__summary">
              <div className="location-detail__info">
                <h2 className="location-detail__name">{location.name}</h2>
                <div className="location-detail__distance">
                  <span className="location-detail__distance-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
                      <path d="M9.40727 5.59188C10.816 5.59188 11.9532 4.4547 11.9532 3.04594C11.9532 1.63719 10.816 0.5 9.40727 0.5C7.99852 0.5 6.86133 1.63719 6.86133 3.04594C6.86133 4.4547 7.99852 5.59188 9.40727 5.59188Z" stroke="#144552" stroke-linecap="round" stroke-linejoin="round" />
                      <path d="M14.5156 10.5564C14.2355 9.91143 13.4802 9.62289 12.8437 9.90294C12.1733 10.2933 11.3671 10.3612 10.6457 10.0812C8.7872 9.07127 10.5778 7.62008 8.57503 6.94965C4.94282 5.73608 1.90468 6.69506 0.58079 10.3188C0.419547 10.7431 0.504412 11.2268 0.792952 11.5833C1.08149 11.9397 1.54823 12.0246 1.99802 12.0246C2.4478 11.9482 2.82122 11.6257 2.97398 11.2014C3.20312 10.3273 3.80565 9.58895 4.61186 9.1816C5.19743 8.96943 5.84241 8.95246 6.44495 9.1137L3.12673 18.33C2.90608 18.9835 3.25403 19.6963 3.899 19.934C4.55246 20.1716 5.27382 19.8406 5.51992 19.1956L7.46331 13.7982L7.08143 14.859L8.64294 19.1956C8.78721 19.6369 9.16061 19.9594 9.61888 20.0443C10.0771 20.1291 10.5354 19.9594 10.8324 19.6115C11.1295 19.255 11.2058 18.7713 11.0446 18.3385L8.89752 11.9567C9.06725 12.1009 9.24548 12.2282 9.44067 12.3386C10.8494 13.026 12.4958 12.992 13.8791 12.2622C14.1846 12.1264 14.4307 11.8718 14.558 11.5578C14.6853 11.2438 14.6768 10.8959 14.541 10.5819L14.5156 10.5564Z" stroke="#144552" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <p className="location-detail__distance-text">{distanceText}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="location-detail__expanded">
              <div className="location-detail__header-grid">
                <div className="location-detail__header">
                  <h2 className="location-detail__expanded-name">{location.name}</h2>
                  <div className="location-detail__expanded-info">
                    <div className="location-detail__expanded-info__vibe-tags">
                      {location.location_vibes && location.location_vibes.length > 0 && (
                        location.location_vibes.map((v, i) => (
                          <p key={i} className="location-detail__vibe-tag">
                            {v.vibe_categories?.name}
                          </p>
                        ))
                      )}
                    </div>

                    <div className="location-detail__vibe-tag location-detail__vibe-tag--distance">
                      <span className="location-detail__distance-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="21" viewBox="0 0 16 21" fill="none">
                          <path d="M9.40727 5.59188C10.816 5.59188 11.9532 4.4547 11.9532 3.04594C11.9532 1.63719 10.816 0.5 9.40727 0.5C7.99852 0.5 6.86133 1.63719 6.86133 3.04594C6.86133 4.4547 7.99852 5.59188 9.40727 5.59188Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                          <path d="M14.5156 10.5564C14.2355 9.91143 13.4802 9.62289 12.8437 9.90294C12.1733 10.2933 11.3671 10.3612 10.6457 10.0812C8.7872 9.07127 10.5778 7.62008 8.57503 6.94965C4.94282 5.73608 1.90468 6.69506 0.58079 10.3188C0.419547 10.7431 0.504412 11.2268 0.792952 11.5833C1.08149 11.9397 1.54823 12.0246 1.99802 12.0246C2.4478 11.9482 2.82122 11.6257 2.97398 11.2014C3.20312 10.3273 3.80565 9.58895 4.61186 9.1816C5.19743 8.96943 5.84241 8.95246 6.44495 9.1137L3.12673 18.33C2.90608 18.9835 3.25403 19.6963 3.899 19.934C4.55246 20.1716 5.27382 19.8406 5.51992 19.1956L7.46331 13.7982L7.08143 14.859L8.64294 19.1956C8.78721 19.6369 9.16061 19.9594 9.61888 20.0443C10.0771 20.1291 10.5354 19.9594 10.8324 19.6115C11.1295 19.255 11.2058 18.7713 11.0446 18.3385L8.89752 11.9567C9.06725 12.1009 9.24548 12.2282 9.44067 12.3386C10.8494 13.026 12.4958 12.992 13.8791 12.2622C14.1846 12.1264 14.4307 11.8718 14.558 11.5578C14.6853 11.2438 14.6768 10.8959 14.541 10.5819L14.5156 10.5564Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      </span>
                      <span className="location-detail__distance-text">{distanceText}</span>
                    </div>
                  </div>
                </div>

                {location.specialization_categories?.image && (
                  <div className="location-detail__specialization-badge">
                    <img
                      src={location.specialization_categories.image}
                      alt={location.specialization_categories.name || "Specialization"}
                    />
                  </div>
                )}
              </div>

              {location.quote && (
                <div className="location-detail__section">
                  <blockquote className="location-detail__quote">
                    "{location.quote}"
                  </blockquote>
                </div>
              )}

              {location.address && (
                <div className="location-detail__button">
                  {googleMapsUrl && (
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="location-detail__button-link"
                      id="google-maps-link"
                    >
                      <span className="location-detail__button-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <path d="M4.45605 0.0996094H23.543C25.9449 0.0996094 27.8995 2.05427 27.8994 4.45605V23.5439C27.8992 25.9456 25.9448 27.8994 23.543 27.8994H4.45605C2.05438 27.8994 0.099809 25.9456 0.0996094 23.5439V4.45605C0.0996177 2.05426 2.05427 0.0996094 4.45605 0.0996094ZM13.9287 15.2979L3.4248 25.8018L3.31934 25.9082L3.45703 25.9648C3.76502 26.0923 4.10245 26.1641 4.45605 26.1641H23.543C23.8966 26.1641 24.234 26.0923 24.542 25.9648L24.6807 25.9082L14 15.2275L13.9287 15.2979ZM4.45605 1.83594C3.01113 1.83594 1.83595 3.01115 1.83594 4.45605V23.5439C1.83597 23.8972 1.90686 24.2342 2.03418 24.542L2.0918 24.6807L2.19727 24.5752L13.377 13.3936L13.3799 13.3926L13.3848 13.3867L13.3926 13.3799L13.3936 13.377L16.8516 9.9209L16.9033 9.86914L16.8701 9.80469C16.1709 8.4403 15.6797 7.14575 15.6797 6.20996C15.6797 4.58181 16.3211 3.10143 17.3633 2.00488L17.5244 1.83594H4.45605ZM25.9775 11.1377C24.5491 13.588 22.7977 15.8908 22.4775 16.3066C22.3133 16.5199 22.0592 16.6445 21.79 16.6445C21.5208 16.6445 21.2669 16.5199 21.1025 16.3066C20.8008 15.9149 19.2252 13.8438 17.8486 11.5537L17.7832 11.4443L17.6924 11.5352L15.2979 13.9287L15.2275 14L25.9082 24.6807L25.9648 24.542C26.0922 24.2341 26.164 23.8974 26.1641 23.5439V10.8174L25.9775 11.1377ZM21.79 1.83594C19.3782 1.83594 17.415 3.79785 17.415 6.20996C17.415 6.61824 17.5709 7.16039 17.8242 7.77637C18.0787 8.39532 18.4368 9.09967 18.8535 9.83496C19.6871 11.3057 20.7581 12.909 21.709 14.2188L21.79 14.3301L21.8701 14.2188C22.8211 12.9091 23.8921 11.3057 24.7256 9.83496C25.1423 9.09967 25.5013 8.39532 25.7559 7.77637C26.0091 7.1605 26.1641 6.61819 26.1641 6.20996C26.1641 3.79799 24.202 1.83618 21.79 1.83594Z" fill="#FDF4E5" stroke="#E03C31" stroke-width="0.2" />
                          <path d="M8.25488 3.41309C9.47872 3.4131 10.6294 3.88954 11.4951 4.75488C11.834 5.09369 11.8339 5.64351 11.4951 5.98242C11.1562 6.32144 10.6066 6.32124 10.2676 5.98242C9.72987 5.44515 9.01472 5.14943 8.25488 5.14941C6.68505 5.14941 5.4082 6.42626 5.4082 7.99609C5.40831 9.56596 6.68511 10.8428 8.25488 10.8428C9.47205 10.8427 10.5126 10.0751 10.9189 8.99902L10.9707 8.86328H8.25488C7.77555 8.86328 7.38683 8.47529 7.38672 7.99609C7.38672 7.51681 7.77548 7.12793 8.25488 7.12793H11.9697C12.4491 7.12797 12.8379 7.51683 12.8379 7.99609C12.8378 10.5228 10.7816 12.5781 8.25488 12.5781C5.72819 12.5781 3.67191 10.5228 3.67188 7.99609C3.67188 5.46938 5.72817 3.41309 8.25488 3.41309Z" fill="#FDF4E5" stroke="#E03C31" stroke-width="0.2" />
                        </svg>
                      </span>
                      View route
                    </a>
                  )}
                </div>
              )}

              <div className="location-detail__spot-banner">
                <div className="location-detail__spot-banner-track">
                  <span>The spot</span>
                  <span>The spot</span>
                  <span>The spot</span>
                  <span>The spot</span>
                </div>
              </div>
            </div>
          )}
        </div>
      );
}
