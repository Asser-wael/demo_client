import React, { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";

import {
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiLogOut,
  FiShield,
  FiHome,
  FiShoppingCart,
  FiBell,
  FiGrid,
  FiTag,
  FiCompass,
  FiHeart,
  FiPackage,
  FiArrowUpRight,
} from "react-icons/fi";

import { logoutUser } from "../features/auth/authSlice";
import ThemeToggle from "../components/common/ToggleButton";
import Footer from "../components/common/Footer";
import Name from "../components/company/Name";

// ==========================================
// Navigation
// IMPORTANT:
// paths + keys are unchanged
// Only visible labels + icons are redesigned
// ==========================================

const NAV_LINKS = [
  {
    label: "Home",
    path: "/",
    icon: FiHome,
  },
  {
    label: "Shop",
    path: "/products",
    icon: FiCompass,
  },
  {
    label: "Collections",
    path: "/collections",
    icon: FiGrid,
  },
  {
    label: "Sale",
    path: "/sale",
    icon: FiTag,
  },
];

const BOTTOM_NAV_ITEMS = [
  {
    key: "home",
    label: "Home",
    icon: FiHome,
    path: "/",
  },
  {
    key: "shop",
    label: "Shop",
    icon: FiCompass,
    path: "/products",
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: FiBell,
    path: "/notifications",
  },
  {
    key: "cart",
    label: "Cart",
    icon: FiShoppingCart,
    path: "/cart",
  },
  {
    key: "account",
    label: "Account",
    icon: FiUser,
    path: "/profile",
  },
];

// ==========================================
// Animation Variants
// ==========================================

const diagonalFadeIn = {
  hidden: {
    opacity: 0,
    x: -8,
    y: -8,
  },

  visible: (index = 0) => ({
    opacity: 1,
    x: 0,
    y: 0,

    transition: {
      duration: 0.45,
      delay: index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.98,
  },

  visible: {
    opacity: 1,
    y: 0,
    scale: 1,

    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },

  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,

    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

const drawerVariants = {
  hidden: {
    opacity: 0,
    x: -300,
  },

  visible: {
    opacity: 1,
    x: 0,

    transition: {
      duration: 0.38,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    x: -300,

    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const overlayVariants = {
  hidden: {
    opacity: 0,
  },

  visible: {
    opacity: 1,

    transition: {
      duration: 0.25,
    },
  },

  exit: {
    opacity: 0,

    transition: {
      duration: 0.2,
    },
  },
};

const pageTransitionVariants = {
  initial: {
    opacity: 0,
  },

  animate: {
    opacity: 1,

    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,

    transition: {
      duration: 0.25,
      ease: "easeInOut",
    },
  },
};

// ==========================================
// Shared Styles
// ==========================================

const navItemBase =
  "group relative flex items-center gap-2.5 rounded-full px-4 py-2.5 text-[12px] font-medium tracking-wide text-[var(--muted)] transition-all duration-300 hover:bg-[var(--bg)] hover:text-[var(--text)]";

const mobileNavItem =
  "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[13px] font-medium text-[var(--muted)] transition-all duration-300 hover:bg-[var(--bg)] hover:text-[var(--text)]";

const iconBtnBase =
  "flex h-10 w-10 items-center justify-center rounded-full text-[17px] text-[var(--muted)] transition-all duration-300 hover:bg-[var(--bg)] hover:text-[var(--text)]";

// ==========================================
// CartBadge
// ==========================================

function CartBadge({ count }) {
  if (!count) return null;

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      className="
        absolute -right-0.5 -top-0.5
        flex h-[17px] min-w-[17px]
        items-center justify-center
        rounded-full
        border-2 border-[var(--card)]
        bg-[var(--primary)]
        px-1
        text-[8px]
        font-bold
        text-white
      "
    >
      {count > 99 ? "99+" : count}
    </motion.span>
  );
}

// ==========================================
// AccountDropdown
// ==========================================

function AccountDropdown({ user, onClose, onLogout }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={dropdownVariants}
      className="
        absolute right-0 top-[52px] z-50
        w-[230px]
        overflow-hidden
        rounded-[22px]
        border border-[var(--border)]
        bg-[var(--card)]
        shadow-[var(--shadow)]
      "
    >
      {/* Header */}

      {user && (
        <div className="border-b border-[var(--border)] px-4 py-4">
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-full
                bg-[var(--bg)]
                text-[var(--primary)]
              "
            >
              <FiUser className="text-base" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[12px] font-semibold text-[var(--text)]">
                {user.name || "Account"}
              </p>

              <p className="text-[10px] text-[var(--muted)]">
                Personal account
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="p-2">
        {user ? (
          <>
            <Link
              to="/profile"
              onClick={onClose}
              className={mobileNavItem}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                <FiUser />
              </span>

              <span className="flex-1">Profile</span>

              <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
            </Link>

            <Link
              to="/orders"
              onClick={onClose}
              className={mobileNavItem}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                <FiPackage />
              </span>

              <span className="flex-1">Orders</span>

              <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
            </Link>

            <Link
              to="/notifications"
              onClick={onClose}
              className={mobileNavItem}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                <FiBell />
              </span>

              <span className="flex-1">Notifications</span>

              <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
            </Link>

            <div className="my-2 border-t border-[var(--border)]" />

            <button
              onClick={onLogout}
              className="
                group flex w-full items-center gap-3
                rounded-2xl
                px-4 py-3.5
                text-left
                text-[13px]
                font-medium
                text-red-500
                transition-all duration-300
                hover:bg-red-500/[0.06]
              "
            >
              <span
                className="
                  flex h-8 w-8
                  items-center justify-center
                  rounded-xl
                  bg-red-500/[0.08]
                  transition-all duration-300
                  group-hover:bg-red-500
                  group-hover:text-white
                "
              >
                <FiLogOut />
              </span>

              <span className="flex-1">Logout</span>

              <FiArrowUpRight className="text-xs opacity-50" />
            </button>

            {user.role === "admin" && (
              <>
                <div className="my-2 border-t border-[var(--border)]" />

                <Link
                  to="/admin"
                  onClick={onClose}
                  className="
                    group flex items-center gap-3
                    rounded-2xl
                    px-4 py-3
                    text-[11px]
                    font-semibold
                    tracking-wide
                    text-[var(--muted)]
                    transition-all
                    hover:bg-[var(--bg)]
                    hover:text-[var(--primary)]
                  "
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                    <FiShield />
                  </span>

                  <span className="flex-1">Admin Dashboard</span>

                  <FiArrowUpRight className="text-xs" />
                </Link>
              </>
            )}
          </>
        ) : (
          <>
            <Link
              to="/login"
              onClick={onClose}
              className={mobileNavItem}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                <FiUser />
              </span>

              <span className="flex-1">Sign In</span>

              <FiArrowUpRight className="text-xs" />
            </Link>

            <Link
              to="/register"
              onClick={onClose}
              className={mobileNavItem}
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bg)]">
                <FiHeart />
              </span>

              <span className="flex-1">Sign Up</span>

              <FiArrowUpRight className="text-xs" />
            </Link>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// Navbar
// ==========================================

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const cartItems = useSelector((state) => state.cart?.items) || [];

  const [accountOpen, setAccountOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      setAccountOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* ==========================================
          Desktop Navbar
      ========================================== */}

      <motion.header
        initial="hidden"
        animate="visible"
        variants={diagonalFadeIn}
        custom={0}
        className="
          sticky top-0 z-40 hidden md:block
          border-b border-[var(--border)]
          bg-[var(--card)]/85
          backdrop-blur-2xl
        "
      >
        <div
          className="
            mx-auto flex max-w-7xl
            items-center justify-between
            px-8 py-4
          "
        >
          {/* Brand */}

          <motion.div
            custom={1}
            variants={diagonalFadeIn}
            className="shrink-0"
          >
            <Link
              to="/"
              className="
                group flex items-center
                text-[var(--text)]
              "
            >
              <span
                className="
                  logo
                  text-2xl
                  font-bold
                  uppercase
                  tracking-[3px]
                  transition-colors
                  duration-300
                  group-hover:text-[var(--primary)]
                "
              >
                <Name />
              </span>
            </Link>
          </motion.div>

          {/* Main Navigation */}

          <nav
            className="
              flex items-center
              gap-1
              rounded-full
              border border-[var(--border)]
              bg-[var(--bg)]/40
              p-1
            "
          >
            {NAV_LINKS.map((link, index) => {
              const Icon = link.icon;

              return (
                <motion.div
                  key={link.path}
                  custom={2 + index}
                  variants={diagonalFadeIn}
                >
                  <Link
                    to={link.path}
                    className={navItemBase}
                  >
                    <Icon className="text-[13px] transition-transform duration-300 group-hover:-translate-y-0.5" />

                    <span>{link.label}</span>

                    {link.label === "Sale" && (
                      <span
                        className="
                          ml-0.5
                          h-1.5 w-1.5
                          rounded-full
                          bg-[var(--primary)]
                        "
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Actions */}

          <div className="flex items-center gap-1.5">
            <motion.div custom={6} variants={diagonalFadeIn}>
              <ThemeToggle />
            </motion.div>

            <motion.div custom={7} variants={diagonalFadeIn}>
              <Link
                to="/notifications"
                aria-label="Notifications"
                className={`relative ${iconBtnBase}`}
              >
                <FiBell />

                {/* Notification indicator */}

                <span
                  className="
                    absolute right-2.5 top-2
                    h-1.5 w-1.5
                    rounded-full
                    bg-[var(--primary)]
                  "
                />
              </Link>
            </motion.div>

            <motion.div custom={8} variants={diagonalFadeIn}>
              <Link
                to="/cart"
                aria-label="Cart"
                className={`relative ${iconBtnBase}`}
              >
                <FiShoppingCart />

                <CartBadge count={cartItems.length} />
              </Link>
            </motion.div>

            {/* Account */}

            <motion.div
              custom={9}
              variants={diagonalFadeIn}
              className="relative ml-1"
            >
              <button
                onClick={() => setAccountOpen((value) => !value)}
                aria-label="Account"
                className={`
                  ${iconBtnBase}
                  gap-1
                  ${
                    accountOpen
                      ? "bg-[var(--bg)] text-[var(--text)]"
                      : ""
                  }
                `}
              >
                <FiUser />

                <FiChevronDown
                  className="text-[10px] transition-transform duration-300"
                  style={{
                    transform: accountOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <AccountDropdown
                    user={user}
                    onClose={() => setAccountOpen(false)}
                    onLogout={handleLogout}
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* ==========================================
          Mobile Header
      ========================================== */}

      <motion.header
        initial="hidden"
        animate="visible"
        variants={diagonalFadeIn}
        custom={0}
        className="
          sticky top-0 z-40
          border-b border-[var(--border)]
          bg-[var(--card)]/90
          backdrop-blur-2xl
          md:hidden
        "
      >
        <div className="flex items-center justify-between px-5 py-4">
          {/* Left */}

          <div className="flex items-center gap-1">
            <motion.button
              custom={1}
              variants={diagonalFadeIn}
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
              className={iconBtnBase}
            >
              <FiMenu />
            </motion.button>

            <motion.div custom={2} variants={diagonalFadeIn}>
              <ThemeToggle />
            </motion.div>
          </div>

          {/* Center */}

          <motion.div custom={3} variants={diagonalFadeIn}>
            <Link
              to="/"
              className="
                logo
                text-xl
                font-bold
                uppercase
                tracking-[2px]
                text-[var(--text)]
              "
            >
              <Name />
            </Link>
          </motion.div>

          {/* Right */}

          <motion.div custom={4} variants={diagonalFadeIn}>
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center text-lg text-[var(--text)]"
            >
              <FiShoppingCart />

              <CartBadge count={cartItems.length} />
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* ==========================================
          Mobile Drawer
      ========================================== */}

      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Overlay */}

            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              onClick={closeDrawer}
              className="
                fixed inset-0 z-50
                bg-black/50
                backdrop-blur-sm
              "
            />

            {/* Drawer */}

            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={drawerVariants}
              className="
                fixed left-0 top-0 bottom-0 z-50
                flex w-[300px]
                flex-col
                border-r border-[var(--border)]
                bg-[var(--card)]
                shadow-[var(--shadow)]
              "
            >
              {/* Drawer Header */}

              <div
                className="
                  flex items-center justify-between
                  border-b border-[var(--border)]
                  px-6 py-5
                "
              >
                <Link
                  to="/"
                  onClick={closeDrawer}
                  className="
                    logo
                    text-xl
                    font-bold
                    tracking-[2px]
                    text-[var(--text)]
                  "
                >
                  <Name />
                </Link>

                <button
                  onClick={closeDrawer}
                  aria-label="Close"
                  className="
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    text-[var(--muted)]
                    transition-all
                    hover:bg-[var(--bg)]
                    hover:text-[var(--text)]
                  "
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* Navigation */}

              <nav className="flex-1 overflow-y-auto px-4 py-5">
                {/* Section title */}

                <p
                  className="
                    mb-3
                    px-4
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[2px]
                    text-[var(--muted)]
                  "
                >
                  Discover
                </p>

                {NAV_LINKS.map((link, index) => {
                  const Icon = link.icon;

                  return (
                    <motion.div
                      key={link.path}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      variants={diagonalFadeIn}
                    >
                      <Link
                        to={link.path}
                        onClick={closeDrawer}
                        className={mobileNavItem}
                      >
                        <span
                          className="
                            flex h-10 w-10
                            items-center justify-center
                            rounded-xl
                            bg-[var(--bg)]
                            transition-all
                            duration-300
                            group-hover:bg-[var(--card)]
                            group-hover:text-[var(--primary)]
                          "
                        >
                          <Icon className="text-[16px]" />
                        </span>

                        <span className="flex-1">
                          {link.label}
                        </span>

                        <FiArrowUpRight
                          className="
                            text-xs
                            opacity-0
                            transition-all
                            duration-300
                            group-hover:translate-x-0.5
                            group-hover:-translate-y-0.5
                            group-hover:opacity-100
                          "
                        />
                      </Link>
                    </motion.div>
                  );
                })}

                {/* Divider */}

                <div className="my-5 border-t border-[var(--border)]" />

                {/* Account section */}

                <p
                  className="
                    mb-3
                    px-4
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[2px]
                    text-[var(--muted)]
                  "
                >
                  Your Space
                </p>

                {/* Notifications */}

                <motion.div
                  custom={NAV_LINKS.length}
                  initial="hidden"
                  animate="visible"
                  variants={diagonalFadeIn}
                >
                  <Link
                    to="/notifications"
                    onClick={closeDrawer}
                    className={mobileNavItem}
                  >
                    <span
                      className="
                        relative
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-[var(--bg)]
                      "
                    >
                      <FiBell className="text-[16px]" />

                      <span
                        className="
                          absolute right-2 top-2
                          h-1.5 w-1.5
                          rounded-full
                          bg-[var(--primary)]
                        "
                      />
                    </span>

                    <span className="flex-1">
                      Notifications
                    </span>

                    <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </motion.div>

                {/* Orders */}

                {user && (
                  <motion.div
                    custom={NAV_LINKS.length + 1}
                    initial="hidden"
                    animate="visible"
                    variants={diagonalFadeIn}
                  >
                    <Link
                      to="/orders"
                      onClick={closeDrawer}
                      className={mobileNavItem}
                    >
                      <span
                        className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-xl
                          bg-[var(--bg)]
                          transition-all
                          group-hover:text-[var(--primary)]
                        "
                      >
                        <FiPackage className="text-[16px]" />
                      </span>

                      <span className="flex-1">
                        Orders
                      </span>

                      <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
                    </Link>
                  </motion.div>
                )}

                {/* Account */}

                <motion.div
                  custom={NAV_LINKS.length + 2}
                  initial="hidden"
                  animate="visible"
                  variants={diagonalFadeIn}
                >
                  <Link
                    to={user ? "/profile" : "/login"}
                    onClick={closeDrawer}
                    className={mobileNavItem}
                  >
                    <span
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-xl
                        bg-[var(--bg)]
                        transition-all
                        group-hover:text-[var(--primary)]
                      "
                    >
                      <FiUser className="text-[16px]" />
                    </span>

                    <span className="flex-1">
                      Account
                    </span>

                    <FiArrowUpRight className="text-xs opacity-0 transition-all group-hover:opacity-100" />
                  </Link>
                </motion.div>

                {/* Logout */}

                {user && (
                  <div className="mt-5 border-t border-[var(--border)] pt-5">
                    <button
                      onClick={async () => {
                        try {
                          await dispatch(logoutUser()).unwrap();

                          closeDrawer();

                          navigate("/");
                        } catch (error) {
                          console.error(
                            "Logout failed:",
                            error
                          );
                        }
                      }}
                      className="
                        group flex w-full items-center gap-3
                        rounded-2xl
                        border border-red-500/10
                        bg-red-500/[0.03]
                        px-4 py-3.5
                        text-sm
                        font-medium
                        text-red-500
                        transition-all duration-300
                        hover:border-red-500/20
                        hover:bg-red-500/[0.07]
                      "
                    >
                      <span
                        className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-xl
                          bg-red-500/10
                          transition-all duration-300
                          group-hover:bg-red-500
                          group-hover:text-white
                        "
                      >
                        <FiLogOut className="text-base" />
                      </span>

                      <span className="flex-1 text-left">
                        <span className="block text-[12px] font-semibold">
                          Logout
                        </span>

                        <span className="mt-0.5 block text-[9px] text-[var(--muted)]">
                          Sign out of your account
                        </span>
                      </span>

                      <FiArrowUpRight
                        className="
                          text-sm
                          opacity-50
                          transition-transform
                          group-hover:-translate-y-0.5
                          group-hover:translate-x-0.5
                        "
                      />
                    </button>
                  </div>
                )}

                {/* Admin */}

                {user?.role === "admin" && (
                  <motion.div
                    custom={NAV_LINKS.length + 3}
                    initial="hidden"
                    animate="visible"
                    variants={diagonalFadeIn}
                    className="mt-3"
                  >
                    <Link
                      to="/admin"
                      onClick={closeDrawer}
                      className="
                        group flex items-center gap-3
                        rounded-2xl
                        px-4 py-3
                        text-[11px]
                        font-bold
                        tracking-wide
                        text-[var(--muted)]
                        transition-all
                        hover:bg-[var(--bg)]
                        hover:text-[var(--primary)]
                      "
                    >
                      <span
                        className="
                          flex h-9 w-9
                          items-center justify-center
                          rounded-xl
                          bg-[var(--bg)]
                        "
                      >
                        <FiShield />
                      </span>

                      <span className="flex-1">
                        Admin Dashboard
                      </span>

                      <FiArrowUpRight className="text-xs" />
                    </Link>
                  </motion.div>
                )}
              </nav>

              {/* Guest Actions */}

              {!user && (
                <div
                  className="
                    flex flex-col gap-2.5
                    border-t border-[var(--border)]
                    p-5
                  "
                >
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="
                      rounded-2xl
                      bg-[var(--primary)]
                      py-3.5
                      text-center
                      text-[12px]
                      font-semibold
                      text-white
                      transition-all
                      hover:opacity-90
                    "
                  >
                    Sign In
                  </Link>

                  <Link
                    to="/register"
                    onClick={closeDrawer}
                    className="
                      rounded-2xl
                      border border-[var(--border)]
                      py-3.5
                      text-center
                      text-[12px]
                      font-semibold
                      text-[var(--text)]
                      transition-all
                      hover:border-[var(--primary)]
                      hover:text-[var(--primary)]
                    "
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ==========================================
// BottomNav
// ==========================================

function BottomNav() {
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);

  const isActive = (path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-40
        border-t border-[var(--border)]
        bg-[var(--card)]/90
        backdrop-blur-2xl
        md:hidden
      "
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {BOTTOM_NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;

          const active = isActive(item.path);

          const to =
            item.key === "account" && !user
              ? "/login"
              : item.path;

          return (
            <motion.div
              key={item.key}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={diagonalFadeIn}
              className="flex flex-1"
            >
              <Link
                to={to}
                className="
                  group relative
                  flex flex-1
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  py-2
                "
              >
                {/* Active Indicator */}

                {active && (
                  <motion.div
                    layoutId="bottomNavDot"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 25,
                    }}
                    className="
                      absolute
                      top-0.5
                      h-1
                      w-5
                      rounded-full
                      bg-[var(--primary)]
                    "
                  />
                )}

                {/* Icon */}

                <motion.div
                  animate={{
                    y: active ? -1 : 0,
                    scale: active ? 1.05 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 20,
                  }}
                  className="
                    flex h-7 w-7
                    items-center justify-center
                  "
                >
                  <Icon
                    className="text-[17px]"
                    style={{
                      color: active
                        ? "var(--primary)"
                        : "var(--muted)",
                    }}
                  />
                </motion.div>

                {/* Label */}

                <span
                  className="text-[9px] tracking-wide"
                  style={{
                    color: active
                      ? "var(--text)"
                      : "var(--muted)",

                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}

// ==========================================
// UserLayout
// ==========================================

export default function UserLayout() {
  const location = useLocation();

  return (
    <div
      className="
        flex min-h-screen
        flex-col
        selection:bg-[var(--accent)]
        selection:text-white
      "
    >
      <Navbar />

      <main className="flex-1 pb-24 md:pb-0">
        <motion.div
          key={location.pathname}
          variants={pageTransitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="h-full w-full"
        >
          <Outlet />
        </motion.div>
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}