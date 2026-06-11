import { EmptyState } from "../components/EmptyState";

const HomeRoute = () => {
  return <EmptyState
    icon="📁"
    title="No Folder Selected"
    message="Select a folder to view its notes or create a new one."
  />;
};

export default HomeRoute;
