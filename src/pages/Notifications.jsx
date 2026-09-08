import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FiBell,
  FiCheck,
  FiInfo,
  FiPackage,
  FiShoppingBag,
  FiTrash2,
} from "react-icons/fi";

import Loading from "../components/common/Loading";

import {
  fetchUserNotifications,
  markUserNotificationAsRead,
  markAllUserNotificationsAsRead,
  deleteUserNotification,
} from "../features/notifications/userNotificationSlice";

export default function Notifications() {
  const dispatch = useDispatch();

  const {
    items: notifications = [],
    loading,
    error,
  } = useSelector((state) => state.userNotifications);

  // Get notifications
  useEffect(() => {
    dispatch(fetchUserNotifications());
  }, [dispatch]);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  // Unread count
  const unreadCount = notifications.filter(
    (item) => !item.isRead
  ).length;

  // Icon
  const getIcon = (type) => {
    if (type === "order") return <FiPackage />;
    if (type === "success") return <FiCheck />;
    if (type === "warning") return <FiShoppingBag />;

    return <FiInfo />;
  };

  // Mark one as read
  const handleRead = (notification) => {
    if (!notification.isRead) {
      dispatch(markUserNotificationAsRead(notification._id));
    }
  };

  // Mark all as read
  const handleReadAll = () => {
    if (unreadCount > 0) {
      dispatch(markAllUserNotificationsAsRead());
    }
  };

  // Delete
  const handleDelete = (id) => {
    dispatch(deleteUserNotification(id));
  };

  // Loading
  if (loading) {
    return <Loading />;
  }

  // Error
  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 md:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--text)]">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-[var(--muted)]">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notifications`
                : "You're all caught up"}
            </p>
          </div>

          <div className="w-11 h-11 rounded-xl border border-[var(--border)] bg-[var(--card)] flex items-center justify-center">
            <FiBell className="text-lg text-[var(--primary)]" />
          </div>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-sm font-medium text-[var(--primary)] hover:opacity-70 transition"
              >
                Mark all as read
              </button>
            )}
          </div>
        )}

        {/* Empty */}
        {notifications.length === 0 ? (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-10 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center">
              <FiBell className="text-2xl text-[var(--muted)]" />
            </div>

            <h2 className="text-lg font-semibold text-[var(--text)]">
              No notifications
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              You don't have any notifications yet.
            </p>
          </div>
        ) : (
          /* Notifications */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                onClick={() => handleRead(notification)}
                className={`
                  group flex gap-4 p-4 md:p-5
                  rounded-2xl border
                  bg-[var(--card)]
                  border-[var(--border)]
                  transition
                  hover:border-[var(--primary)]
                  cursor-pointer
                  ${!notification.isRead
                    ? "shadow-sm"
                    : "opacity-70"
                  }
                `}
              >
                {/* Icon */}
                <div
                  className={`
                    shrink-0
                    w-11 h-11
                    rounded-xl
                    flex items-center justify-center
                    text-lg
                    ${notification.isRead
                      ? "bg-[var(--bg)] text-[var(--muted)]"
                      : "bg-[var(--primary)]/10 text-[var(--primary)]"
                    }
                  `}
                >
                  {getIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-sm md:text-base text-[var(--text)]">
                        {notification.title || "Notification"}
                      </h3>

                      {!notification.isRead && (
                        <span className="inline-block mt-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                          New
                        </span>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification._id);
                      }}
                      className="shrink-0 p-2 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 transition opacity-0 group-hover:opacity-100"
                      aria-label="Delete notification"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {notification.message ||
                      notification.text ||
                      "You have a new notification."}
                  </p>

                  {notification.createdAt && (
                    <p className="mt-2 text-xs text-[var(--muted)]">
                      {new Date(
                        notification.createdAt
                      ).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}