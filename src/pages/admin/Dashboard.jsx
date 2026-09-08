import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  PiCurrencyDollarDuotone,
  PiShoppingBagDuotone,
  PiUsersDuotone,
  PiPackageDuotone,
  PiArrowUpRight,
  PiWarningCircle,
  PiPencilSimple,
  PiArrowRight,
} from "react-icons/pi";

import useSocket from "../../hooks/useSocket";
import {
  fetchDashboardCards,
  fetchRevenueChart,
  fetchOrdersChart,
  fetchLatestOrders,
  fetchLowStockProducts,
  setRevenuePeriod,
  setOrdersPeriod,
} from "../../features/dashboard/dashboardSlice";

import {
  getProducts,
  setEditid,
} from "../../features/products/productSlice";

import EditProduct from "../../components/products/EditProduct";
import useCountUp from "../../hooks/useCountUp";

/* =========================================================
   CONSTANTS
========================================================= */

const PERIODS = ["weekly", "monthly", "yearly"];

const currency = (value) =>
  `${Number(value || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} EGP`;

/* =========================================================
   ANIMATION
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 8,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: "easeOut",
    },
  },
};

/* =========================================================
   PERIOD SELECTOR
========================================================= */

function PeriodFilter({ current, onChange }) {
  return (
    <div className="flex items-center border-b border-border">
      {PERIODS.map((period) => {
        const active = current === period;

        return (
          <button
            key={period}
            type="button"
            onClick={() => onChange(period)}
            className={`
              relative px-3 py-2 text-xs font-medium capitalize
              transition-colors
              ${
                active
                  ? "text-text"
                  : "text-muted hover:text-text"
              }
            `}
          >
            {period}

            {active && (
              <span className="absolute inset-x-2 -bottom-px h-px bg-text" />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value = 0,
  isCurrency = false,
  note,
}) {
  const animatedValue = useCountUp(value, 900);

  const displayValue = isCurrency
    ? currency(animatedValue)
    : animatedValue.toLocaleString("en-US");

  return (
    <motion.div
      variants={fadeUp}
      className="
        border border-border
        bg-card
        px-5 py-5
        sm:px-6 sm:py-6
      "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            {label}
          </p>

          <p className="mt-3 text-[26px] font-semibold tracking-tight text-text sm:text-[30px]">
            {displayValue}
          </p>

          {note && (
            <p className="mt-1 text-xs text-muted">
              {note}
            </p>
          )}
        </div>

        <div
          className="
            flex h-9 w-9 shrink-0
            items-center justify-center
            border border-border
            bg-bg
            text-[18px]
            text-muted
          "
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   STAT SKELETON
========================================================= */

function StatSkeleton() {
  return (
    <div className="border border-border bg-card px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex justify-between">
        <div>
          <div className="h-3 w-20 animate-pulse bg-border/60" />

          <div className="mt-4 h-8 w-28 animate-pulse bg-border/60" />

          <div className="mt-2 h-3 w-16 animate-pulse bg-border/40" />
        </div>

        <div className="h-9 w-9 animate-pulse bg-border/60" />
      </div>
    </div>
  );
}

/* =========================================================
   CHART SKELETON
========================================================= */

function ChartSkeleton() {
  return (
    <div className="border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse bg-border/60" />

        <div className="h-8 w-32 animate-pulse bg-border/50" />
      </div>

      <div className="mt-7 h-[260px] animate-pulse bg-bg" />
    </div>
  );
}

/* =========================================================
   ROW SKELETON
========================================================= */

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse bg-border/60" />

        <div>
          <div className="h-3 w-24 animate-pulse bg-border/60" />
          <div className="mt-2 h-2.5 w-16 animate-pulse bg-border/40" />
        </div>
      </div>

      <div className="h-3 w-14 animate-pulse bg-border/60" />
    </div>
  );
}

/* =========================================================
   STATUS
========================================================= */

function Status({ status }) {
  const styles = {
    pending: "text-amber-600",
    confirmed: "text-blue-600",
    shipped: "text-purple-600",
    delivered: "text-green-600",
    cancelled: "text-red-600",
  };

  return (
    <span
      className={`text-xs capitalize ${
        styles[status] || "text-muted"
      }`}
    >
      {status || "pending"}
    </span>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const dispatch = useDispatch();
  const socket = useSocket();

  const [onlineUsers, setOnlineUsers] = useState(0);

  const { editid } = useSelector(
    (state) => state.products
  );

  const {
    cards,
    revenueChart,
    ordersChart,
    latestOrders,
    lowStock,
    revenuePeriod,
    ordersPeriod,
    loading,
  } = useSelector((state) => state.dashboard);

  /* =======================================================
     SOCKET
  ======================================================= */

  useEffect(() => {
    if (!socket) return;

    socket.emit("admin");

    const handleOnlineUsers = (count) => {
      setOnlineUsers(Number(count || 0));
    };

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    return () => {
      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );
    };
  }, [socket]);

  /* =======================================================
     INITIAL DATA
  ======================================================= */

  useEffect(() => {
    dispatch(fetchDashboardCards());
    dispatch(fetchLatestOrders());
    dispatch(fetchLowStockProducts());
    dispatch(getProducts());
  }, [dispatch]);

  /* =======================================================
     REVENUE
  ======================================================= */

  useEffect(() => {
    dispatch(
      fetchRevenueChart(revenuePeriod)
    );
  }, [dispatch, revenuePeriod]);

  /* =======================================================
     ORDERS
  ======================================================= */

  useEffect(() => {
    dispatch(
      fetchOrdersChart(ordersPeriod)
    );
  }, [dispatch, ordersPeriod]);

  /* =======================================================
     EDIT
  ======================================================= */

  const handleEdit = (item) => {
    const productId =
      item.productId ||
      item.product?._id ||
      item._id;

    if (!productId) return;

    dispatch(setEditid(productId));
  };

  /* =======================================================
     PROFIT
  ======================================================= */

  const profitMargin = useMemo(() => {
    if (!cards?.totalRevenue) return null;

    const percentage =
      ((cards.totalProfit || 0) /
        cards.totalRevenue) *
      100;

    return Number.isFinite(percentage)
      ? percentage.toFixed(1)
      : null;
  }, [cards]);

  /* =======================================================
     EDIT PRODUCT
  ======================================================= */

  if (editid) {
    return <EditProduct />;
  }

  const cardsLoading = loading && !cards;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-bg text-text">

      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
                Admin Panel
              </p>

              <h1 className="mt-1 font-serif text-3xl tracking-tight text-text sm:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-muted">
                Monitor your store performance,
                orders and inventory from one place.
              </p>
            </div>

            {/* ONLINE */}

            <div className="flex items-center gap-3 text-sm text-muted">

              <span className="relative flex h-2 w-2">
                <span className="absolute h-full w-full rounded-full bg-green-500 opacity-30" />
                <span className="relative h-2 w-2 rounded-full bg-green-500" />
              </span>

              <span>
                {onlineUsers} customers online
              </span>

            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <div className="mx-auto max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10">

        {/* =================================================
            STATS
        ================================================= */}

        {cardsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <StatSkeleton key={index} />
              )
            )}
          </div>
        ) : (
          <motion.div
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
            initial="hidden"
            animate="visible"
            className="
              grid grid-cols-1
              divide-y divide-border
              border border-border
              sm:grid-cols-2
              sm:divide-x sm:divide-y-0
              xl:grid-cols-4
            "
          >
            <StatCard
              icon={<PiCurrencyDollarDuotone />}
              label="Revenue"
              value={cards?.totalRevenue}
              isCurrency
              note={
                profitMargin
                  ? `${profitMargin}% profit margin`
                  : "Total store revenue"
              }
            />

            <StatCard
              icon={<PiShoppingBagDuotone />}
              label="Orders"
              value={cards?.totalOrders}
              note="All orders"
            />

            <StatCard
              icon={<PiUsersDuotone />}
              label="Customers"
              value={cards?.totalUsers}
              note="Registered customers"
            />

            <StatCard
              icon={<PiPackageDuotone />}
              label="Products"
              value={cards?.totalProducts}
              note="Products in catalogue"
            />
          </motion.div>
        )}

        {/* =================================================
            CHARTS
        ================================================= */}

        <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* REVENUE */}

          {loading && !revenueChart?.length ? (
            <ChartSkeleton />
          ) : (
            <section className="border border-border bg-card p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="font-serif text-xl text-text">
                    Revenue
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    Sales performance over time
                  </p>
                </div>

                <PeriodFilter
                  current={revenuePeriod}
                  onChange={(period) =>
                    dispatch(
                      setRevenuePeriod(
                        period
                      )
                    )
                  }
                />

              </div>

              <div className="mt-6 h-[280px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={
                      revenueChart || []
                    }
                    margin={{
                      top: 10,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      stroke="var(--border)"
                      vertical={false}
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="_id"
                      stroke="var(--muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="var(--muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      cursor={{
                        stroke:
                          "var(--border)",
                      }}
                      contentStyle={{
                        background:
                          "var(--card)",
                        border:
                          "1px solid var(--border)",
                        borderRadius:
                          "4px",
                        boxShadow:
                          "0 8px 30px rgba(0,0,0,0.06)",
                        color:
                          "var(--text)",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{
                        r: 4,
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>

              </div>
            </section>
          )}

          {/* ORDERS */}

          {loading && !ordersChart?.length ? (
            <ChartSkeleton />
          ) : (
            <section className="border border-border bg-card p-5 sm:p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h2 className="font-serif text-xl text-text">
                    Orders
                  </h2>

                  <p className="mt-1 text-xs text-muted">
                    Number of orders received
                  </p>
                </div>

                <PeriodFilter
                  current={ordersPeriod}
                  onChange={(period) =>
                    dispatch(
                      setOrdersPeriod(
                        period
                      )
                    )
                  }
                />

              </div>

              <div className="mt-6 h-[280px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={
                      ordersChart || []
                    }
                    margin={{
                      top: 10,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      stroke="var(--border)"
                      vertical={false}
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="_id"
                      stroke="var(--muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="var(--muted)"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      cursor={{
                        fill: "var(--bg)",
                      }}
                      contentStyle={{
                        background:
                          "var(--card)",
                        border:
                          "1px solid var(--border)",
                        borderRadius:
                          "4px",
                        boxShadow:
                          "0 8px 30px rgba(0,0,0,0.06)",
                        color:
                          "var(--text)",
                      }}
                    />

                    <Bar
                      dataKey="count"
                      fill="var(--primary)"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={34}
                    />

                  </BarChart>
                </ResponsiveContainer>

              </div>
            </section>
          )}
        </div>

        {/* =================================================
            LOWER CONTENT
        ================================================= */}

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">

          {/* =================================================
              LATEST ORDERS
          ================================================= */}

          <section className="border border-border bg-card">

            <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">

              <div>
                <h2 className="font-serif text-xl text-text">
                  Latest Orders
                </h2>

                <p className="mt-1 text-xs text-muted">
                  Most recent customer activity
                </p>
              </div>

              <PiArrowRight className="text-lg text-muted" />

            </div>

            <div className="px-5 sm:px-6">

              {loading &&
              !latestOrders?.length ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : !latestOrders?.length ? (
                <p className="py-10 text-center text-sm text-muted">
                  No orders yet.
                </p>
              ) : (
                latestOrders
                  .slice(0, 6)
                  .map((order) => (
                    <div
                      key={order._id}
                      className="
                        flex items-center
                        justify-between gap-4
                        border-b border-border
                        py-4 last:border-0
                      "
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          border border-border
                          bg-bg
                          text-xs font-semibold
                          text-text
                        ">
                          {(
                            order.user?.name ||
                            "G"
                          )[0].toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-medium text-text">
                            {order.user?.name ||
                              "Guest"}
                          </p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-[11px] text-muted">
                              #
                              {order.orderCode ||
                                order._id
                                  ?.slice(-6)
                                  .toUpperCase()}
                            </span>

                            <span className="text-border">
                              /
                            </span>

                            <Status
                              status={
                                order.status
                              }
                            />
                          </div>

                        </div>
                      </div>

                      <p className="shrink-0 text-sm font-semibold text-text">
                        {currency(
                          order.totalPrice
                        )}
                      </p>

                    </div>
                  ))
              )}

            </div>
          </section>

          {/* =================================================
              LOW STOCK
          ================================================= */}

          <section className="border border-border bg-card">

            <div className="flex items-center justify-between border-b border-border px-5 py-5 sm:px-6">

              <div>
                <div className="flex items-center gap-2">

                  <h2 className="font-serif text-xl text-text">
                    Inventory
                  </h2>

                  {lowStock?.length > 0 && (
                    <PiWarningCircle className="text-lg text-amber-600" />
                  )}

                </div>

                <p className="mt-1 text-xs text-muted">
                  Products that need attention
                </p>
              </div>

            </div>

            <div className="px-5 sm:px-6">

              {loading &&
              !lowStock?.length ? (
                <>
                  <RowSkeleton />
                  <RowSkeleton />
                  <RowSkeleton />
                </>
              ) : !lowStock?.length ? (
                <div className="py-10 text-center">

                  <p className="text-sm font-medium text-text">
                    Inventory looks healthy
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    No products need restocking.
                  </p>

                </div>
              ) : (
                lowStock
                  .slice(0, 6)
                  .map((item, index) => (
                    <div
                      key={
                        item._id ||
                        index
                      }
                      className="
                        flex items-center
                        justify-between gap-4
                        border-b border-border
                        py-4 last:border-0
                      "
                    >

                      <div className="min-w-0">

                        <p className="truncate text-sm font-medium text-text">
                          {item.name}
                        </p>

                        <p className="mt-1 text-xs text-muted">
                          {item.color ||
                            "No color"}{" "}
                          ·{" "}
                          {item.size ||
                            "No size"}
                        </p>

                      </div>

                      <div className="flex shrink-0 items-center gap-3">

                        <span className="text-xs font-medium text-amber-600">
                          {item.stock} left
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleEdit(
                              item
                            )
                          }
                          className="
                            flex h-8 w-8
                            items-center justify-center
                            border border-border
                            text-muted
                            transition-colors
                            hover:bg-bg
                            hover:text-text
                          "
                          aria-label={`Edit ${item.name}`}
                        >
                          <PiPencilSimple />
                        </button>

                      </div>

                    </div>
                  ))
              )}

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}