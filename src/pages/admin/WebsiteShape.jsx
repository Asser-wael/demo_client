import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  setColor,
  resetColors,
  toggleTheme,
  setCompanyName,
  setSocial,
  setPhone,
} from "../../features/settings/settingsSlice.js";

const COLOR_FIELDS = [
  { key: "bg", label: "الخلفية (Background)" },
  { key: "card", label: "الكارت (Card)" },
  { key: "text", label: "النص (Text)" },
  { key: "muted", label: "نص باهت (Muted)" },
  { key: "border", label: "الحدود (Border)" },
  { key: "primary", label: "اللون الأساسي (Primary)" },
  { key: "primaryHover", label: "Primary Hover" },
  { key: "accent", label: "لون ثانوي (Accent)" },
  { key: "accentLight", label: "Accent Light" },
];

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/..." },
  { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@..." },
  { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/..." },
  { key: "whatsapp", label: "رقم واتساب (بالكود الدولي)", placeholder: "201227675757" },
];

export default function WebsiteShape() {
  const dispatch = useDispatch();
  const { theme, colors, company, social, phone } = useSelector(
    (state) => state.settings
  );

  const [mode, setMode] = useState(theme); // أي وضع بيتعدل دلوقتي (لايت/دارك)
  const [name, setName] = useState(company.name);
  const [phoneInput, setPhoneInput] = useState(phone);
  const [socialInput, setSocialInput] = useState(social);

  const activePalette = colors[mode];

  const handleColorChange = (key, value) => {
    dispatch(setColor({ mode, key, value }));
  };

  const handleSaveCompany = () => {
    dispatch(setCompanyName(name.trim() || "company"));
    toast.success("اتحفظ اسم الشركة");
  };

  const handleSavePhone = () => {
    dispatch(setPhone(phoneInput.trim()));
    toast.success("اتحفظ الرقم");
  };

  const handleSaveSocial = () => {
    Object.entries(socialInput).forEach(([key, value]) => {
      dispatch(setSocial({ key, value: value.trim() }));
    });
    toast.success("اتحفظت اللينكات");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-10 p-6">
      <h1 className="font-serif text-3xl">Website Shape</h1>

      {/* ================= THEME ================= */}
      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">الوضع الحالي للموقع</h2>

          <button
            className="btn-primary rounded-full px-5 py-2"
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === "dark" ? "التبديل للايت مود" : "التبديل للدارك مود"}
          </button>
        </div>
        <p className="text-sm text-muted">
          الوضع الحالي: <b>{theme === "dark" ? "دارك" : "لايت"}</b>
        </p>
      </section>

      {/* ================= COLORS ================= */}
      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">ألوان الموقع</h2>

          <div className="flex gap-2">
            <button
              className={`rounded-full border px-4 py-1 text-sm ${
                mode === "light" ? "btn-primary" : ""
              }`}
              onClick={() => setMode("light")}
            >
              Light
            </button>
            <button
              className={`rounded-full border px-4 py-1 text-sm ${
                mode === "dark" ? "btn-primary" : ""
              }`}
              onClick={() => setMode("dark")}
            >
              Dark
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {COLOR_FIELDS.map(({ key, label }) => (
            <label key={key} className="flex flex-col gap-1 text-sm">
              {label}
              <input
                type="color"
                value={activePalette[key]}
                onChange={(e) => handleColorChange(key, e.target.value)}
                className="h-10 w-full cursor-pointer rounded-lg border"
              />
            </label>
          ))}
        </div>

        <button
          className="text-sm text-muted underline"
          onClick={() => dispatch(resetColors(mode))}
        >
          استرجاع الألوان الافتراضية ({mode})
        </button>
      </section>

      {/* ================= COMPANY NAME ================= */}
      <section className="card space-y-4 p-6">
        <h2 className="font-serif text-xl">اسم الشركة</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <button className="btn-primary rounded-full px-5 py-2" onClick={handleSaveCompany}>
          حفظ
        </button>
      </section>

      {/* ================= SOCIAL ================= */}
      <section className="card space-y-4 p-6">
        <h2 className="font-serif text-xl">روابط السوشيال ميديا</h2>

        {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            {label}
            <input
              type="text"
              placeholder={placeholder}
              value={socialInput[key]}
              onChange={(e) =>
                setSocialInput((prev) => ({ ...prev, [key]: e.target.value }))
              }
              className="rounded-lg border px-3 py-2"
            />
          </label>
        ))}

        <button className="btn-primary rounded-full px-5 py-2" onClick={handleSaveSocial}>
          حفظ اللينكات
        </button>
      </section>

      {/* ================= PHONE ================= */}
      <section className="card space-y-4 p-6">
        <h2 className="font-serif text-xl">رقم الهاتف</h2>
        <input
          type="text"
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          className="rounded-lg border px-3 py-2"
        />
        <button className="btn-primary rounded-full px-5 py-2" onClick={handleSavePhone}>
          حفظ
        </button>
      </section>
    </div>
  );
}