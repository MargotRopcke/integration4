import React, { useState } from "react";
import { Outlet } from "react-router";
import { getFolders } from "../services/folders";
import { Sidebar } from "../components/Sidebar";

export async function clientLoader() {
  const folders = await getFolders();
  return {
    folders,
  };
}

const BaseLayout = ({ loaderData }) => {
  const { folders } = loaderData;

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  return (
    <div className={`app ${darkMode ? "app--dark" : ""}`}>
      <Sidebar
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        folders={folders}
      />
      <Outlet />
    </div>
  );
};

export default BaseLayout;
