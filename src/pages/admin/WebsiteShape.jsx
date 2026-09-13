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
  { key: "bg", label: "Background" },
  { key: "card", label: "Card Background" },
  { key: "text", label: "Text Color" },
  { key: "muted", label: "Muted Text" },
  { key: "border", label: "Border Color" },
  { key: "primary", label: "Primary Color" },
  { key: "primaryHover", label: "Primary Hover" },
  { key: "accent", label: "Accent Color" },
  { key: "accentLight", label: "Accent Light" },
];

const SOCIAL_FIELDS = [
  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/your-page" },
  { key: "tiktok", label: "TikTok URL", placeholder: "https://tiktok.com/@your-handle" },
  { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/your-page" },
  { key: "whatsapp", label: "WhatsApp Number (With Country Code)", placeholder: "201227675757" },
];

export default function WebsiteShape() {
  const dispatch = useDispatch();
  const { theme, colors, company, social, phone } = useSelector(
    (state) => state.settings
  );

  const [mode, setMode] = useState(theme);
  const [name, setName] = useState(company.name || "");
  const [phoneInput, setPhoneInput] = useState(phone || "");
  const [socialInput, setSocialInput] = useState(social || {});

  const activePalette = colors[mode] || {};

  const handleColorChange = (key, value) => {
    dispatch(setColor({ mode, key, value }));
  };

  const handleSaveCompany = () => {
    dispatch(setCompanyName(name.trim() || "Company"));
    toast.success("Company name updated successfully");
  };

  const handleSavePhone = () => {
    dispatch(setPhone(phoneInput.trim()));
    toast.success("Phone number updated successfully");
  };

  const handleSaveSocial = () => {
    Object.entries(socialInput).forEach(([key, value]) => {
      dispatch(setSocial({ key, value: (value || "").trim() }));
    });
    toast.success("Social links updated successfully");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-6 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 pb-5">
        <h1 className="text-3xl font-bold tracking-tight">Website Appearance & Brand</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Customize your store layout, theme colors, and company information.
        </p>
      </div>

      {/* ================= THEME ================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Active Theme</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current Mode: <span className="font-semibold uppercase text-indigo-600 dark:text-indigo-400">{theme}</span>
            </p>
          </div>

          <button
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            onClick={() => dispatch(toggleTheme())}
          >
            Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </section>

      {/* ================= COLORS ================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Color Palette</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage color schemes for both Light and Dark modes.
            </p>
          </div>

          <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
            <button
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "light"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setMode("light")}
            >
              Light Mode
            </button>
            <button
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                mode === "dark"
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              }`}
              onClick={() => setMode("dark")}
            >
              Dark Mode
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-800"
            >
              <span className="text-sm font-medium">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-gray-400">
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

        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            className="text-xs font-medium text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors"
            onClick={() => dispatch(resetColors(mode))}
          >
            Reset Default Colors ({mode.toUpperCase()})
          </button>
        </div>
      </section>

      {/* ================= COMPANY NAME ================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Company Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Update your business identity and store name.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter company name"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:focus:bg-gray-900"
          />
          <button
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            onClick={handleSaveCompany}
          >
            Save Changes
          </button>
        </div>
      </section>

      {/* ================= SOCIAL LINKS ================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Social Media Links</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect your store's social media platforms.
          </p>
        </div>

        <div className="space-y-4">
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                type="text"
                placeholder={placeholder}
                value={socialInput[key] || ""}
                onChange={(e) =>
                  setSocialInput((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:focus:bg-gray-900"
              />
            </div>
          ))}
        </div>

        <button
          className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          onClick={handleSaveSocial}
        >
          Save Links
        </button>
      </section>

      {/* ================= PHONE NUMBER ================= */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Contact Phone Number</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Primary contact number displayed for support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-gray-800 dark:focus:bg-gray-900"
          />
          <button
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            onClick={handleSavePhone}
          >
            Save Phone Number
          </button>
        </div>
      </section>
    </div>
  );
}