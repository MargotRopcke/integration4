import "./NewItemInput.css";
import { Form, useParams } from "react-router";
import { useState } from "react";

export const NewItemInput = ({ placeholder, action }) => {
  const [showForm, setshowForm] = useState(false);
  const { folderId } = useParams();

  return showForm ? (
    <Form action={action} method="post" onSubmit={() => setshowForm(false)}>
      <input type="hidden" name="folderId" value={folderId} />
      <div className="app__new-item">
        <input
          name="name"
          type="text"
          className="app__new-item-input"
          placeholder={placeholder}
          autoFocus
        />
        <div className="app__new-item-actions">
          <button type="submit" className="app__new-item-save">
            Save
          </button>
          <button
            type="reset"
            className="app__new-item-cancel"
            onClick={() => setshowForm(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </Form>
  ) : (
    <button className="app__new-item-btn" onClick={() => setshowForm(true)}>
      + New
    </button>
  );
};
