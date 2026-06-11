import { redirect } from "react-router";
import { createNote } from "../services/notes";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const folderId = formData.get("folderId");
  await createNote({
    title: formData.get("name"),
    folderId,
    content: "new note",
  });
  return redirect(`/${folderId}`);
};
