import "./StepIntro.css";
export function StepIntro({ onStart }) {
  return (
    <div className="step-intro" id="step-0">
      <div className="intro-portal-icon">

      </div>
      <h1 className="intro-heading">The Portal</h1>
      <p className="intro-subheading">
        One step and you enter your version of Antwerp.</p>
      <button className="btn-intro" onClick={onStart} style={{ marginTop: "2rem" }} id="start-button">
        Click screen to start
      </button>
      <svg xmlns="http://www.w3.org/2000/svg" width="89" height="130" viewBox="0 0 89 130" fill="none">
        <path d="M57.7903 67.4047C71.0966 59.0718 77.2295 43.0513 72.7941 28.1598C68.3587 13.2682 54.45 3 38.6248 3C22.7996 3 8.89101 13.2682 4.45558 28.1598C0.0201405 43.0513 6.15303 59.0718 19.4593 67.4047" stroke="#FDFEEF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M25.7594 126.703L4.89638 102.081C1.99418 98.6401 2.48702 93.5867 5.93681 90.7374C9.44135 87.8881 14.5886 88.3719 17.4908 91.7588L30.3043 106.973V54.1267C30.3043 49.6646 33.9731 46.0626 38.5181 46.0626C43.063 46.0626 46.7318 49.6646 46.7318 54.1267V89.0708H63.1594C75.261 89.0708 85.0628 98.6939 85.0628 110.575V126.703" stroke="#FDFEEF" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  );
}
