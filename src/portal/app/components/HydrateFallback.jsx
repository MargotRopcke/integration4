const styles = {
    page: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#0a0a0f",
        color: "#e8e8ed",
        fontFamily: "'Inter', sans-serif",
    },
};

export function HydrateFallback() {
    return (
        <div style={styles.page}>
            <p>Loading...</p>
        </div>
    );
}