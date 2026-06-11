import { redirect } from "react-router";
import { createLane } from "../services/lanes";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const title = formData.get("title");

  if (!title || typeof title !== "string" || title.trim() === "") {
    return { error: "Lane title is required" };
  }

  await createLane({ title });

  // Redirect back to the board
  return redirect("/");
};
