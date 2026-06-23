import "./StepBudgetDistance.css";
import { FormStepLayout } from "../layouts/FormStepLayout";

const WalkIcon = () => (
  <svg width="51" height="69" viewBox="0 0 51 69" fill="none" xmlns="http://www.w3.org/2000/svg" className="bd-btn__icon">
    <path d="M31.586 18.9161C36.2661 18.9161 40.044 15.1382 40.044 10.458C40.044 5.77792 36.2661 2 31.586 2C26.9059 2 23.1279 5.77792 23.1279 10.458C23.1279 15.1382 26.9059 18.9161 31.586 18.9161Z" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M48.562 35.408C47.6316 33.2653 45.1224 32.3067 43.0079 33.2371C40.7806 34.534 38.1022 34.7595 35.7058 33.8292C29.5314 30.4741 35.4803 25.653 28.8266 23.4258C16.7598 19.3941 6.66658 22.58 2.2684 34.6186C1.73272 36.0282 2.01466 37.6353 2.97323 38.8194C3.93181 40.0035 5.48241 40.5392 6.97666 40.2855C8.47091 40.0317 9.71149 38.9604 10.219 37.5507C10.9802 34.6468 12.9819 32.1939 15.6603 30.8407C17.6056 30.1358 19.7484 30.0794 21.7501 30.6151L10.7264 61.2332C9.99341 63.4041 11.1493 65.7724 13.2921 66.5618C15.4629 67.3512 17.8594 66.2516 18.677 64.1089L25.1333 46.1779L23.8646 49.7021L29.0522 64.1089C29.5315 65.575 30.772 66.6463 32.2944 66.9283C33.8169 67.2102 35.3393 66.6463 36.3261 65.4904C37.3128 64.3063 37.5666 62.6992 37.0309 61.2614L29.898 40.0599C30.4618 40.5392 31.0539 40.9621 31.7024 41.3286C36.3825 43.6123 41.852 43.4995 46.4475 41.0749C47.4625 40.6238 48.2801 39.778 48.703 38.7348C49.1259 37.6917 49.0977 36.5357 48.6466 35.4926L48.562 35.408Z" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BikeIcon = () => (
  <svg width="98" height="61" viewBox="0 0 98 61" fill="none" xmlns="http://www.w3.org/2000/svg" className="bd-btn__icon">
    <g clipPath="url(#clip0_3659_8396)">
      <path d="M18.3753 58.9667C27.3995 58.9667 34.7087 51.6873 34.7087 42.7C34.7087 33.7127 27.3995 26.4333 18.3753 26.4333C9.35116 26.4333 2.04199 33.7127 2.04199 42.7C2.04199 51.6873 9.35116 58.9667 18.3753 58.9667Z" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M79.6253 58.9667C88.6495 58.9667 95.9587 51.6873 95.9587 42.7C95.9587 33.7127 88.6495 26.4333 79.6253 26.4333C70.6012 26.4333 63.292 33.7127 63.292 42.7C63.292 51.6873 70.6012 58.9667 79.6253 58.9667Z" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M44.9167 42.7001L68.11 11.5901L36.75 22.3667L18.375 42.7001H44.9167ZM44.9167 42.7001L31.6458 10.1667" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M79.6249 42.7001L66.1091 6.18145C65.9049 5.65278 65.9457 5.04278 66.2315 4.51411C66.5174 3.98545 66.9666 3.61945 67.5382 3.49745L73.4999 2.03345" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26.542 10.1667H38.792" stroke="#FDFEEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_3659_8396">
        <rect width="98" height="61" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const TramIcon = () => (
  <svg width="60" height="66" viewBox="0 0 60 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="bd-btn__icon">
    <g clipPath="url(#clip0_3659_8407)">
      <path d="M50.454 53.625C50.454 55.1375 49.2267 56.375 47.7267 56.375H12.2722C10.7722 56.375 9.54492 55.1375 9.54492 53.625V34.375L10.9086 17.875C10.9086 14.85 13.3631 12.375 16.3631 12.375H43.6358C46.6358 12.375 49.0904 14.85 49.0904 17.875L50.454 34.375V53.625Z" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50.454 34.375H9.54492" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M24.5449 12.375V1.375" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M35.4541 12.375V1.375" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17.7266 1.375H42.272" stroke="#FDFEEF" stroke-width="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.4542 49.5C22.7178 49.5 24.5451 47.6575 24.5451 45.375C24.5451 43.0925 22.7178 41.25 20.4542 41.25C18.1906 41.25 16.3633 43.0925 16.3633 45.375C16.3633 47.6575 18.1906 49.5 20.4542 49.5Z" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M39.545 49.5C41.8086 49.5 43.6359 47.6575 43.6359 45.375C43.6359 43.0925 41.8086 41.25 39.545 41.25C37.2814 41.25 35.4541 43.0925 35.4541 45.375C35.4541 47.6575 37.2814 49.5 39.545 49.5Z" stroke="#FDFEEF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.9996 56.375L1.36328 64.625" stroke="#FDFEEF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M45 56.375L58.6364 64.625" stroke="#FDFEEF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    <defs>
      <clipPath id="clip0_3659_8407">
        <rect width="60" height="66" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const BUDGET_OPTIONS = [
  { value: "€ (≤30)", label: "€", sub: "≤30" },
  { value: "€€ (≤60)", label: "€€", sub: "≤60" },
  { value: "€€€ (≥60)", label: "€€€", sub: "≥60" },
];

const DISTANCE_OPTIONS = [
  { value: "walk (0-2km)", label: "walking", sub: "0-2km", icon: <WalkIcon /> },
  { value: "bike (2-5km)", label: "bike", sub: "2-5km", icon: <BikeIcon /> },
  { value: "tram (if possible)", label: "tram", sub: "if possible", icon: <TramIcon /> },
];

export function StepBudgetDistance({ budget, distance, onBudget, onDistance, onNext, onBack }) {

  const handleBudget = (val) => {
    onBudget(val);
    if (distance) setTimeout(() => onNext(), 400);
  };

  const handleDistance = (val) => {
    onDistance(val);
    if (budget) setTimeout(() => onNext(), 400);
  };

  return (
    <FormStepLayout id="step-5" current={5} onBack={onBack} title={"Shape the path to where you want to be."}>
      <div className="sticker-money-container">
        <img className="sticker-money" src="../../assets/money.png" alt="money sticker" />
      </div>
      <div className="bd-container">

        {/* ── BUDGET ── */}
        <div className="bd-group">
          <span className="bd-group-title">Budget /p.p.</span>
          <div className="bd-options-row">
            {BUDGET_OPTIONS.map((opt) => (
              <div key={opt.value} className="bd-option-wrap">
                <button
                  onClick={() => handleBudget(opt.value)}
                  className={`bd-btn ${budget === opt.value ? "bd-btn--active" : ""}`}
                  id={`budget-${opt.label.toLowerCase()}`}
                >
                  {opt.label}
                </button>
                <span className="bd-sub">{opt.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISTANCE ── */}
        <div className="bd-group">
          <span className="bd-group-title">Distance</span>
          <div className="bd-options-row">
            {DISTANCE_OPTIONS.map((opt) => (
              <div key={opt.value} className="bd-option-wrap">
                <button
                  onClick={() => handleDistance(opt.value)}
                  className={`bd-btn bd-btn--icon ${distance === opt.value ? "bd-btn--active" : ""}`}
                  id={`distance-${opt.label}`}
                >
                  {opt.icon}
                  <span className="bd-btn__label">{opt.label}</span>
                </button>
                <span className="bd-sub">{opt.sub}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
      <div className="sticker-distance-container">
        <img className="sticker-distance" src="../../assets/distance.svg" alt="distance sticker" />
      </div>
    </FormStepLayout>
  );
}