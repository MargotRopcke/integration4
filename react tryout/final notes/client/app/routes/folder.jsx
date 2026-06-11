import { Outlet } from "react-router";
import { getNotesByFolderId } from "../services/notes";
import { Sidebar } from "../components/Sidebar";

export const clientLoader = async ({ params }) => {
  const { folderId } = params;
  return {
    activeFolder: folderId,
    notes: folderId ? await getNotesByFolderId(folderId) : [],
  };
};

const FolderRoute = ({ loaderData }) => {
  const { activeFolder, notes } = loaderData;
  return (
    <div className="app">
      <Sidebar notes={notes} activeFolder={activeFolder} />
      <div className="app__content">
        <Outlet />
      </div>
    </div>
  );
};

export default FolderRoute;
