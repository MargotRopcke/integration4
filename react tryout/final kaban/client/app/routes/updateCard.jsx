import { redirect } from "react-router";
import { updateCard } from "../services/cards";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const cardId = formData.get("cardId");
  const title = formData.get("title");
  const description = formData.get("description");
  const priority = formData.get("priority");

  await updateCard(cardId, {
    title,
    description,
    priority,
  });

  return redirect(`/${cardId}`);
};
