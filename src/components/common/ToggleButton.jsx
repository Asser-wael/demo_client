import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ToggleButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    const isDark = savedTheme === "dark";

    document.documentElement.classList.toggle(
      "dark",
      isDark
    );

    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !dark;

    document.documentElement.classList.toggle(
      "dark",
      newDark
    );

    localStorage.setItem(
      "theme",
      newDark ? "dark" : "light"
    );

    setDark(newDark);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2 rounded-full bg-card text-text hover:scale-105 transition"
      aria-label={
        dark
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}