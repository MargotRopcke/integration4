import { route, layout, index } from "@react-router/dev/routes";

export default [
  layout("layouts/BaseLayout.jsx", [
    index("routes/home.jsx"),
    route(":folderId", "routes/folder.jsx", [
      index("routes/empty.jsx"),
      route(":noteId", "routes/note.jsx"),
      route("note/create", "routes/createNote.jsx"),
    ]),
    route("folder/create", "routes/createFolder.jsx"),
  ]),
];
