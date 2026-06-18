/**
 * Dot progress indicator.
 * Usage: <StepProgress current={1} total={6} />
 * Pass the 1-based step number and total number of steps.
 */
export function StepProgress({ current, total }) {
    return (
        <div className="step-progress">
            {Array.from({ length: total }, (_, i) => (
                <div
                    key={i}
                    className={`step-progress__dot ${i + 1 === current ? "step-progress__dot--active" : ""}`}
                />
            ))}
        </div>
    );
}