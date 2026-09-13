import React, { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { getSettings } from "../../../../features/settings/settingsSlice";

export default function ThemeToggle() {
  const dispatch = useDispatch();

  const { settings, loading } = useSelector(
    (state) => state.settings
  );

  const [dark, setDark] = useState(false);

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings?.theme) return;

    const isDark = settings.theme === "dark";

    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");

    setDark(isDark);
  }, [settings]);

  const toggleTheme = () => {
    const newTheme = dark ? "light" : "dark";

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );

    localStorage.setItem("theme", newTheme);
    setDark(newTheme === "dark");
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={loading}
      className="p-2 rounded-full bg-card text-text hover:scale-105 transition"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? <FaSun /> : <FaMoon />}
    </button>
  );
}