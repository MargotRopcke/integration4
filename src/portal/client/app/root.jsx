import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import "./app.css";

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="description" content="The Portal — Discover 6 hidden locations in Antwerp" />
        <Meta />
        <Links />
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js" crossOrigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossOrigin="anonymous"></script>
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

export function ErrorBoundary({ error }) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0a0a0f",
      color: "#e8e8ed",
      fontFamily: "'Inter', sans-serif",
      padding: "2rem",
      textAlign: "center",
    }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>{message}</h1>
      <p style={{ color: "#9191a8" }}>{details}</p>
      {stack && (
        <pre style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#12121a",
          borderRadius: "8px",
          overflow: "auto",
          maxWidth: "100%",
          fontSize: "0.8rem",
        }}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function HydrateFallback() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "#0a0a0f",
      color: "#e8e8ed",
      fontFamily: "'Inter', sans-serif",
    }}>
      <p>Loading...</p>
    </div>
  );
}

export function meta() {
  return [{ title: "The Portal — Discover Antwerp" }];
}
