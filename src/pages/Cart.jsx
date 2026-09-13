import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateCartItem,
  removeFromCart,
  clearCart,
  getCart,
} from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";

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

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 16,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
};

export default function Cart() {
  const { items = [], loading, actionLoading, error } = useSelector(
    (state) => state.cart
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getVariantPrice = (product, color, size) => {
    const variant = product?.variants?.find(
      (v) => v.color?.name === color
    );

    const sizeObj = variant?.sizes?.find(
      (s) => s.size === size
    );

    return sizeObj?.offerPrice ?? sizeObj?.price ?? 0;
  };

  const validItems = items.filter((item) => item?.product);

  const total = validItems.reduce((sum, item) => {
    const price = getVariantPrice(
      item.product,
      item.color,
      item.size
    );

    return sum + price * item.quantity;
  }, 0);

  const handleIncrease = (item) => {
    if (loading || actionLoading || !item?.product) return;

    dispatch(
      updateCartItem({
        productId: item.product._id,
        color: item.color,
        size: item.size,
        quantity: item.quantity + 1,
      })
    );
  };

  const handleDecrease = (item) => {
    if (
      loading ||
      actionLoading ||
      !item?.product ||
      item.quantity <= 1
    ) {
      return;
    }

    dispatch(
      updateCartItem({
        productId: item.product._id,
        color: item.color,
        size: item.size,
        quantity: item.quantity - 1,
      })
    );
  };

  const handleRemove = (item) => {
    if (loading || actionLoading || !item?.product) return;

    dispatch(
      removeFromCart({
        productId: item.product._id,
        color: item.color,
        size: item.size,
      })
    );
  };

  const handleClear = () => {
    if (loading || actionLoading || !validItems.length) return;

    dispatch(clearCart());
  };

  const handleCheckout = () => {
    if (loading || actionLoading || !validItems.length) return;

    navigate("/checkout");
  };

  useEffect(() => {
    dispatch(getCart());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 text-center text-accent bg-[var(--accent-light)] rounded-2xl max-w-xl mx-auto my-10 border border-[var(--border)]"
      >
        {error}
      </motion.div>
    );
  }

  if (!validItems.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 text-[var(--text)]"
      >
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 rounded-full bg-[var(--accent-light)] flex items-center justify-center mb-6"
        >
          <span className="text-4xl">🍽️</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text)] mb-2">
          Your order is empty
        </h2>

        <p className="text-[var(--muted)] max-w-md text-sm sm:text-base">
          You haven't added any delicious items to your order yet.
        </p>
      </motion.div>
    );
  }

  const isDisabled = loading || actionLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[var(--text)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-[var(--border)] pb-4"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Your Order
          </h1>

          <p className="text-[var(--muted)] text-xs sm:text-sm mt-1">
            {validItems.length}{" "}
            {validItems.length === 1
              ? "dish selected"
              : "dishes selected"}
          </p>
        </div>

        <motion.button
          whileHover={!isDisabled ? { scale: 1.03 } : {}}
          whileTap={!isDisabled ? { scale: 0.97 } : {}}
          onClick={handleClear}
          disabled={isDisabled}
          className="
            text-xs
            sm:text-sm
            font-medium
            text-[var(--muted)]
            hover:text-[var(--accent)]
            transition-colors
            px-3
            py-1.5
            rounded-lg
            hover:bg-[var(--accent-light)]
            disabled:opacity-40
            disabled:cursor-not-allowed
            disabled:hover:bg-transparent
            disabled:hover:text-[var(--muted)]
          "
        >
          {actionLoading ? "Clearing..." : "Clear order"}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8">
        {/* Selected Dishes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          <AnimatePresence mode="popLayout">
            {validItems.map((item) => {
              const price = getVariantPrice(
                item.product,
                item.color,
                item.size
              );

              const itemTotal = price * item.quantity;

              return (
                <motion.div
                  layout
                  key={`${item.product._id}-${item.color}-${item.size}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="
                    group
                    relative
                    bg-[var(--card)]
                    border
                    border-[var(--border)]
                    rounded-2xl
                    p-3
                    sm:p-5
                    flex
                    flex-col
                    sm:flex-row
                    gap-4
                    transition-all
                    duration-200
                    hover:-translate-y-0.5
                  "
                >
                  {/* Dish Image */}
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-[var(--bg)]">
                    <motion.img
                      whileHover={!isDisabled ? { scale: 1.05 } : {}}
                      transition={{ duration: 0.3 }}
                      src={item.product?.image}
                      alt={item.product?.name || "Dish"}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Dish Info & Quantity */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-[var(--text)] truncate">
                          {item.product?.name || "Dish"}
                        </h3>

                        {/* Mobile Remove Button */}
                        <motion.button
                          whileHover={!isDisabled ? { scale: 1.1 } : {}}
                          whileTap={!isDisabled ? { scale: 0.9 } : {}}
                          disabled={isDisabled}
                          onClick={() => handleRemove(item)}
                          className="
                            sm:hidden
                            w-7
                            h-7
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-[var(--muted)]
                            hover:text-[var(--accent)]
                            hover:bg-[var(--accent-light)]
                            transition
                            shrink-0
                            disabled:opacity-30
                            disabled:cursor-not-allowed
                          "
                          aria-label="Remove item"
                        >
                          ✕
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted)] capitalize">
                        <span className="font-medium text-[var(--text)]">
                          {item.color}
                        </span>

                        <span>•</span>

                        <span className="font-medium text-[var(--text)]">
                          {item.size}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Controls */}
                      <div className="flex items-center gap-2 bg-[var(--bg)] p-1 rounded-xl border border-[var(--border)]">
                        <motion.button
                          whileTap={!isDisabled ? { scale: 0.85 } : {}}
                          disabled={
                            isDisabled || item.quantity <= 1
                          }
                          onClick={() => handleDecrease(item)}
                          className="
                            w-7
                            h-7
                            rounded-lg
                            bg-[var(--card)]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[var(--text)]
                            hover:bg-[var(--primary)]
                            hover:text-white
                            disabled:opacity-30
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          −
                        </motion.button>

                        <motion.span
                          key={item.quantity}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-6 text-center font-bold text-sm text-[var(--text)]"
                        >
                          {item.quantity}
                        </motion.span>

                        <motion.button
                          whileTap={!isDisabled ? { scale: 0.85 } : {}}
                          disabled={isDisabled}
                          onClick={() => handleIncrease(item)}
                          className="
                            w-7
                            h-7
                            rounded-lg
                            bg-[var(--card)]
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-[var(--text)]
                            hover:bg-[var(--primary)]
                            hover:text-white
                            disabled:opacity-30
                            disabled:cursor-not-allowed
                            transition
                          "
                        >
                          +
                        </motion.button>
                      </div>

                      {/* Single Item Price */}
                      <div className="text-xs text-[var(--muted)]">
                        <Currency amount={price} /> / dish
                      </div>
                    </div>
                  </div>

                  {/* Item Total & Desktop Remove */}
                  <div className="flex sm:flex-col justify-between items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--border)]">
                    <motion.button
                      whileHover={!isDisabled ? { scale: 1.1 } : {}}
                      whileTap={!isDisabled ? { scale: 0.9 } : {}}
                      disabled={isDisabled}
                      onClick={() => handleRemove(item)}
                      className="
                        hidden
                        sm:flex
                        w-8
                        h-8
                        rounded-full
                        items-center
                        justify-center
                        text-[var(--muted)]
                        hover:text-[var(--accent)]
                        hover:bg-[var(--accent-light)]
                        transition
                        disabled:opacity-30
                        disabled:cursor-not-allowed
                      "
                      aria-label="Remove item"
                    >
                      ✕
                    </motion.button>

                    <motion.div
                      key={itemTotal}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-bold text-[var(--text)] text-base sm:text-lg"
                    >
                      <Currency amount={itemTotal} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="lg:sticky lg:top-6 h-fit"
        >
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6">
            <h2 className="text-lg font-bold text-[var(--text)] mb-5 border-b border-[var(--border)] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-[var(--muted)]">
                <span>Subtotal</span>

                <Currency
                  amount={total}
                  className="font-semibold text-[var(--text)]"
                />
              </div>

              <div className="flex justify-between text-[var(--muted)]">
                <span>Delivery</span>

                <span className="text-[var(--primary)] font-semibold bg-[var(--accent-light)] px-2 py-0.5 rounded-full text-xs">
                  Free
                </span>
              </div>

              <div className="border-t border-[var(--border)] pt-4 flex justify-between items-center">
                <span className="font-bold text-[var(--text)] text-base">
                  Total
                </span>

                <motion.div
                  key={total}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Currency
                    amount={total}
                    className="text-xl font-extrabold text-[var(--primary)]"
                  />
                </motion.div>
              </div>
            </div>

            <motion.button
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              disabled={isDisabled}
              className="
                w-full
                bg-[var(--primary)]
                hover:bg-[var(--primary-hover)]
                text-white
                py-3.5
                rounded-xl
                mt-6
                font-bold
                transition-all
                text-sm
                tracking-wide
                disabled:opacity-50
                disabled:cursor-not-allowed
                disabled:hover:bg-[var(--primary)]
              "
              onClick={handleCheckout}
            >
              {actionLoading ? "Updating order..." : "Proceed to Checkout"}
            </motion.button>

            <p className="text-xs text-[var(--muted)] text-center mt-4 flex items-center justify-center gap-1.5">
              <span>🔒</span>
              Secure order · Fresh delivery
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}