import { layout, route } from "@react-router/dev/routes";

export default [
  route("/", "routes/home.jsx", [
    layout("layouts/sidebar.jsx", [
      route(":cardId", "routes/detailCard.jsx"),
      route(":cardId/edit", "routes/editCard.jsx"),
      route("createcard/:laneId", "routes/createCard.jsx"),
    ]),
  ]),
  route("/updatecard", "routes/updateCard.jsx"),
  route("/createlane", "routes/createLane.jsx"),
];
