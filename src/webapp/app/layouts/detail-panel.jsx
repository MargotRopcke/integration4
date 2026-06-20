import { useState, useRef } from "react";
import { Outlet, Link, useOutletContext, useNavigate, useParams } from "react-router";
import "./detail-panel.css";

const DetailPanel = () => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { locationId } = useParams();
  // Get context from parent (map.jsx), which includes userPosition, userId, and locations
  const parentContext = useOutletContext() || {};
  const { locations, userId } = parentContext;

  const currentIndex = (locations || []).findIndex(
    (l) => String(l.id) === String(locationId)
  );

  const navigateToLocation = (direction) => {
    if (!locations || locations.length === 0 || currentIndex === -1) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentIndex + 1) % locations.length;
    } else {
      newIndex = (currentIndex - 1 + locations.length) % locations.length;
    }

    const nextLoc = locations[newIndex];
    const userParam = userId ? `?user=${userId}` : "";
    navigate(`/map/${nextLoc.id}${userParam}`);
  };

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = touchStartY.current - touchEndY.current;
    const swipeThreshold = 40; // responsiveness threshold

    // Determine if the gesture was primarily horizontal or vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > swipeThreshold) {
        if (diffX > 0) {
          navigateToLocation("next");
        } else {
          navigateToLocation("prev");
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > swipeThreshold) {
        if (diffY > 0) {
          // Swiped up -> Expand
          setExpanded(true);
        } else {
          // Swiped down -> Collapse
          setExpanded(false);
        }
      }
    }
  };

  const activeLoc = locations?.[currentIndex];

  const panelStyle = !expanded && activeLoc?.image
    ? {
        backgroundImage: `url(${activeLoc.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {};

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <>
      {expanded && (
        <div
          className="detail-panel__overlay"
          onClick={() => setExpanded(false)}
        />
      )}
      <div
        className={`detail-panel ${expanded ? "detail-panel--expanded" : "detail-panel--collapsed"}`}
        style={panelStyle}
        data-testid="detail-panel"
        id="detail-panel"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Visual swiper pagination (drawn above the panel sheet) */}
        {locations && locations.length > 0 && (
          <div className="detail-panel__pagination" id="panel-pagination">
            {locations.map((loc, i) => (
              <span
                key={loc.id}
                className={`detail-panel__pagination-dot${
                  i === currentIndex ? " detail-panel__pagination-dot--active" : ""
                }`}
              />
            ))}
          </div>
        )}

        {/* Drag handle to toggle expand/collapse */}
        <div className="detail-panel__handle" onClick={toggleExpand}>
          <div className="detail-panel__handle-bar" />
        </div>

        {/* 1/3 image banner on top when expanded */}
        {expanded && activeLoc?.image && (
          <div className="detail-panel__banner">
            <img src={activeLoc.image} alt={activeLoc.name} />
          </div>
        )}

        {/* Content area — renders location-detail.jsx */}
        <div className="detail-panel__wrapper" onClick={!expanded ? toggleExpand : undefined}>
          <Outlet context={{ ...parentContext, expanded }} />
        </div>
      </div>
    </>
  );
};

export default DetailPanel;

