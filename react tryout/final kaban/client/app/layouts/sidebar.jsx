import { Link, Outlet } from "react-router";
import "./sidebar.css";

const Sidebar = () => {
  return (
    <div className="drawer" data-testid="drawer">
      <div className="drawer__content">
        <Link to={`/`} className="drawer__close">
          &times;
        </Link>
        <div className="drawer__body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
