import { useState } from "react";
import { Outlet, Link, useOutletContext } from "react-router";
import "./detail-panel.css";

const DetailPanel = () => {
  const [expanded, setExpanded] = useState(false);
  // Get context from parent (map.jsx), which includes userPosition
  const parentContext = useOutletContext() || {};

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <div
      className={`detail-panel ${expanded ? "detail-panel--expanded" : "detail-panel--collapsed"}`}
      data-testid="detail-panel"
      id="detail-panel"
    >
      {/* Drag handle to toggle expand/collapse */}
      <div className="detail-panel__handle" onClick={toggleExpand}>
        <div className="detail-panel__handle-bar" />
      </div>

      {/* Close button */}
      <Link to="/map" className="detail-panel__close" id="close-panel">
        ×
      </Link>

      {/* Content area — renders location-detail.jsx */}
      <div className="detail-panel__wrapper" onClick={!expanded ? toggleExpand : undefined}>
        <Outlet context={{ ...parentContext, expanded }} />
      </div>
    </div>
  );
};

export default DetailPanel;
