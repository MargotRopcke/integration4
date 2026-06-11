import { useState } from "react";
import { Link } from "react-router";
import Card from "../Card/Card";
import "./Lane.css";

const Lane = ({ lane, onCardMove }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault(); // Allow drop
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Only consider it a leave if we're leaving the lane, not entering a child
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData("cardId");

    setIsOver(false);
    onCardMove(cardId, lane.id);
  };

  const laneClass = `lane ${isOver ? "lane--drop-target" : ""}`;

  return (
    <div
      className={laneClass}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="lane__header">
        <h2 className="lane__title">{lane.title}</h2>
        <span className="lane__count">{lane.cards.length}</span>
      </div>
      <ul className="lane__body">
        {lane.cards.map((card) => (
          <li key={card.id}>
            <Card card={card} />
          </li>
        ))}
      </ul>
      <div className="lane__footer">
        <Link to={`/createCard/${lane.id}`} className="lane__add-button">
          + Add a card
        </Link>
      </div>
    </div>
  );
};

export default Lane;
