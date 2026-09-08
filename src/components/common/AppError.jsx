import { useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";

export default function AppError() {
  const error = useRouteError();
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    // 1. Check for dynamic import / chunk load errors
    const isDynamicImportError =
      error?.message?.includes("Failed to fetch dynamically imported module") ||
      error?.message?.includes("Importing a module script failed") ||
      error?.message?.includes("ChunkLoadError");

    if (!isDynamicImportError) return;

    // 2. Attempt a single automatic reload using sessionStorage guard
    const alreadyReloaded = sessionStorage.getItem("dynamic-import-reloaded");

    if (!alreadyReloaded) {
      sessionStorage.setItem("dynamic-import-reloaded", "true");
      setIsReloading(true);
      window.location.reload();
    }
  }, [error]);

  // Clean up the flag on successful page loads to allow future recoveries
  useEffect(() => {
    const handlePageShow = () => {
      sessionStorage.removeItem("dynamic-import-reloaded");
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const handleManualReload = () => {
    sessionStorage.removeItem("dynamic-import-reloaded");
    window.location.reload();
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <div 
        className="max-w-md w-full p-8 rounded-2xl text-center backdrop-blur-md border transition-all duration-300"
        style={{ 
          backgroundColor: "var(--glass)", 
          borderColor: "var(--border)",
          boxShadow: "var(--shadow)" 
        }}
      >
        {/* Icon */}
        <div 
          className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "var(--accent-light)", color: "var(--primary)" }}
        >
          <svg className="w-8 h-8 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold mb-2">
          {isReloading ? "Refreshing Application..." : "Something Went Wrong"}
        </h1>

        <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--muted)" }}>
          {isReloading 
            ? "We are updating the application to ensure you have the latest version."
            : "Failed to load some components. This might be due to a new update or a temporary connection issue."}
        </p>

        <button
          onClick={handleManualReload}
          className="w-full py-3 px-6 rounded-xl font-medium text-white transition-colors duration-200 shadow-sm"
          style={{ backgroundColor: "var(--primary)" }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "var(--primary-hover)")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "var(--primary)")}
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}