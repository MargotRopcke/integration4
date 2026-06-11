import { redirect, useParams } from "react-router";
import CardForm from "../components/CardForm/CardForm";
import { createCard } from "../services/cards";

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const cardData = Object.fromEntries(formData);

  await createCard(cardData);

  // Redirect back to the board
  return redirect("/");
};

const CreateCard = () => {
  const { laneId } = useParams();

  return (
    <>
      <h2 className="drawer__title">New card</h2>
      <CardForm isCreating={true} laneId={laneId} />
    </>
  );
};

export default CreateCard;
