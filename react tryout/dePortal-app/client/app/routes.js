import { index, route, layout } from "@react-router/dev/routes";

export default [
  layout("layouts/sidebar.jsx", [
    index("routes/home.jsx"),
    route("contacts/:contactId", "routes/contact.jsx"),
    route("contacts/:contactId/edit", "routes/edit-contact.jsx"),
    route("contacts/:contactId/destroy", "routes/destroy-contact.jsx"),
  ]),
  route("about", "routes/about.jsx"),
];
