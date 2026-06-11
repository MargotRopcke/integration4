import { Header } from "./Header";
import { NewItemInput } from "./NewItemInput";
import { FolderItem } from "./FolderItem";
import { NoteItem } from "./NoteItem";

export const Sidebar = ({
  darkMode,
  toggleDarkMode,
  folders,
  notes,
  activeFolder,
}) => {
  return (
    <div className="app__sidebar">
      {toggleDarkMode && (
        <Header
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          title="NotePad"
        />
      )}

      {folders && (
        <div className="app__folders">
          <div className="app__section-header">
            <h2 className="app__section-title">Folders</h2>
            <NewItemInput placeholder="Folder name" action="folder/create" />
          </div>

          {folders.length > 0 ? (
            <ul className="app__folder-list" data-testid="folder-list">
              {folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </ul>
          ) : (
            <div className="app__empty-state" data-testid="empty-folders">
              <p>No folders yet. Create your first folder to get started!</p>
            </div>
          )}
        </div>
      )}

      {activeFolder && (
        <div className="app__notes">
          <div className="app__section-header">
            <h2 className="app__section-title">Notes</h2>
            {activeFolder && (
              <NewItemInput placeholder="Note title" action="note/create" />
            )}
          </div>

          {notes.length > 0 ? (
            <ul className="app__note-list" data-testid="note-list">
              {notes.map((note) => (
                <NoteItem key={note.id} note={note} folderId={activeFolder} />
              ))}
            </ul>
          ) : (
            <div className="app__empty-state" data-testid="empty-notes">
              <p>No notes yet. Create your first note to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
