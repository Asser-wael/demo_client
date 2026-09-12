import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../features/cart/cartSlice";
import { useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";

// Component Currency المدمج بنفس الضوابط المطلوبة
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

  const total = items.reduce((sum, item) => {
    const price = getVariantPrice(
      item.product,
      item.color,
      item.size
    );

    return sum + price * item.quantity;
  }, 0);

  const handleIncrease = (item) => {
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
    if (item.quantity <= 1) return;

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
    dispatch(
      removeFromCart({
        productId: item.product._id,
        color: item.color,
        size: item.size,
      })
    );
  };

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
        className="p-8 text-center text-rose-600 bg-rose-50 rounded-2xl max-w-xl mx-auto my-10 border border-rose-200"
      >
        {error}
      </motion.div>
    );
  }

  if (!items.length) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4"
      >
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-24 h-24 rounded-full bg-amber-100/80 flex items-center justify-center mb-6 shadow-inner"
        >
          <span className="text-4xl">🍽️</span>
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-amber-950 mb-2">
          Your order is empty
        </h2>

        <p className="text-stone-500 max-w-md text-sm sm:text-base">
          You haven't added any delicious items to your order yet.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 text-stone-800">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-row items-center justify-between mb-6 sm:mb-8 border-b border-stone-200/60 pb-4"
      >
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-amber-950 tracking-tight">
            Your Order
          </h1>

          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            {items.length} {items.length === 1 ? "dish selected" : "dishes selected"}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => dispatch(clearCart())}
          disabled={actionLoading}
          className="text-xs sm:text-sm font-medium text-stone-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
        >
          Clear order
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
            {items.map((item) => {
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
                  className="group relative bg-white border border-stone-200/80 rounded-2xl p-3 sm:p-5 flex flex-col sm:flex-row gap-4 shadow-xs hover:shadow-md transition-all duration-200"
                >
                  {/* Dish Image */}
                  <div className="relative w-full sm:w-28 h-40 sm:h-28 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                    <motion.img
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Dish Info & Quantity */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-amber-950 truncate">
                          {item.product.name}
                        </h3>
                        
                        {/* Mobile Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          disabled={actionLoading}
                          onClick={() => handleRemove(item)}
                          className="sm:hidden w-7 h-7 rounded-full flex items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                          aria-label="Remove item"
                        >
                          ✕
                        </motion.button>
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-stone-500 capitalize">
                        <span className="font-medium text-stone-700">{item.color}</span>
                        <span>•</span>
                        <span className="font-medium text-stone-700">{item.size}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Controls */}
                      <div className="flex items-center gap-2 bg-stone-100/80 p-1 rounded-xl border border-stone-200/50">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          disabled={actionLoading || item.quantity <= 1}
                          onClick={() => handleDecrease(item)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-stone-700 hover:bg-amber-500 hover:text-white disabled:opacity-30 transition"
                        >
                          −
                        </motion.button>

                        <motion.span
                          key={item.quantity}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-6 text-center font-bold text-sm text-amber-950"
                        >
                          {item.quantity}
                        </motion.span>

                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          disabled={actionLoading}
                          onClick={() => handleIncrease(item)}
                          className="w-7 h-7 rounded-lg bg-white shadow-xs flex items-center justify-center font-bold text-stone-700 hover:bg-amber-500 hover:text-white transition"
                        >
                          +
                        </motion.button>
                      </div>

                      {/* Single Item Price */}
                      <div className="text-xs text-stone-400">
                        <Currency amount={price} /> / dish
                      </div>
                    </div>
                  </div>

                  {/* Item Total & Desktop Remove */}
                  <div className="flex sm:flex-col justify-between items-end border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={actionLoading}
                      onClick={() => handleRemove(item)}
                      className="hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      aria-label="Remove item"
                    >
                      ✕
                    </motion.button>

                    <motion.div
                      key={itemTotal}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-bold text-amber-950 text-base sm:text-lg"
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
          <div className="bg-white border border-stone-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
            <h2 className="text-lg font-bold text-amber-950 mb-5 border-b border-stone-100 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <Currency amount={total} className="font-semibold text-stone-800" />
              </div>

              <div className="flex justify-between text-stone-600">
                <span>Delivery</span>
                <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                  Free
                </span>
              </div>

              <div className="border-t border-stone-100 pt-4 flex justify-between items-center">
                <span className="font-bold text-stone-900 text-base">
                  Total
                </span>

                <motion.div
                  key={total}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Currency amount={total} className="text-xl font-extrabold text-amber-600" />
                </motion.div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-xl mt-6 font-bold shadow-sm transition-all text-sm tracking-wide"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </motion.button>

            <p className="text-xs text-stone-400 text-center mt-4 flex items-center justify-center gap-1.5">
              <span>🔒</span> Secure order · Fresh delivery
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}