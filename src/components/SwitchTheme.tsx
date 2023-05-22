import React, { useEffect } from "react";
// import { FiMoon, FiSun } from "react-icons/fi";
// import { useLocalStorage } from "usehooks-ts";
import { useState } from "react";

const SwitchTheme = () => {
  let themeVal = "";

  //we store the theme in localStorage to preserve the state on next visit with an initial theme of dark.
  const [theme, setTheme] = useState(themeVal);

  useEffect(() => {
    if (typeof window !== undefined) {
      setTheme(localStorage.getItem("theme") || "");
    }
  }, []);
  //toggles the theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");

    themeVal = localStorage.getItem("theme") || "";
  };

  //modify data-theme attribute on document.body when theme changes
  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button className="btn-circle btn" onClick={toggleTheme}>
      {theme === "dark" ? <p>Dark</p> : <p>Light</p>}
    </button>
  );
};

export default SwitchTheme;
