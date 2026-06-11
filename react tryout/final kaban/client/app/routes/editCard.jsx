import { Form, Link } from "react-router";
import PriorityDropdown from "../components/PriorityDropdown/PriorityDropdown";
import { fetchCard } from "../services/cards";
import "./detailCard.css";
import Card from "../components/Card/Card";
import CardForm from "../components/CardForm/CardForm";

export const clientLoader = async ({ params }) => {
  const { cardId } = params;
  const card = await fetchCard(cardId);
  return { card };
};

const EditCard = ({ loaderData }) => {
  const { card } = loaderData;

  return (
    <>
      <h2 className="drawer__title">Edit card</h2>
      <CardForm isCreating={false} card={card} />
    </>
  );
};

export default EditCard;
