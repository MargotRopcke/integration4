import { isRouteErrorResponse } from "react-router";

const styles = {
    page: {
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
    },
    heading: {
        fontSize: "3rem",
        marginBottom: "1rem",
    },
    detail: {
        color: "#9191a8",
    },
    stack: {
        marginTop: "2rem",
        padding: "1rem",
        background: "#12121a",
        borderRadius: "8px",
        overflow: "auto",
        maxWidth: "100%",
        fontSize: "0.8rem",
    },
};

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
    } else if (import.meta.env.DEV && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main style={styles.page}>
            <h1 style={styles.heading}>{message}</h1>
            <p style={styles.detail}>{details}</p>
            {stack && (
                <pre style={styles.stack}>
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}