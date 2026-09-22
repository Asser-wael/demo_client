import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { menuItems } from "../data/menuItems";
import { motion, AnimatePresence } from "framer-motion";
import {
  MdChevronLeft,
  MdChevronRight,
  MdLogout,
  MdMenu,
  MdClose,
} from "react-icons/md";
import { logoutUser } from "../features/auth/authSlice";
import { unsubscribeFromPush } from "../utils/pushSubscribe";
import { IoIosNotifications } from "react-icons/io";
import ThemeToggle from "../components/common/ToggleButton";
import Name from "../components/company/Name";

/* =========================================================
   NAME INITIAL — compact mark shown when the rail is collapsed
========================================================= */

function NameInitial() {
  const name = useSelector((state) => state.settings.company.name);
  return (name || "A").trim().charAt(0).toUpperCase();
}

/* =========================================================
   NAV LIST — shared between the desktop rail and the mobile drawer
========================================================= */

function NavList({ collapsed, onNavigate }) {
  const location = useLocation();

  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {menuItems.map((item, index) => {
        const active = location.pathname === item.to;

        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.to)}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`group relative flex items-center gap-3 border px-3 py-2.5 text-sm transition-colors ${
              active
                ? "border-accent/30 bg-accent/10 font-semibold text-accent"
                : "border-transparent text-muted hover:border-border hover:bg-bg hover:text-text"
            }`}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 bg-accent" />
            )}

            <span className="text-lg shrink-0">{item.icon}</span>

            {!collapsed && (
              <span className="whitespace-nowrap">{item.title}</span>
            )}

            {collapsed && (
              <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-text opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                {item.title}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

/* =========================================================
   SIDEBAR FOOTER — signed-in user + logout
========================================================= */

function SidebarFooter({ collapsed, onLogout }) {
  const { user } = useSelector((state) => state.auth);
  const initial = (user?.name || "A")[0]?.toUpperCase();

  return (
    <div className="border-t border-border px-3 pt-3">
      {!collapsed && (
        <div className="mb-2 flex items-center gap-3 px-1 py-1.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-border bg-bg text-xs font-semibold text-text">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-text">
              {user?.name || "Admin"}
            </p>
            <p className="truncate text-[11px] text-muted">
              {user?.email || "—"}
            </p>
          </div>
        </div>
      )}

      <button
        onClick={onLogout}
        className="flex w-full items-center gap-3 border border-transparent px-3 py-2.5 text-sm text-red-500 transition hover:border-red-500/20 hover:bg-red-500/10"
      >
        <MdLogout className="shrink-0 text-lg" />
        {!collapsed && <span>Logout</span>}
      </button>
    </div>
  );
}

/* =========================================================
   ADMIN LAYOUT
========================================================= */

export default function AdminLayout() {
  const [open, setOpen] = useState(true); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = menuItems.find((i) => i.to === location.pathname);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await unsubscribeFromPush();
      await dispatch(logoutUser()).unwrap();
      window.location.reload();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const goTo = (to) => navigate(to);

  return (
    <div className="flex min-h-screen bg-bg text-text">
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}
      <motion.aside
        animate={{ width: open ? 248 : 76 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative hidden shrink-0 flex-col border-r border-border bg-card py-5 lg:flex"
      >
        <div className="mb-6 flex items-center overflow-hidden px-5">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.h1
                key="full"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="logo whitespace-nowrap font-serif text-lg italic"
              >
                <Name />
              </motion.h1>
            ) : (
              <motion.span
                key="mark"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="logo flex h-8 w-8 items-center justify-center border border-border font-serif text-base italic"
              >
                <NameInitial />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        <p
          className={`mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          Menu
        </p>

        <NavList collapsed={!open} onNavigate={goTo} />

        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center border border-border bg-card text-muted shadow-sm hover:text-accent"
        >
          {open ? <MdChevronLeft size={14} /> : <MdChevronRight size={14} />}
        </button>

        <SidebarFooter collapsed={!open} onLogout={handleLogout} />
      </motion.aside>

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card py-5 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between px-5">
                <h1 className="logo font-serif text-lg italic">
                  <Name />
                </h1>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-8 w-8 items-center justify-center border border-border text-muted hover:text-text"
                  aria-label="Close menu"
                >
                  <MdClose size={16} />
                </button>
              </div>

              <p className="mb-2 px-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Menu
              </p>

              <NavList collapsed={false} onNavigate={goTo} />

              <SidebarFooter collapsed={false} onLogout={handleLogout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* =====================================================
          MAIN COLUMN
      ===================================================== */}
      <div className="flex min-h-screen w-full flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-muted hover:text-text lg:hidden"
              aria-label="Open menu"
            >
              <MdMenu size={18} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Admin / {activeItem?.title ?? "Overview"}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate("/admin/notificationsAdmin")}
              className={`relative flex h-9 w-9 items-center justify-center border transition-colors ${
                location.pathname === "/admin/notificationsAdmin"
                  ? "border-accent text-accent"
                  : "border-border text-muted hover:text-text"
              }`}
              aria-label="Notifications"
            >
              <IoIosNotifications size={18} />
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent"
              />
            </button>

            <ThemeToggle />
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
