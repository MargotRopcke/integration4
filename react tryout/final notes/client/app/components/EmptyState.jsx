import "./EmptyState.css";

export const EmptyState = ({
  icon = "📝",
  title = "No Note Selected",
  message = "Select a note from the sidebar or create a new one.",
}) => {
  return (
    <div className="app__empty-state">
      <div className="app__empty-content">
        <span className="app__empty-icon">{icon}</span>
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};
