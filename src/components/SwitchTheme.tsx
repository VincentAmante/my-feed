import React, { useEffect } from "react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const SwitchTheme = () => {
  let themeVal = "dark";

  // we store the theme in localStorage to preserve the state on next visit with an initial theme of dark.
  const [theme, setTheme] = useState(themeVal);

  useEffect(() => {
    if (typeof window !== undefined) {
      const localTheme = localStorage.getItem("theme");
      console.log(localTheme);
      setTheme(localTheme || "");
      document.body.setAttribute("data-theme", localTheme || "");
    }
  }, []);

  //toggles the theme
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "soft" : "dark");
    themeVal = localStorage.getItem("theme") || "";
    console.log('setting theme to ' + themeVal);
    localStorage.setItem("theme", themeVal === "dark" ? "soft" : "dark");
  };

  //modify data-theme attribute on document.body when theme changes
  useEffect(() => {
    const body = document.body;
    body.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <button className="btn-circle btn btn-ghost" onClick={toggleTheme}>
      {theme === "dark" ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
    </button>
  );
};

export default SwitchTheme;
