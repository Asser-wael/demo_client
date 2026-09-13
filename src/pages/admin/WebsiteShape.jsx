import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  setColor,
  setThemeLocal,
  saveSettings,
  resetColorsRemote,
} from "../../features/settings/settingsSlice.js";

const COLOR_FIELDS = [
  { key: "bg", label: "خلفية الموقع" },
  { key: "card", label: "خلفية الكروت" },
  { key: "text", label: "لون النص" },
  { key: "muted", label: "نص باهت" },
  { key: "border", label: "لون الحدود" },
  { key: "primary", label: "اللون الأساسي" },
  { key: "primaryHover", label: "اللون الأساسي (Hover)" },
  { key: "accent", label: "لون مميز" },
  { key: "accentLight", label: "لون مميز فاتح" },
];

const SOCIAL_FIELDS = [
  { key: "instagram", label: "رابط انستجرام", placeholder: "https://instagram.com/your-page" },
  { key: "tiktok", label: "رابط تيك توك", placeholder: "https://tiktok.com/@your-handle" },
  { key: "facebook", label: "رابط فيسبوك", placeholder: "https://facebook.com/your-page" },
  { key: "whatsapp", label: "رقم واتساب (بالكود الدولي)", placeholder: "201227675757" },
];

export default function WebsiteShape() {
  const dispatch = useDispatch();
  const { theme, colors, company, social, phone, status } = useSelector((s) => s.settings);
  const isSaving = status === "loading";

  const [mode, setMode] = useState("light");
  const [name, setName] = useState(company.name || "");
  const [phoneInput, setPhoneInput] = useState(phone || "");
  const [socialInput, setSocialInput] = useState(social || {});

  // زامن الحقول المحلية مع اللي راجع من السيرفر بعد الـ fetch
  useEffect(() => setName(company.name || ""), [company.name]);
  useEffect(() => setPhoneInput(phone || ""), [phone]);
  useEffect(() => setSocialInput(social || {}), [social]);

  const activePalette = colors[mode] || {};

  const runSave = async (payload, successMsg) => {
    try {
      await dispatch(saveSettings(payload)).unwrap();
      toast.success(successMsg);
    } catch (err) {
      toast.error(err || "حصل خطأ أثناء الحفظ");
    }
  };

  const handleColorChange = (key, value) => dispatch(setColor({ mode, key, value }));

  const handleSaveColors = () =>
    runSave({ colors: { [mode]: colors[mode] } }, "تم حفظ الألوان بنجاح");

  const handleResetColors = async () => {
    try {
      await dispatch(resetColorsRemote(mode)).unwrap();
      toast.success("تم استرجاع الألوان الافتراضية");
    } catch (err) {
      toast.error(err || "تعذر استرجاع الألوان الافتراضية");
    }
  };

  const handleToggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    dispatch(setThemeLocal(newTheme));
    try {
      await dispatch(saveSettings({ theme: newTheme })).unwrap();
      toast.success("تم تحديث الثيم");
    } catch (err) {
      dispatch(setThemeLocal(theme));
      toast.error(err || "تعذر حفظ الثيم");
    }
  };

  const handleSaveCompany = () =>
    runSave({ company: { name: name.trim() || "Company" } }, "تم تحديث اسم الشركة");

  const handleSaveSocial = () => {
    const cleaned = Object.fromEntries(
      Object.entries(socialInput).map(([k, v]) => [k, (v || "").trim()])
    );
    runSave({ social: cleaned }, "تم تحديث روابط السوشيال ميديا");
  };

  const handleSavePhone = () => runSave({ phone: phoneInput.trim() }, "تم تحديث رقم الهاتف");

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 text-[var(--text)]">
      <div className="border-b border-[var(--border)] pb-5">
        <h1 className="text-3xl font-bold tracking-tight">شكل الموقع والهوية</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">تحكم في ألوان الموقع، الثيم، وبيانات الشركة.</p>
      </div>

      {/* THEME */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">الثيم الحالي</h2>
            <p className="text-sm text-[var(--muted)] mt-1">
              الوضع الحالي: <span className="font-semibold uppercase text-[var(--primary)]">{theme}</span>
            </p>
          </div>
          <button
            disabled={isSaving}
            onClick={handleToggleTheme}
            className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : `التحويل إلى ${theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}`}
          </button>
        </div>
      </section>

      {/* COLORS */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">لوحة الألوان</h2>
            <p className="text-sm text-[var(--muted)] mt-1">تحكم في ألوان الوضعين الفاتح والداكن بشكل منفصل.</p>
          </div>
          <div className="flex rounded-xl bg-[var(--bg)] p-1 border border-[var(--border)]">
            {["light", "dark"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  mode === m ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {m === "light" ? "فاتح" : "داكن"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-[var(--muted)]">
                  {activePalette[key] || "#000000"}
                </span>
                <input
                  type="color"
                  value={activePalette[key] || "#000000"}
                  onChange={(e) => handleColorChange(key, e.target.value)}
                  className="h-9 w-9 cursor-pointer rounded-lg border-0 bg-transparent"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          <button
            disabled={isSaving}
            onClick={handleResetColors}
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
          >
            استرجاع الألوان الافتراضية ({mode === "light" ? "فاتح" : "داكن"})
          </button>
          <button
            disabled={isSaving}
            onClick={handleSaveColors}
            className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ الألوان"}
          </button>
        </div>
      </section>

      {/* COMPANY */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold">بيانات الشركة</h2>
          <p className="text-sm text-[var(--muted)] mt-1">اسم المتجر الظاهر للعملاء.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم الشركة"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
          <button
            disabled={isSaving}
            onClick={handleSaveCompany}
            className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </section>

      {/* SOCIAL */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold">روابط السوشيال ميديا</h2>
          <p className="text-sm text-[var(--muted)] mt-1">اربط حسابات المتجر.</p>
        </div>
        <div className="space-y-4">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-[var(--muted)]">{label}</label>
              <input
                type="text"
                placeholder={placeholder}
                value={socialInput[key] || ""}
                onChange={(e) => setSocialInput((prev) => ({ ...prev, [key]: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
              />
            </div>
          ))}
        </div>
        <button
          disabled={isSaving}
          onClick={handleSaveSocial}
          className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
        >
          {isSaving ? "جاري الحفظ..." : "حفظ الروابط"}
        </button>
      </section>

      {/* PHONE */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-semibold">رقم التواصل</h2>
          <p className="text-sm text-[var(--muted)] mt-1">الرقم الأساسي للدعم.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="+20 100 000 0000"
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 py-2.5 text-sm focus:border-[var(--primary)] focus:outline-none"
          />
          <button
            disabled={isSaving}
            onClick={handleSavePhone}
            className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
          >
            {isSaving ? "جاري الحفظ..." : "حفظ الرقم"}
          </button>
        </div>
      </section>
    </div>
  );
}