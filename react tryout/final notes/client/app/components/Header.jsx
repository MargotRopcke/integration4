import { Link } from "react-router";

export const Header = ({ darkMode, toggleDarkMode, title }) => {
  return (
    <div className="app__header">
      <h1>
        <Link to="/" className="app__title">
          {title}
        </Link>
      </h1>
      <button
        className="app__dark-mode-toggle"
        onClick={toggleDarkMode}
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </div>
  );
};
