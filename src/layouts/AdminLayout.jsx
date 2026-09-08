import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from "react-redux";
import { menuItems } from '../data/menuItems';
import { motion, AnimatePresence } from "framer-motion";
import {
  MdChevronLeft,
  MdChevronRight,
  MdLogout,
} from "react-icons/md";
import { logoutUser } from '../features/auth/authSlice';
import { IoIosNotifications } from "react-icons/io";
import ThemeToggle from "../components/common/ToggleButton";


export default function AdminLayout() {
  const { accessToken } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem = menuItems.find((i) => i.to === location.pathname);

  return (
    <div className='flex min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] '>
      <motion.aside
        animate={{ width: open ? 236 : 76 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="relative flex shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] py-5"
      >
        <div className="mb-8 flex items-center gap-3 px-5">

          <AnimatePresence>
            {open && (
              <motion.h1
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="font-serif text-lg italic"
              >
                LUXORA
              </motion.h1>
            )}
          </AnimatePresence>
          <hr />
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3">
          {menuItems.map((item, index) => {
            const active = location.pathname === item.to;
            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.to)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${active
                  ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)] font-semibold"
                  : "text-[var(--color-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                  }`}
              >
                {active && (
                  <motion.span
                    layoutId="sidebarActive"
                    className="absolute left-0 h-5 w-[3px] rounded-r-full bg-[var(--color-accent)]"
                  />
                )}
                <span className="text-lg">{item.icon}</span>
                <AnimatePresence>
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.title}
                    </motion.span>
                  )}
                </AnimatePresence>

                {!open && (
                  <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-[var(--color-text)] px-2.5 py-1.5 text-xs font-medium text-[var(--color-bg)] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {item.title}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)] shadow-sm hover:text-[var(--color-accent)]"
        >
          {open ? <MdChevronLeft size={14} /> : <MdChevronRight size={14} />}
        </button>
        <div className="px-3">
          <button
            onClick={async () => {
              try {
                await dispatch(logoutUser()).unwrap();
                window.location.reload();
                navigate("/");
              } catch (error) {
                console.log(error);
              }
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-500/10"
          >
            <MdLogout className="text-lg" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      <div className='flex flex-col w-full h-full'>

        {/* MAIN COLUMN */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* HEADER */}
          <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-5 py-3.5 sm:px-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--color-muted)]">
                Admin panel
              </p>
              <h1 className="font-serif text-lg italic sm:text-xl">
                {activeItem?.title ?? "Overview"}
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification bell — next to theme toggle */}
              <button
                onClick={() => navigate("/admin/notificationsAdmin")}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${location.pathname === "/admin/notificationsAdmin"
                  ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-muted)] hover:text-[var(--color-text)]"
                  }`}
                aria-label="Notifications"
              >
                <IoIosNotifications size={18} />
                <motion.span
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]"
                />
              </button>

              <ThemeToggle />
            </div>
          </header>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--color-bg)] p-4 sm:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
