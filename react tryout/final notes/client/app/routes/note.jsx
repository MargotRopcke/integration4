import { Editor } from "../components/Editor";
import { getNoteById, updateNote } from "../services/notes";

export const clientLoader = async ({ params }) => {
  const { noteId } = params;
  const note = await getNoteById(noteId);
  return {
    note,
  };
};

export const clientAction = async ({ request }) => {
  const formData = await request.formData();
  const noteId = formData.get("noteId");
  const content = formData.get("content");
  return await updateNote({
    noteId,
    content,
  });
};

const Note = ({ loaderData }) => {
  const { note } = loaderData;

  return <Editor note={note} key={note.id} />;
};

export default Note;
