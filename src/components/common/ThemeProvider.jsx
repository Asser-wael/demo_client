import { useEffect } from "react";
import { useSelector } from "react-redux";

export default function ThemeProvider() {
  const colors = useSelector(
    (state) => state.settings.colors
  );

  useEffect(() => {
    if (!colors) return;

    const root = document.documentElement;

    const applyColors = () => {
      const currentTheme = root.classList.contains("dark")
        ? "dark"
        : "light";

      const palette = colors[currentTheme];

      if (!palette) return;

      Object.entries(palette).forEach(([key, value]) => {
        if (!value) return;

        root.style.setProperty(
          `--${key}`,
          value
        );
      });
    };

    applyColors();

    const observer = new MutationObserver(() => {
      applyColors();
    });

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, [colors]);

  return null;
}