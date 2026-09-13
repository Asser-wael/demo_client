import { useEffect } from "react";
import { useSelector } from "react-redux";

const VAR_MAP = {
  bg: "--bg", card: "--card", text: "--text", muted: "--muted",
  border: "--border", primary: "--primary", primaryHover: "--primary-hover",
  accent: "--accent", accentLight: "--accent-light",
};

export default function useApplyTheme() {
  const { theme, colors } = useSelector((state) => state.settings);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    const palette = colors?.[theme];
    if (!palette) return;
    const root = document.documentElement;
    Object.entries(VAR_MAP).forEach(([key, cssVar]) => {
      if (palette[key]) root.style.setProperty(cssVar, palette[key]);
    });
  }, [theme, colors]);
}