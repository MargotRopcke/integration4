import { NavLink } from "react-router";
import "./ItemStyles.css";

export const FolderItem = ({ folder }) => {
  return (
    <li className="app__item">
      <NavLink
        to={`/${folder.id}`}
        className="app__item-link app__item-link--folder"
      >
        <span className="app__item-name">
          <span className="app__item-icon">📁</span>
          {folder.name}
        </span>
      </NavLink>
    </li>
  );
};
