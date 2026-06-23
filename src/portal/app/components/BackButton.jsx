export function BackButton({ onClick }) {
    return (
        <button className="btn-back-top" onClick={onClick} aria-label="Go back">
            <img src="../../assets/icons/back.svg" alt="back arrow" />
        </button>
    );
}