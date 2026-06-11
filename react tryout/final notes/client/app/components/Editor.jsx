import "./Editor.css";
import { useFetcher } from "react-router";
import { useState, useRef, useEffect } from "react";

export const Editor = ({ note }) => {
  const fetcher = useFetcher();
  const [content, setContent] = useState(note?.content || "");
  const timeoutRef = useRef(null);

  // Add cleanup effect to clear timeout when component unmounts
  useEffect(() => {
    // Cleanup function that runs when component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const saveNote = (content) => {
    fetcher.submit({ content, noteId: note.id }, { method: "post" });
  };

  const handleNoteChange = (e) => {
    setContent(e.target.value);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout (debounce of 2 seconds)
    timeoutRef.current = setTimeout(() => {
      saveNote(e.target.value);
    }, 2000);
  };

  return (
    <div className="app__editor">
      <div className="app__editor-header">
        <h2 className="app__editor-title">{note?.title}</h2>
      </div>
      <textarea
        className="app__editor-textarea"
        value={content}
        onChange={handleNoteChange}
        onBlur={(e) => saveNote(e.target.value)}
        placeholder="Start writing..."
      />
    </div>
  );
};
