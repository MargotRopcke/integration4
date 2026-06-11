import { redirect } from "react-router";
import { createEmptyContact } from "../data";

export async function action() {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
}

export default function ContactsIndex() {
  return (
    <p id="zero-state">
      This is a demo for React Router.
      <br />
      Check out{" "}
      <a href="https://reactrouter.com" target="_blank" rel="noopener noreferrer">
        the docs at reactrouter.com
      </a>
      .
    </p>
  );
}
