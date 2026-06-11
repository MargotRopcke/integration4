import Board from "../components/Board/Board.jsx";
import { Outlet } from "react-router";

import "./home.css";
import { fetchLanes } from "../services/lanes.js";
import { updateCardLane } from "../services/cards.js";

export const clientLoader = async () => {
  try {
    const lanes = await fetchLanes();

    return { lanes };
  } catch (error) {
    console.error("Error loading data:", error);
    return { lanes: [], error: error.message || "Failed to load data" };
  }
};

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const cardId = formData.get("cardId");
  const targetLaneId = formData.get("targetLaneId");

  await updateCardLane(cardId, targetLaneId);

  return null;
};

export default function Home({ loaderData }) {
  const { lanes } = loaderData;

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    if (sourceLaneId === targetLaneId) return;
  };

  return (
    <main className="home">
      <div className="home__header">
        <h1 className="home__title">Kanban Board</h1>
      </div>
      <Board lanes={lanes} onCardMove={handleCardMove} />
      <Outlet />
    </main>
  );
}
