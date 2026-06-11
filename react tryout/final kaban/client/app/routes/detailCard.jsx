import { Link } from "react-router";
import { fetchCard } from "../services/cards";
import "./detailCard.css";
import { getPriority } from "../utils";

export const clientLoader = async ({ params }) => {
  const { cardId } = params;

  const card = await fetchCard(cardId);
  return { card };
};

const DetailCard = ({ loaderData }) => {
  const { card } = loaderData;

  const currentPriority = getPriority(card.priority);

  return (
    <>
      <h2 className="drawer__title">{card.title}</h2>

      <div className="drawer__body">
        <p>{card.description}</p>

        <dl>
          <dt>Priority</dt>
          <dd>
            <div className="priority-display">
              <div
                className="priority-color-indicator"
                style={{ backgroundColor: currentPriority.color }}
              ></div>
              <span>{currentPriority.name}</span>
            </div>
          </dd>
        </dl>

        <div className="edit-link-container bottom-drawer-action">
          <Link to={`/${card.id}/edit`} className="edit-link">
            Edit Card
          </Link>
        </div>
      </div>
    </>
  );
};

export default DetailCard;
