import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getOrdersUser } from "../features/order/orderSlice";
import Loading from "../components/common/Loading";
import {
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiPackage,
  FiXCircle,
  FiEye,
  FiCreditCard,
  FiDollarSign,
  FiMapPin,
  FiRefreshCw,
  FiCalendar,
  FiCoffee,
  FiHash,
} from "react-icons/fi";

// Currency Component
function Currency({ amount, className = "" }) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return <span className={className}>NZ$ —</span>;
  }

  const formatted = Number(amount).toLocaleString("en-NZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return <span className={className}>NZ$ {formatted}</span>;
}

export default function Orders() {
  const dispatch = useDispatch();
  const { myOrders = [], myOrdersStats, myOrdersPagination, loading } = useSelector(
    (state) => state.orders
  );

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(getOrdersUser(page));
  }, [dispatch, page]);

  if (loading) {
    return <Loading />;
  }

  // Quick Stats — sourced from the backend's aggregate stats, not derived
  // from `myOrders`, since that array is now just the current page and
  // would silently under-report once someone has more than one page of
  // orders.
  const totalOrders = myOrdersStats?.totalOrders ?? myOrders?.length ?? 0;
  const totalSpent = myOrdersStats?.totalSpent ?? 0;
  const pendingOrders = myOrdersStats?.pendingOrders ?? 0;

  // Filter orders by status tab (only within the currently loaded page —
  // see the pagination controls below for moving between pages)
  const filteredOrders = myOrders.filter((order) => {
    if (selectedStatus === "all") return true;
    return order.status === selectedStatus;
  });

  // Unified status styling adhering to a warm restaurant palette
  const statusConfig = {
    pending: {
      label: "Preparing in Kitchen",
      bg: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
      icon: FiClock,
    },
    confirmed: {
      label: "Order Confirmed",
      bg: "bg-orange-500/10 text-orange-700 border-orange-500/20 dark:text-orange-400",
      icon: FiCheckCircle,
    },
    shipped: {
      label: "Out for Delivery",
      bg: "bg-amber-600/10 text-amber-800 border-amber-600/20 dark:text-amber-300",
      icon: FiTruck,
    },
    delivered: {
      label: "Served & Delivered",
      bg: "bg-emerald-600/10 text-emerald-800 border-emerald-600/20 dark:text-emerald-400",
      icon: FiPackage,
    },
    cancelled: {
      label: "Cancelled Order",
      bg: "bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-400",
      icon: FiXCircle,
    },
  };

  const getStatusBadge = (status) => {
    const current = statusConfig[status] || statusConfig.pending;
    const Icon = current.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.bg}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    );
  };

  // Order type is a separate concept from status/payment — kept visually
  // distinct wherever it's shown.
  const orderTypeConfig = {
    delivery: { label: "Delivery", icon: FiTruck },
    takeaway: { label: "Takeaway", icon: FiShoppingBag },
    dine_in: { label: "Dine In", icon: FiCoffee },
  };

  const getOrderTypeBadge = (order) => {
    // Legacy orders created before orderType existed fall back to
    // "Delivery" (the schema default) instead of showing nothing.
    const current =
      orderTypeConfig[order.orderType] || orderTypeConfig.delivery;
    const Icon = current.icon;

    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text)] bg-[var(--border)]/30 px-2.5 py-1 rounded-lg border border-[var(--border)]">
        <Icon className="w-3.5 h-3.5 text-[var(--primary)]" />
        {current.label}
        {order.orderType === "dine_in" && order.tableNumber && (
          <span className="text-[var(--muted)]">
            · Table {order.tableNumber}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-6 sm:px-6 md:px-8 text-[var(--text)] font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-[var(--text)]">
              My Meal Orders
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Track your fresh dishes, delivery status, and order history
            </p>
          </div>
          <button
            onClick={() => dispatch(getOrdersUser(page))}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)]/30 transition shadow-sm active:scale-95"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh Status
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          <div className="card p-5 md:p-6 flex items-center gap-4 border border-[var(--border)] rounded-2xl shadow-sm">
            <div className="p-3 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl shrink-0">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Total Orders Placed
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                {totalOrders}{" "}
                <span className="text-xs sm:text-sm font-sans font-normal text-[var(--muted)]">
                  meals
                </span>
              </h3>
            </div>
          </div>

          <div className="card p-5 md:p-6 flex items-center gap-4 border border-[var(--border)] rounded-2xl shadow-sm">
            <div className="p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl shrink-0">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Active Kitchen Orders
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                {pendingOrders}{" "}
                <span className="text-xs sm:text-sm font-sans font-normal text-[var(--muted)]">
                  in progress
                </span>
              </h3>
            </div>
          </div>

          <div className="card p-5 md:p-6 flex items-center gap-4 border border-[var(--border)] rounded-2xl shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-xl shrink-0">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">
                Total Food Spend
              </p>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] mt-0.5">
                <Currency amount={totalSpent} />
              </h3>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="glass p-1.5 sm:p-2 rounded-2xl flex items-center gap-1.5 sm:gap-2 overflow-x-auto border border-[var(--border)] scrollbar-none">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "In Kitchen" },
            { id: "confirmed", label: "Confirmed" },
            { id: "shipped", label: "On the Way" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedStatus === tab.id
                  ? "btn-primary shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
              <thead className="bg-[var(--border)]/20 border-b border-[var(--border)] text-[var(--muted)] font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Receipt #</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Dishes</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 pr-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text)]">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const orderCode = `#${order._id.slice(-6).toUpperCase()}`;
                    const formattedDate = new Date(
                      order.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-[var(--border)]/10 transition-colors"
                      >
                        <td className="p-4 pl-6 font-serif font-bold text-sm sm:text-base text-[var(--text)]">
                          {orderCode}
                        </td>
                        <td className="p-4 text-[var(--muted)] text-xs">
                          <span className="flex items-center gap-1.5">
                            <FiCalendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {formattedDate}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--muted)] text-xs sm:text-sm">
                          {order.items?.length || 0} item(s)
                        </td>
                        <td className="p-4">
                          {getOrderTypeBadge(order)}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text)] bg-[var(--border)]/30 px-2.5 py-1 rounded-lg border border-[var(--border)]">
                            {order.paymentMethod === "wallet" ? (
                              <FiCreditCard className="w-3.5 h-3.5 text-[var(--primary)]" />
                            ) : (
                              <FiDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {order.paymentMethod === "wallet"
                              ? "Digital Wallet"
                              : "Cash"}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[var(--text)] text-xs sm:text-sm">
                          <Currency amount={order.totalPrice} />
                        </td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition active:scale-95"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            View Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-12 text-center text-[var(--muted)] text-sm"
                    >
                      No meal orders found in this category.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        {myOrdersPagination && myOrdersPagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 py-4">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--border)]/20 transition"
            >
              Previous
            </button>

            <span className="text-sm text-[var(--muted)]">
              Page {myOrdersPagination.page} of {myOrdersPagination.totalPages}
            </span>

            <button
              type="button"
              disabled={page >= myOrdersPagination.totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--border)]/20 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-5 sm:p-6 md:p-8 space-y-5 md:space-y-6 relative border border-[var(--border)] bg-[var(--bg)]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)]">
                  Order Receipt #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1">
                  Ordered on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-2 rounded-xl hover:bg-[var(--border)]/40 text-base transition"
                aria-label="Close Modal"
              >
                ✕
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="flex items-center justify-between bg-[var(--border)]/10 p-3.5 sm:p-4 rounded-2xl border border-[var(--border)]">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Order Status
              </span>
              <div className="flex items-center gap-3">
                {getOrderTypeBadge(selectedOrder)}
                {getStatusBadge(selectedOrder.status)}
              </div>
            </div>

            {/* Fulfillment Details — fields shown depend on orderType */}
            <div className="bg-[var(--border)]/10 p-4 sm:p-5 rounded-2xl space-y-3 border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-2">
                <FiMapPin className="w-4 h-4" />
                {selectedOrder.orderType === "dine_in"
                  ? "Dine-In Details"
                  : selectedOrder.orderType === "takeaway"
                  ? "Takeaway Details"
                  : "Delivery Address"}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-[var(--text)]">
                {selectedOrder.orderType === "dine_in" && (
                  <div>
                    <span className="text-[var(--muted)] text-[11px] block">
                      Table Number
                    </span>
                    <span className="font-semibold flex items-center gap-1">
                      <FiHash className="w-3.5 h-3.5" />
                      {selectedOrder.tableNumber || "N/A"}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-[var(--muted)] text-[11px] block">
                    Customer Name
                  </span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.fullName || "Guest Customer"}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-[11px] block">
                    Contact Phone
                  </span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.phone || "N/A"}
                  </span>
                </div>

                {/* City/Address only ever apply to delivery orders */}
                {selectedOrder.orderType !== "takeaway" &&
                  selectedOrder.orderType !== "dine_in" && (
                    <>
                      <div>
                        <span className="text-[var(--muted)] text-[11px] block">
                          Area / City
                        </span>
                        <span className="font-semibold">
                          {selectedOrder.shippingAddress?.city || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)] text-[11px] block">
                          Street Address
                        </span>
                        <span className="font-semibold">
                          {selectedOrder.shippingAddress?.address || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                Ordered Dishes ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)]">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 sm:gap-4"
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border border-[var(--border)] shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-xs sm:text-sm text-[var(--text)] truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] sm:text-xs text-[var(--muted)] mt-0.5">
                          Variant: {item.variant || "Standard"} | Portion:{" "}
                          {item.size || "Regular"} | Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-[var(--text)] shrink-0">
                      <Currency amount={item.price * item.quantity} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Summary */}
            <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] sm:text-xs text-[var(--muted)] block uppercase tracking-wider">
                  Total Paid
                </span>
                <span className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)]">
                  <Currency amount={selectedOrder.totalPrice} />
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-primary px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm active:scale-95 transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}