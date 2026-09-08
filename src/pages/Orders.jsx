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
} from "react-icons/fi";

export default function Orders() {
  const dispatch = useDispatch();
  const { myOrders = [], loading } = useSelector((state) => state.orders);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
    dispatch(getOrdersUser());
  }, [dispatch]);

  if (loading) {
    return <Loading />;
  }

  // Quick Stats Calculations
  const totalOrders = myOrders?.length || 0;
  const totalSpent =
    myOrders?.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0;
  const pendingOrders =
    myOrders?.filter((o) => o.status === "pending" || o.status === "confirmed")
      .length || 0;

  // Filter orders by status tab
  const filteredOrders = myOrders.filter((order) => {
    if (selectedStatus === "all") return true;
    return order.status === selectedStatus;
  });

  const statusConfig = {
    pending: {
      label: "Pending",
      bg: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
      icon: FiClock,
    },
    confirmed: {
      label: "Confirmed",
      bg: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
      icon: FiCheckCircle,
    },
    shipped: {
      label: "Shipped",
      bg: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400",
      icon: FiTruck,
    },
    delivered: {
      label: "Delivered",
      bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
      icon: FiPackage,
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400",
      icon: FiXCircle,
    },
  };

  const getStatusBadge = (status) => {
    const current = statusConfig[status] || statusConfig.pending;
    const Icon = current.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.bg}`}
      >
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8 md:px-8 text-[var(--text)] font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[var(--text)]">
              My Orders
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1">
              Track and review all of your past and active store orders
            </p>
          </div>
          <button
            onClick={() => dispatch(getOrdersUser())}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--border)]/30 transition shadow-sm"
          >
            <FiRefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card p-6 flex items-center gap-5 border border-[var(--border)]">
            <div className="p-3.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-2xl">
              <FiShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Total Orders
              </p>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                {totalOrders}{" "}
                <span className="text-sm font-sans font-normal text-[var(--muted)]">
                  orders
                </span>
              </h3>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-5 border border-[var(--border)]">
            <div className="p-3.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-2xl">
              <FiClock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Active Orders
              </p>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                {pendingOrders}{" "}
                <span className="text-sm font-sans font-normal text-[var(--muted)]">
                  in progress
                </span>
              </h3>
            </div>
          </div>

          <div className="card p-6 flex items-center gap-5 border border-[var(--border)]">
            <div className="p-3.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <FiDollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">
                Total Investments
              </p>
              <h3 className="text-2xl font-serif font-bold text-[var(--text)] mt-1">
                {totalSpent.toLocaleString()}{" "}
                <span className="text-sm font-sans font-normal text-[var(--muted)]">
                  EGP
                </span>
              </h3>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="glass p-2 rounded-2xl flex items-center gap-2 overflow-x-auto border border-[var(--border)] scrollbar-none">
          {[
            { id: "all", label: "All Orders" },
            { id: "pending", label: "Pending" },
            { id: "confirmed", label: "Confirmed" },
            { id: "shipped", label: "Shipped" },
            { id: "delivered", label: "Delivered" },
            { id: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                selectedStatus === tab.id
                  ? "btn-primary shadow-md"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card border border-[var(--border)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--border)]/20 border-b border-[var(--border)] text-[var(--muted)] font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 pl-6">Order Code</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Items</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
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
                        className="hover:bg-[var(--border)]/20 transition-colors"
                      >
                        <td className="p-4 pl-6 font-serif font-bold text-base text-[var(--text)]">
                          {orderCode}
                        </td>
                        <td className="p-4 text-[var(--muted)] text-xs">
                          <span className="flex items-center gap-1.5">
                            <FiCalendar className="w-3.5 h-3.5 text-[var(--primary)]" />
                            {formattedDate}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--muted)]">
                          {order.items?.length || 0} item(s)
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text)] bg-[var(--border)]/40 px-2.5 py-1 rounded-lg border border-[var(--border)]">
                            {order.paymentMethod === "wallet" ? (
                              <FiCreditCard className="w-3.5 h-3.5 text-[var(--primary)]" />
                            ) : (
                              <FiDollarSign className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            {order.paymentMethod === "wallet"
                              ? "E-Wallet"
                              : "COD"}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[var(--text)]">
                          {order.totalPrice?.toLocaleString()} EGP
                        </td>
                        <td className="p-4">{getStatusBadge(order.status)}</td>
                        <td className="p-4 pr-6 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-xl text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 transition"
                          >
                            <FiEye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-12 text-center text-[var(--muted)]"
                    >
                      No orders found in this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative border border-[var(--border)]">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[var(--border)] pb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-[var(--text)]">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[var(--muted)] hover:text-[var(--text)] p-2 rounded-xl hover:bg-[var(--border)]/40 text-lg transition"
              >
                ✕
              </button>
            </div>

            {/* Current Status Banner */}
            <div className="flex items-center justify-between bg-[var(--border)]/20 p-4 rounded-2xl border border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Status
              </span>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[var(--border)]/20 p-5 rounded-2xl space-y-3 border border-[var(--border)]">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider flex items-center gap-2">
                <FiMapPin className="w-4 h-4" /> Delivery Address
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--text)]">
                <div>
                  <span className="text-[var(--muted)] text-xs block">
                    Recipient
                  </span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-xs block">Phone</span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.phone}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-xs block">City</span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.city}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--muted)] text-xs block">
                    Address
                  </span>
                  <span className="font-semibold">
                    {selectedOrder.shippingAddress?.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
                Items ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--card)]">
                {selectedOrder.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-xl border border-[var(--border)]"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-sm text-[var(--text)]">
                          {item.name}
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5">
                          Color: {item.color || "N/A"} | Size:{" "}
                          {item.size || "N/A"} | Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-[var(--text)]">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Summary */}
            <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center">
              <div>
                <span className="text-xs text-[var(--muted)] block uppercase tracking-wider">
                  Total Paid
                </span>
                <span className="text-2xl font-serif font-bold text-[var(--text)]">
                  {selectedOrder.totalPrice?.toLocaleString()} EGP
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn-primary px-6 py-2.5 rounded-xl text-xs font-semibold shadow-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}