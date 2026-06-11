import { index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/intro.jsx"),
  route("map", "routes/map.jsx", [
    layout("layouts/detail-panel.jsx", [
      route(":locationId", "routes/location-detail.jsx"),
    ]),
  ]),
];
