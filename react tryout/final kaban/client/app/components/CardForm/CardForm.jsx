import { Form, useNavigate } from "react-router";
import PriorityDropdown from "../PriorityDropdown/PriorityDropdown";
import "./CardForm.css";

const CardForm = ({
  card = {
    title: "",
    description: "",
    priority: "none",
  },
  isCreating = false,
  laneId = null,
}) => {
  const navigate = useNavigate();

  return (
    <Form
      action={isCreating ? "" : "/updatecard"}
      method="post"
      className="card-edit-form"
    >
      {isCreating ? (
        <input type="hidden" name="laneId" value={laneId} />
      ) : (
        <input type="hidden" name="cardId" value={card.id} />
      )}

      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          defaultValue={card.title}
          required
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          defaultValue={card.description}
          className="form-control"
          rows="6"
        ></textarea>
      </div>

      <div className="form-group">
        <label>Priority</label>
        <PriorityDropdown defaultPriority={card.priority} name="priority" />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-cancel"
          onClick={() => navigate(`/${card?.id ?? ""}`)}
        >
          Cancel
        </button>
        <button type="submit" className="btn-save">
          {isCreating ? "Create Card" : "Save Changes"}
        </button>
      </div>
    </Form>
  );
};

export default CardForm;
