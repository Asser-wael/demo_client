import React, { useEffect, useMemo, useState } from "react";
import {
  useDispatch as useReduxDispatch,
  useSelector as useReduxSelector,
} from "react-redux";

import {
  FiSearch,
  FiEye,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiClock,
  FiExternalLink,
  FiDollarSign,
  FiShoppingBag,
  FiCreditCard,
  FiMapPin,
  FiRefreshCw,
  FiX,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import {
  getOrders,
  changeOrderStatus,
} from "../../features/order/orderSlice";
import { printOrder } from "../../utils/printOrder";
import { showToast } from "../../utils/showToast";

// ============================================================
// STATUS CONFIG
// ============================================================

const statusConfig = {
  pending: {
    label: "Pending",
    color: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    icon: FiClock,
  },

  confirmed: {
    label: "Confirmed",
    color: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
    icon: FiCheckCircle,
  },

  shipped: {
    label: "Shipped",
    color: "text-purple-600 dark:text-purple-400",
    dot: "bg-purple-500",
    icon: FiTruck,
  },

  delivered: {
    label: "Delivered",
    color: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    icon: FiPackage,
  },

  cancelled: {
    label: "Cancelled",
    color: "text-rose-600 dark:text-rose-400",
    dot: "bg-rose-500",
    icon: FiXCircle,
  },
};

// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const current =
    statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        text-xs
        font-medium
        whitespace-nowrap
        ${current.color}
      `}
    >
      <span
        className={`
          w-1.5
          h-1.5
          rounded-full
          shrink-0
          ${current.dot}
        `}
      />

      {current.label}
    </span>
  );
}

// ============================================================
// STAT ITEM
// ============================================================

function StatItem({
  label,
  value,
  suffix,
  icon: Icon,
}) {
  return (
    <div
      className="
        bg-[var(--card)]
        border
        border-[var(--border)]
        px-4
        sm:px-5
        py-4
        sm:py-5
        min-w-0
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p
            className="
              text-[10px]
              sm:text-[11px]
              uppercase
              tracking-[0.12em]
              font-medium
              text-[var(--muted)]
            "
          >
            {label}
          </p>

          <div className="mt-2 flex items-baseline gap-1">
            <span
              className="
                text-xl
                sm:text-2xl
                font-semibold
                tracking-tight
                truncate
              "
            >
              {value}
            </span>

            {suffix && (
              <span
                className="
                  text-xs
                  text-[var(--muted)]
                  whitespace-nowrap
                "
              >
                {suffix}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <Icon
            className="
              w-4
              h-4
              sm:w-5
              sm:h-5
              text-[var(--muted)]
              shrink-0
            "
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// ORDER ROW
// ============================================================

function OrderRow({
  order,
  onView,
  onStatusChange,
  updatingOrderId,
  actionLoading,
}) {
  const orderCode = `#${order._id
    ?.slice(-6)
    .toUpperCase()}`;

  const isUpdating =
    updatingOrderId === order._id;

  const customer =
    order.shippingAddress?.fullName ||
    "Guest Customer";

  const phone =
    order.shippingAddress?.phone || "—";

  const itemsCount =
    order.items?.length || 0;

  return (
    <tr
      className="
        border-b
        border-[var(--border)]
        last:border-b-0
        hover:bg-[var(--bg)]/60
        transition-colors
      "
    >
      {/* ORDER */}
      <td className="px-4 sm:px-5 py-4">
        <div
          className="
            font-medium
            text-sm
            whitespace-nowrap
          "
        >
          {orderCode}
        </div>

        {order.createdAt && (
          <div
            className="
              flex
              items-center
              gap-1.5
              mt-1
              text-[10px]
              text-[var(--muted)]
              whitespace-nowrap
            "
          >
            <FiCalendar className="w-3 h-3" />

            {new Date(
              order.createdAt
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        )}
      </td>

      {/* CUSTOMER */}
      <td className="px-4 sm:px-5 py-4">
        <div className="min-w-0">
          <p
            className="
              text-sm
              font-medium
              truncate
              max-w-[180px]
            "
          >
            {customer}
          </p>

          <p
            className="
              text-xs
              text-[var(--muted)]
              mt-1
              truncate
              max-w-[180px]
            "
          >
            {phone}
          </p>
        </div>
      </td>

      {/* ITEMS */}
      <td
        className="
          px-4
          sm:px-5
          py-4
          text-sm
          text-[var(--muted)]
          whitespace-nowrap
        "
      >
        {itemsCount}{" "}
        {itemsCount === 1 ? "item" : "items"}
      </td>

      {/* PAYMENT */}
      <td className="px-4 sm:px-5 py-4">
        <div
          className="
            flex
            items-center
            gap-2
            text-xs
            text-[var(--muted)]
            whitespace-nowrap
          "
        >
          {order.paymentMethod === "wallet" ? (
            <FiCreditCard className="w-3.5 h-3.5" />
          ) : (
            <FiDollarSign className="w-3.5 h-3.5" />
          )}

          {order.paymentMethod === "wallet"
            ? "E-Wallet"
            : "Cash on Delivery"}
        </div>
      </td>

      {/* TOTAL */}
      <td
        className="
          px-4
          sm:px-5
          py-4
          text-sm
          font-semibold
          whitespace-nowrap
        "
      >
        {order.totalPrice?.toLocaleString() || 0} EGP
      </td>

      {/* STATUS */}
      <td className="px-4 sm:px-5 py-4">
        <StatusBadge status={order.status} />
      </td>

      {/* ACTIONS */}
      <td className="px-4 sm:px-5 py-4">
        <div
          className="
            flex
            items-center
            justify-end
            gap-2
          "
        >
          <select
            disabled={
              isUpdating ||
              actionLoading
            }
            value={order.status}
            onChange={(e) =>
              onStatusChange(
                order._id,
                e.target.value
              )
            }
            className="
              h-8
              px-2
              rounded-md
              border
              border-[var(--border)]
              bg-[var(--bg)]
              text-[11px]
              text-[var(--text)]
              outline-none
              cursor-pointer
              focus:border-[var(--primary)]
              disabled:opacity-50
            "
          >
            <option value="pending">
              Pending
            </option>

            <option value="confirmed">
              Confirmed
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>

            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <button
            type="button"
            onClick={() => onView(order)}
            className="
              w-8
              h-8
              rounded-md
              border
              border-[var(--border)]
              flex
              items-center
              justify-center
              text-[var(--muted)]
              hover:text-[var(--text)]
              hover:bg-[var(--bg)]
              transition
            "
            title="View order"
          >
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// MOBILE ORDER CARD
// ============================================================

function MobileOrderCard({
  order,
  onView,
  onStatusChange,
  updatingOrderId,
  actionLoading,
}) {
  const orderCode = `#${order._id
    ?.slice(-6)
    .toUpperCase()}`;

  const isUpdating =
    updatingOrderId === order._id;

  const customer =
    order.shippingAddress?.fullName ||
    "Guest Customer";

  const phone =
    order.shippingAddress?.phone || "—";

  return (
    <div
      className="
        px-4
        py-4
        border-b
        border-[var(--border)]
        last:border-b-0
        bg-[var(--card)]
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <div className="min-w-0">
          <p className="font-semibold text-sm">
            {orderCode}
          </p>

          {order.createdAt && (
            <p
              className="
                mt-1
                text-[10px]
                text-[var(--muted)]
              "
            >
              {new Date(
                order.createdAt
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <StatusBadge status={order.status} />
      </div>

      {/* CUSTOMER */}
      <div
        className="
          mt-4
          flex
          items-center
          gap-3
          min-w-0
        "
      >
        <div
          className="
            w-9
            h-9
            rounded-full
            border
            border-[var(--border)]
            flex
            items-center
            justify-center
            text-[var(--muted)]
            shrink-0
          "
        >
          <FiUser className="w-4 h-4" />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-sm
              font-medium
              truncate
            "
          >
            {customer}
          </p>

          <p
            className="
              text-xs
              text-[var(--muted)]
              truncate
              mt-0.5
            "
          >
            {phone}
          </p>
        </div>
      </div>

      {/* INFO */}
      <div
        className="
          grid
          grid-cols-2
          gap-x-4
          gap-y-3
          mt-4
          pt-4
          border-t
          border-[var(--border)]
        "
      >
        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-wide
              text-[var(--muted)]
            "
          >
            Items
          </p>

          <p className="mt-1 text-sm font-medium">
            {order.items?.length || 0}
          </p>
        </div>

        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-wide
              text-[var(--muted)]
            "
          >
            Payment
          </p>

          <p
            className="
              mt-1
              text-sm
              font-medium
              truncate
            "
          >
            {order.paymentMethod === "wallet"
              ? "E-Wallet"
              : "COD"}
          </p>
        </div>

        <div>
          <p
            className="
              text-[10px]
              uppercase
              tracking-wide
              text-[var(--muted)]
            "
          >
            Total
          </p>

          <p
            className="
              mt-1
              text-sm
              font-semibold
            "
          >
            {order.totalPrice?.toLocaleString() || 0} EGP
          </p>
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-4">
        <label
          className="
            block
            text-[10px]
            uppercase
            tracking-wide
            font-medium
            text-[var(--muted)]
            mb-1.5
          "
        >
          Update Status
        </label>

        <select
          disabled={
            isUpdating ||
            actionLoading
          }
          value={order.status}
          onChange={(e) =>
            onStatusChange(
              order._id,
              e.target.value
            )
          }
          className="
            w-full
            h-10
            px-3
            rounded-md
            border
            border-[var(--border)]
            bg-[var(--bg)]
            text-sm
            outline-none
            focus:border-[var(--primary)]
            disabled:opacity-50
          "
        >
          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="shipped">
            Shipped
          </option>

          <option value="delivered">
            Delivered
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>
      </div>

      {/* VIEW */}
      <button
        type="button"
        onClick={() => onView(order)}
        className="
          mt-3
          w-full
          h-10
          rounded-md
          border
          border-[var(--border)]
          text-sm
          font-medium
          flex
          items-center
          justify-center
          gap-2
          hover:bg-[var(--bg)]
          hover:text-[var(--primary)]
          transition
        "
      >
        <FiEye className="w-4 h-4" />

        View Order
      </button>
    </div>
  );
}

// ============================================================
// ORDER MODAL
// ============================================================

function OrderModal({
  order,
  onClose,
  onStatusChange,
  updatingOrderId,
  actionLoading,
}) {
  if (!order) return null;

  const isUpdating =
    updatingOrderId === order._id;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        bg-black/50
        flex
        items-center
        justify-center
        p-3
        sm:p-5
      "
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-2xl
          max-h-[94vh]
          overflow-y-auto
          bg-[var(--card)]
          border
          border-[var(--border)]
          shadow-2xl
        "
      >
        {/* HEADER */}
        <div
          className="
            sticky
            top-0
            z-10
            bg-[var(--card)]
            px-4
            sm:px-6
            py-4
            border-b
            border-[var(--border)]
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div className="min-w-0">
            <p
              className="
                text-[10px]
                uppercase
                tracking-[0.12em]
                text-[var(--muted)]
              "
            >
              Order Details
            </p>

            <h2
              className="
                mt-1
                text-lg
                sm:text-xl
                font-semibold
                truncate
              "
            >
              #
              {order._id
                ?.slice(-6)
                .toUpperCase()}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              w-9
              h-9
              rounded-md
              border
              border-[var(--border)]
              flex
              items-center
              justify-center
              text-[var(--muted)]
              hover:text-[var(--text)]
              transition
              shrink-0
            "
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* STATUS */}
          <section>
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-[10px]
                    uppercase
                    tracking-[0.12em]
                    text-[var(--muted)]
                  "
                >
                  Current Status
                </p>

                <div className="mt-2">
                  <StatusBadge status={order.status} />
                </div>
              </div>

              <select
                disabled={
                  isUpdating ||
                  actionLoading
                }
                value={order.status}
                onChange={(e) =>
                  onStatusChange(
                    order._id,
                    e.target.value
                  )
                }
                className="
                  h-10
                  w-full
                  sm:w-auto
                  min-w-[150px]
                  px-3
                  rounded-md
                  border
                  border-[var(--border)]
                  bg-[var(--bg)]
                  text-sm
                  outline-none
                  focus:border-[var(--primary)]
                "
              >
                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="shipped">
                  Shipped
                </option>

                <option value="delivered">
                  Delivered
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </section>

          {/* SHIPPING */}
          <section>
            <div
              className="
                flex
                items-center
                gap-2
                pb-3
                border-b
                border-[var(--border)]
              "
            >
              <FiMapPin className="w-4 h-4 text-[var(--primary)]" />

              <h3 className="text-sm font-semibold">
                Shipping Information
              </h3>
            </div>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-x-6
                gap-y-4
                pt-4
              "
            >
              <InfoField
                label="Customer Name"
                value={
                  order.shippingAddress
                    ?.fullName
                }
              />

              <InfoField
                label="Phone"
                value={
                  order.shippingAddress?.phone
                }
              />

              <InfoField
                label="City"
                value={
                  order.shippingAddress?.city
                }
              />

              <InfoField
                label="Address"
                value={
                  order.shippingAddress?.address
                }
              />
            </div>
          </section>

          {/* WALLET */}
          {order.paymentMethod ===
            "wallet" &&
            order.walletPayment && (
              <section>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    pb-3
                    border-b
                    border-[var(--border)]
                  "
                >
                  <FiCreditCard className="w-4 h-4 text-[var(--primary)]" />

                  <h3 className="text-sm font-semibold">
                    Wallet Payment
                  </h3>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    gap-4
                    pt-4
                  "
                >
                  <InfoField
                    label="Sender Name"
                    value={
                      order.walletPayment
                        ?.senderName
                    }
                  />

                  <InfoField
                    label="Sender Phone"
                    value={
                      order.walletPayment
                        ?.senderPhone
                    }
                  />

                  <div className="sm:col-span-2">
                    <p
                      className="
                        text-[10px]
                        uppercase
                        tracking-wide
                        text-[var(--muted)]
                      "
                    >
                      Transaction ID
                    </p>

                    <p
                      className="
                        mt-1
                        font-mono
                        text-xs
                        break-all
                      "
                    >
                      {
                        order.walletPayment
                          ?.transactionId
                      }
                    </p>
                  </div>
                </div>

                {order.walletPayment
                  ?.transferImage && (
                    <a
                      href={
                        order.walletPayment
                          .transferImage
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="
                      mt-4
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-medium
                      text-[var(--primary)]
                      hover:underline
                    "
                    >
                      <FiExternalLink className="w-3.5 h-3.5" />

                      View payment receipt
                    </a>
                  )}
              </section>
            )}

          {/* ITEMS */}
          <section>
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                pb-3
                border-b
                border-[var(--border)]
              "
            >
              <h3 className="text-sm font-semibold">
                Order Items
              </h3>

              <span
                className="
                  text-xs
                  text-[var(--muted)]
                "
              >
                {order.items?.length || 0} items
              </span>
            </div>

            <div className="divide-y divide-[var(--border)]">
              {order.items?.map(
                (item, index) => (
                  <div
                    key={index}
                    className="
                      py-4
                      flex
                      items-center
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                      "
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="
                            w-12
                            h-12
                            object-cover
                            rounded-md
                            border
                            border-[var(--border)]
                            shrink-0
                          "
                        />
                      ) : (
                        <div
                          className="
                            w-12
                            h-12
                            rounded-md
                            border
                            border-[var(--border)]
                            flex
                            items-center
                            justify-center
                            text-[var(--muted)]
                            shrink-0
                          "
                        >
                          <FiShoppingBag className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p
                          className="
                            text-sm
                            font-medium
                            truncate
                          "
                        >
                          {item.name}
                        </p>

                        <p
                          className="
                            text-[10px]
                            text-[var(--muted)]
                            mt-1
                            break-words
                          "
                        >
                          {item.color || "N/A"}{" "}
                          ·{" "}
                          {item.size || "N/A"}{" "}
                          · Qty {item.quantity}
                        </p>
                      </div>
                    </div>

                    <p
                      className="
                        text-sm
                        font-semibold
                        whitespace-nowrap
                      "
                    >
                      {(
                        (item.price || 0) *
                        (item.quantity || 0)
                      ).toLocaleString()}{" "}
                      EGP
                    </p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* TOTAL */}
          <div
            className="
    pt-5
    border-t
    border-[var(--border)]
    flex
    items-end
    justify-between
    gap-4
  "
          >
            <div>
              <p
                className="
        text-[10px]
        uppercase
        tracking-[0.12em]
        text-[var(--muted)]
      "
              >
                Grand Total
              </p>

              <p
                className="
        mt-1
        text-xl
        sm:text-2xl
        font-semibold
      "
              >
                {order.totalPrice?.toLocaleString() || 0}{" "}
                <span
                  className="
          text-xs
          font-normal
          text-[var(--muted)]
        "
                >
                  EGP
                </span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* WhatsApp */}
              <button
                type="button"
                title="Open WhatsApp"
                aria-label="Open WhatsApp"
                onClick={() => {
                  const phone = order?.shippingAddress?.phone;

                  if (!phone) {
                    showToast({
                      type: "error",
                      message: "Customer phone number is not available",
                    });
                    return;
                  }

                  const cleanPhone = String(phone).replace(/\D/g, "");

                  window.open(
                    `https://wa.me/2${cleanPhone}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="
        h-9
        w-9
        rounded-md
        bg-[#25D366]
        text-white
        flex
        items-center
        justify-center
        hover:bg-[#20BD5A]
        transition
        shadow-sm
        hover:shadow-md
      "
              >
                <FaWhatsapp className="text-lg" />
              </button>

              {/* Print */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await printOrder(order);

                    console.log(
                      "✅ Order printed successfully:",
                      order._id
                    );

                    showToast({
                      type: "success",
                      message: "Order printed successfully",
                    });
                  } catch (error) {
                    console.error(
                      "❌ Order printing failed:",
                      error
                    );

                    showToast({
                      type: "error",
                      message: "Order received, but printing failed",
                    });
                  }
                }}
                className="
        h-9
        px-4
        rounded-md
        border
        border-[var(--border)]
        text-xs
        font-medium
        hover:bg-[var(--bg)]
        transition
      "
              >
                Print
              </button>

              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                className="
        h-9
        px-4
        rounded-md
        border
        border-[var(--border)]
        text-xs
        font-medium
        hover:bg-[var(--bg)]
        transition
      "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// INFO FIELD
