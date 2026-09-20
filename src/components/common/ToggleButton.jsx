import { useDispatch, useSelector } from "react-redux";
import { FaMoon, FaSun } from "react-icons/fa";
import toast from "react-hot-toast";

import { setThemeLocal, saveSettings } from "../../features/settings/settingsSlice.js";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.settings.theme);
  const isDark = theme === "dark";

  const handleToggle = async () => {
    const newTheme = isDark ? "light" : "dark";
    dispatch(setThemeLocal(newTheme)); // معاينة فورية

    try {
      await dispatch(saveSettings({ theme: newTheme })).unwrap();
    } catch (err) {
      dispatch(setThemeLocal(theme)); // رجّع القديم لو الحفظ فشل
      toast.error(err || "تعذر حفظ الثيم");
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