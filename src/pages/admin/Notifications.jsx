import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo, FiTrash2, FiBell } from "react-icons/fi";

import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../features/notifications/notificationsAdminSlice";

const typeConfig = {
  success: {
    icon: FiCheckCircle,
    bg: "bg-green-100 dark:bg-green-900/30",
    color: "text-green-600 dark:text-green-400",
  },
  warning: {
    icon: FiAlertTriangle,
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    color: "text-yellow-600 dark:text-yellow-400",
  },
  error: {
    icon: FiXCircle,
    bg: "bg-red-100 dark:bg-red-900/30",
    color: "text-red-600 dark:text-red-400",
  },
  info: {
    icon: FiInfo,
    bg: "bg-blue-100 dark:bg-blue-900/30",
    color: "text-blue-600 dark:text-blue-400",
  },
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const units = [
    { label: "y", secs: 31536000 },
    { label: "mo", secs: 2592000 },
    { label: "d", secs: 86400 },
    { label: "h", secs: 3600 },
    { label: "m", secs: 60 },
  ];

  for (const unit of units) {
    const value = Math.floor(seconds / unit.secs);
    if (value >= 1) return `${value}${unit.label} ago`;
  }

  return "just now";
};

const NotificationSkeleton = () => (
  <div className="flex gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:gap-4">
    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-[var(--color-border)] sm:h-10 sm:w-10" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 w-1/3 animate-pulse rounded-full bg-[var(--color-border)]" />
      <div className="h-3 w-3/4 animate-pulse rounded-full bg-[var(--color-border)]" />
      <div className="h-2.5 w-16 animate-pulse rounded-full bg-[var(--color-border)]" />
    </div>
  </div>
);

const listVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.96,
    transition: { duration: 0.25, ease: "easeInOut" },
  },
};

export default function Notifications() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.notificationsAdmin);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-3 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--color-text)] sm:text-2xl">
              Notifications
              {unreadCount > 0 && (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent)] px-1.5 text-xs font-semibold text-[var(--color-bg)]"
                >
                  {unreadCount}
                </motion.span>
              )}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "You're all caught up"}
            </p>
          </div>

          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => dispatch(markAllNotificationsAsRead())}
                className="w-full shrink-0 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-accent)] sm:w-auto"
              >
                Mark all as read
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <NotificationSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] py-16 text-center sm:py-20"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiBell className="mb-3 text-3xl text-[var(--color-muted)]" />
            </motion.div>
            <p className="font-medium text-[var(--color-text)]">No notifications yet</p>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              New activity will show up here
            </p>
          </motion.div>
        )}

        {!loading && items.length > 0 && (
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {items.map((notification) => {
                const config = typeConfig[notification.type] || typeConfig.info;
                const Icon = config.icon;

                return (
                  <motion.li
                    key={notification._id}
                    layout
                    variants={itemVariants}
                    exit="exit"
                    className={`group relative flex gap-3 rounded-2xl border p-3.5 transition-colors sm:gap-4 sm:p-4 ${
                      notification.read
                        ? "border-[var(--color-border)] bg-[var(--color-card)]"
                        : "border-[var(--color-accent)]/40 bg-[var(--color-card)] shadow-sm"
                    }`}
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full sm:h-10 sm:w-10 ${config.bg}`}
                    >
                      <Icon className={`text-base sm:text-lg ${config.color}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-medium text-[var(--color-text)] sm:text-base">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]"
                          />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted)] sm:text-sm">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <span className="text-xs text-[var(--color-muted)]">
                          {timeAgo(notification.createdAt)}
                        </span>

                        {!notification.read && (
                          <button
                            onClick={() => dispatch(markNotificationAsRead(notification._id))}
                            className="text-xs font-medium text-[var(--color-accent)] hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => dispatch(deleteNotification(notification._id))}
                      className="absolute right-3 top-3 text-[var(--color-muted)] opacity-0 transition hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100 sm:opacity-0"
                      aria-label="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        )}
      </div>
    </div>
  );
}