// ============================================================

function InfoField({ label, value }) {
  return (
    <div className="min-w-0">
      <p
        className="
          text-[10px]
          uppercase
          tracking-wide
          text-[var(--muted)]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          text-sm
          font-medium
          break-words
        "
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function OrdersAdmin() {
  const dispatch = useReduxDispatch();

  const {
    orders,
    loading,
    actionLoading,
  } = useReduxSelector(
    (state) => state.orders
  );

  const [selectedStatus, setSelectedStatus] =
    useState("all");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [updatingOrderId, setUpdatingOrderId] =
    useState(null);

  // ==========================================================
  // FETCH ORDERS
  // ==========================================================

  useEffect(() => {
    dispatch(getOrders());
  }, [dispatch]);

  // ==========================================================
  // STATUS UPDATE
  // ==========================================================

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    setUpdatingOrderId(orderId);

    const result = await dispatch(
      changeOrderStatus({
        id: orderId,
        status: newStatus,
      })
    );

    if (
      changeOrderStatus.fulfilled.match(
        result
      )
    ) {
      if (
        selectedOrder &&
        selectedOrder._id === orderId
      ) {
        setSelectedOrder((prev) => ({
          ...prev,
          status: newStatus,
        }));
      }
    }

    setUpdatingOrderId(null);
  };

  // ==========================================================
  // STATS
  // ==========================================================

  const totalRevenue = useMemo(() => {
    return (
      orders?.reduce(
        (total, order) =>
          total + (order.totalPrice || 0),
        0
      ) || 0
    );
  }, [orders]);

  const totalOrders = orders?.length || 0;

  const pendingOrders =
    orders?.filter(
      (order) =>
        order.status === "pending"
    ).length || 0;

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredOrders = useMemo(() => {
    const query =
      searchQuery.trim().toLowerCase();

    return (orders || []).filter(
      (order) => {
        const orderCode = order._id
          ? order._id
            .slice(-6)
            .toUpperCase()
          : "";

        const customerName =
          order.shippingAddress?.fullName?.toLowerCase() ||
          "";

        const phone =
          order.shippingAddress?.phone
            ?.toLowerCase() || "";

        const matchesStatus =
          selectedStatus === "all" ||
          order.status === selectedStatus;

        const matchesSearch =
          !query ||
          orderCode
            .toLowerCase()
            .includes(query) ||
          customerName.includes(query) ||
          phone.includes(query);

        return (
          matchesStatus &&
          matchesSearch
        );
      }
    );
  }, [
    orders,
    selectedStatus,
    searchQuery,
  ]);

  // ==========================================================
  // ESCAPE MODAL
  // ==========================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedOrder(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        w-full
        bg-[var(--bg)]
        text-[var(--text)]
        px-7
        sm:px-6
        lg:px-8
        py-5
        sm:py-6
        lg:py-8
        max-sm:-translate-x-7
      "
    >

      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={handleStatusChange}
          updatingOrderId={updatingOrderId}
          actionLoading={actionLoading}
        />
      )}
      <div
        className="
          max-w-[1500px]
          mx-auto
          space-y-5
          sm:space-y-6
        "
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <header
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            justify-between
            gap-4
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-[11px]
                text-[var(--muted)]
                mb-2
              "
            >
              <span>Dashboard</span>

              <span>/</span>

              <span>Orders</span>
            </div>

            <h1
              className="
                text-2xl
                sm:text-3xl
                font-semibold
                tracking-tight
              "
            >
              Orders
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-[var(--muted)]
              "
            >
              Manage and track customer orders.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(getOrders())
            }
            disabled={loading}
            className="
              w-full
              sm:w-auto
              h-10
              px-4
              rounded-md
              border
              border-[var(--border)]
              bg-[var(--card)]
              text-xs
              font-medium
              flex
              items-center
              justify-center
              gap-2
              hover:bg-[var(--bg)]
              transition
              disabled:opacity-50
            "
          >
            <FiRefreshCw
              className={`
                w-4
                h-4
                ${loading ? "animate-spin" : ""}
              `}
            />

            Refresh
          </button>
        </header>

        {/* ==================================================
            STATS
        ================================================== */}

        <section
          className="
            grid
            grid-cols-1
            sm:grid-cols-3
            gap-px
            bg-[var(--border)]
            border
            border-[var(--border)]
          "
        >
          <StatItem
            label="Total Revenue"
            value={totalRevenue.toLocaleString()}
            suffix="EGP"
            icon={FiDollarSign}
          />

          <StatItem
            label="Total Orders"
            value={totalOrders}
            suffix="orders"
            icon={FiShoppingBag}
          />

          <StatItem
            label="Pending Actions"
            value={pendingOrders}
            suffix="orders"
            icon={FiClock}
          />
        </section>

        {/* ==================================================
            FILTER BAR
        ================================================== */}

        <section
          className="
            border
            border-[var(--border)]
            bg-[var(--card)]
            p-3
            sm:p-4
          "
        >
          <div
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              justify-between
              gap-3
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative
                w-full
                lg:w-[360px]
              "
            >
              <FiSearch
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  w-4
                  h-4
                  text-[var(--muted)]
                "
              />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(
                    e.target.value
                  )
                }
                placeholder="Search orders..."
                className="
                  w-full
                  h-10
                  pl-10
                  pr-3
                  rounded-md
                  border
                  border-[var(--border)]
                  bg-[var(--bg)]
                  text-sm
                  outline-none
                  placeholder:text-[var(--muted)]
                  focus:border-[var(--primary)]
                  transition
                "
              />
            </div>

            {/* STATUS */}

            <div
              className="
                flex
                items-center
                gap-1
                overflow-x-auto
                pb-0.5
                scrollbar-none
              "
            >
              {[
                {
                  id: "all",
                  label: "All",
                },
                {
                  id: "pending",
                  label: "Pending",
                },
                {
                  id: "confirmed",
                  label: "Confirmed",
                },
                {
                  id: "shipped",
                  label: "Shipped",
                },
                {
                  id: "delivered",
                  label: "Delivered",
                },
                {
                  id: "cancelled",
                  label: "Cancelled",
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setSelectedStatus(
                      tab.id
                    )
                  }
                  className={`
                    h-9
                    px-3
                    rounded-md
                    text-xs
                    font-medium
                    whitespace-nowrap
                    transition
                    shrink-0
                    ${selectedStatus ===
                      tab.id
                      ? "bg-[var(--text)] text-[var(--bg)]"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ==================================================
            RESULTS INFO
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <p
            className="
              text-xs
              text-[var(--muted)]
            "
          >
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1
              ? "order"
              : "orders"}{" "}
            found
          </p>

          {(searchQuery ||
            selectedStatus !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStatus("all");
                }}
                className="
                text-xs
                text-[var(--muted)]
                hover:text-[var(--text)]
                transition
              "
              >
                Clear filters
              </button>
            )}
        </div>

        {/* ==================================================
            ORDERS
        ================================================== */}

        <section
          className="
            border
            border-[var(--border)]
            bg-[var(--card)]
            overflow-hidden
          "
        >
          {/* DESKTOP */}

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr
                  className="
                    border-b
                    border-[var(--border)]
                  "
                >
                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Order
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Customer
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Items
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Payment
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Total
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-5
                      py-3.5
                      text-right
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.12em]
                      text-[var(--muted)]
                    "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="
                        py-16
                        text-center
                        text-sm
                        text-[var(--muted)]
                      "
                    >
                      <FiRefreshCw
                        className="
                          w-5
                          h-5
                          animate-spin
                          mx-auto
                          mb-3
                        "
                      />

                      Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map(
                    (order) => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        onView={
                          setSelectedOrder
                        }
                        onStatusChange={
                          handleStatusChange
                        }
                        updatingOrderId={
                          updatingOrderId
                        }
                        actionLoading={
                          actionLoading
                        }
                      />
                    )
                  )
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="
                        py-16
                        text-center
                      "
                    >
                      <FiShoppingBag
                        className="
                          w-6
                          h-6
                          mx-auto
                          text-[var(--muted)]
                          mb-3
                        "
                      />

                      <p
                        className="
                          text-sm
                          font-medium
                        "
                      >
                        No orders found
                      </p>

                      <p
                        className="
                          text-xs
                          text-[var(--muted)]
                          mt-1
                        "
                      >
                        Try changing your search
                        or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE */}

          <div className="md:hidden">
            {loading ? (
              <div
                className="
                  py-16
                  text-center
                  text-sm
                  text-[var(--muted)]
                "
              >
                <FiRefreshCw
                  className="
                    w-5
                    h-5
                    animate-spin
                    mx-auto
                    mb-3
                  "
                />

                Loading orders...
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map(
                (order) => (
                  <MobileOrderCard
                    key={order._id}
                    order={order}
                    onView={
                      setSelectedOrder
                    }
                    onStatusChange={
                      handleStatusChange
                    }
                    updatingOrderId={
                      updatingOrderId
                    }
                    actionLoading={
                      actionLoading
                    }
                  />
                )
              )
            ) : (
              <div
                className="
                  py-16
                  text-center
                "
              >
                <FiShoppingBag
                  className="
                    w-6
                    h-6
                    mx-auto
                    text-[var(--muted)]
                    mb-3
                  "
                />

                <p className="text-sm font-medium">
                  No orders found
                </p>

                <p
                  className="
                    text-xs
                    text-[var(--muted)]
                    mt-1
                  "
                >
                  Try changing your search
                  or filters.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>


    </div>
  );
}