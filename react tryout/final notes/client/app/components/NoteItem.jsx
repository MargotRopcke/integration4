import { NavLink } from "react-router";
import "./ItemStyles.css";

export const NoteItem = ({ note, folderId }) => {
  return (
    <li className="app__item">
      <NavLink
        to={`/${folderId}/${note.id}`}
        className="app__item-link app__item-link--note"
      >
        <div className="app__item-name">
          <span className="app__item-icon">📝</span>
          {note.title}
        </div>
        <div className="app__item-note-preview">
          {note.content.substring(0, 50)}...
        </div>
      </NavLink>
    </li>
  );
};
