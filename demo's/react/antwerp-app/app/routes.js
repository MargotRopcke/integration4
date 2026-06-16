import { index, route, layout } from "@react-router/dev/routes";

export default [
  // Antwerp Discover Routes
  index("routes/home.jsx"),
  route("swipe", "routes/swipe.jsx"),
  route("results", "routes/results.jsx"),

  // Contacts CRUD Routes (nested inside sidebar layout)
  layout("layouts/sidebar.jsx", [
    route("contacts", "routes/contacts-index.jsx"),
    route("contacts/:contactId", "routes/contact.jsx"),
    route("contacts/:contactId/edit", "routes/edit-contact.jsx"),
    route("contacts/:contactId/destroy", "routes/destroy-contact.jsx"),
  ]),
];
