import { useState } from "react";
import { Form, useFetcher } from "react-router";
import Lane from "../Lane/Lane";
import "./Board.css";

const Board = ({ lanes }) => {
  let fetcher = useFetcher();
  const [showNewLaneForm, setShowNewLaneForm] = useState(false);

  const onCardMove = async (cardId, targetLaneId) => {
    fetcher.submit(
      { cardId: cardId, targetLaneId: targetLaneId },
      { action: "/", method: "post" }
    );
  };

  const handleToggleNewLaneForm = () => {
    setShowNewLaneForm(!showNewLaneForm);
  };

  const handleNewLaneSubmit = () => {
    setShowNewLaneForm(false);
  };

  return (
    <div className="board">
      {lanes.map((lane) => (
        <Lane key={lane.id} lane={lane} onCardMove={onCardMove} />
      ))}

      {showNewLaneForm ? (
        <div className="board__new-lane">
          <Form
            method="post"
            action="/createlane"
            className="board__new-lane-form"
            onSubmit={handleNewLaneSubmit}
          >
            <input
              type="text"
              name="title"
              autoFocus
              placeholder="Enter lane name"
              className="board__new-lane-input"
              required
            />
            <div className="board__new-lane-actions">
              <button type="submit" className="board__new-lane-submit">
                Add Lane
              </button>
              <button
                type="button"
                className="board__new-lane-cancel"
                onClick={handleToggleNewLaneForm}
              >
                Cancel
              </button>
            </div>
          </Form>
        </div>
      ) : (
        <button
          className="board__add-lane"
          onClick={handleToggleNewLaneForm}
          type="button"
        >
          + Add Lane
        </button>
      )}
    </div>
  );
};

export default Board;
