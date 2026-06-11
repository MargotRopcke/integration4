import { createFolder } from "../services/folders";
import { redirect } from "react-router";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  await createFolder(formData.get("name"));
  return redirect("/");
};
