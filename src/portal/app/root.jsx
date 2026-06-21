import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";

import { MEDIAPIPE_SCRIPTS } from "./constants/scripts";
import "./style/fonts.css";
import "./style/root.css";
import "./style/base.css";
import "./style/globals.css";

export { ErrorBoundary } from "./components/ErrorBoundary";
export { HydrateFallback } from "./components/HydrateFallback";

export function meta() {
  return [{ title: "The Portal — Discover Antwerp" }];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="The Portal — Discover 6 hidden locations in Antwerp" />
        <Meta />
        <Links />
        {MEDIAPIPE_SCRIPTS.map((src) => (
          <script key={src} src={src} crossOrigin="anonymous" />
        ))}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}