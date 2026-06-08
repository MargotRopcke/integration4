import { redirect } from "react-router";

import { deleteContact } from "../data";

export async function action({ params }) {
  await deleteContact(params.contactId);
  return redirect("/");
}
