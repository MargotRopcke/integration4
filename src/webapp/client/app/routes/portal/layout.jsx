import { Outlet } from 'react-router';

export default function PortalLayout() {
    return (
        <div className="portal-shell">
            <Outlet />
        </div>
    );
}