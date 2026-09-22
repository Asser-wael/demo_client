import { useDispatch, useSelector } from "react-redux";
import { FaMoon, FaSun } from "react-icons/fa";

import { setThemeLocal, saveSettings } from "../../features/settings/settingsSlice.js";
import { showToast } from "../../utils/showToast.jsx";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const { user } = useSelector((state) => state.auth);
  const isDark = theme === "dark";
  const isAdmin = user?.role === "admin";

  const handleToggle = async () => {
    const newTheme = isDark ? "light" : "dark";

    // Every visitor — admin or not — gets an instant, permanent local
    // preference via localStorage. Only an admin's toggle also updates the
    // site-wide default stored on the server; a non-admin save would 403
    // against the admin-only /settings route, so we never attempt it.
    dispatch(setThemeLocal(newTheme));

    if (!isAdmin) return;

    try {
      await dispatch(saveSettings({ theme: newTheme })).unwrap();
    } catch (err) {
      showToast({
        type: "error",
        message: err || "تعذر حفظ الثيم كإعداد افتراضي للموقع",
      });
    }
  };

  return (
    <button
      onClick={handleToggle}
      aria-label="Toggle theme"
      className="p-2 rounded-full bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:scale-105 transition"
    >
      {isDark ? <FaSun /> : <FaMoon />}
    </button>
  );
}