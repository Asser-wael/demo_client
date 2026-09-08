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
    y: 25,
    scale: 0.96,
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
    x: 80,
    scale: 0.9,
    transition: {
      duration: 0.25,
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
    return(<Loading />);
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-10 text-center text-red-500"
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
          className="w-24 h-24 rounded-full bg-muted/10 flex items-center justify-center mb-6"
        >
          <span className="text-4xl">🛒</span>
        </motion.div>

        <h2 className="text-3xl font-semibold mb-2">
          Your cart is empty
        </h2>

        <p className="text-muted max-w-md">
          Looks like you haven't added anything to your cart yet.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Your Cart
          </h1>

          <p className="text-muted mt-1">
            {items.length} {items.length === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(clearCart())}
          disabled={actionLoading}
          className="text-sm text-muted hover:text-red-500 transition-colors"
        >
          Clear cart
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">

        {/* Cart Items */}
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
                  whileHover={{
                    y: -3,
                    transition: { duration: 0.2 },
                  }}
                  className="group relative bg-card border border-border rounded-2xl p-4 md:p-5 flex gap-4 shadow-sm hover:shadow-lg transition-shadow"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 md:w-28 md:h-28 shrink-0 overflow-hidden rounded-xl bg-muted/10">
                    <motion.img
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.4 }}
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate">
                      {item.product.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-sm text-muted uppercase">
                      <span
                        className="px-2 rounded-3xl"
                        style={{
                          backgroundColor: item.color,
                          color: item.color
                        }}>.</span>
                      <span>•</span>
                      <span>{item.size}</span>
                    </div>

                    <div className="mt-3">
                      <span className="text-primary font-semibold">
                        L.E {price.toFixed(2)}
                      </span>

                      <span className="text-muted text-sm ml-2">
                        each
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="flex items-center gap-3 mt-4">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={
                          actionLoading || item.quantity <= 1
                        }
                        onClick={() => handleDecrease(item)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/20 disabled:opacity-40 transition"
                      >
                        −
                      </motion.button>

                      <motion.span
                        key={item.quantity}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-6 text-center font-medium"
                      >
                        {item.quantity}
                      </motion.span>

                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        disabled={actionLoading}
                        onClick={() => handleIncrease(item)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted/20 transition"
                      >
                        +
                      </motion.button>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex flex-col items-end justify-between">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      disabled={actionLoading}
                      onClick={() => handleRemove(item)}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-500/10 transition"
                      aria-label="Remove item"
                    >
                      ×
                    </motion.button>

                    <motion.div
                      key={itemTotal}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="font-semibold"
                    >
                      L.E {itemTotal.toFixed(2)}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
          }}
          className="lg:sticky lg:top-6 h-fit"
        >
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">

            <h2 className="text-xl font-semibold mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>L.E {total.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-green-500">
                  Free
                </span>
              </div>

              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <motion.span
                  key={total}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="text-xl font-bold text-primary"
                >
                  L.E {total.toFixed(2)}
                </motion.span>
              </div>
            </div>

            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="btn-primary w-full py-3.5 rounded-xl mt-6 font-semibold"
              onClick={() => navigate("/checkout")}
            >
              Checkout
            </motion.button>

            <p className="text-xs text-muted text-center mt-4">
              Secure checkout · Fast delivery
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}