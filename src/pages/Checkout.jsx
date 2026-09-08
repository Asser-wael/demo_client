import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiDollarSign,
  FiCreditCard,
  FiUpload,
  FiShoppingBag,
  FiCheckCircle,
  FiLoader,
  FiArrowRight,
  FiAlertCircle,
  FiX,
} from "react-icons/fi";

import {
  clearCart,
  getCart,
  selectCartItems,
  selectCartLoading,
} from "../features/cart/cartSlice";

import { checkoutOrder } from "../features/order/orderSlice";

/* =========================================================
   Get correct item price
========================================================= */

const getItemPrice = (item) => {
  // Buy Now / simple item
  if (!item?.product?.variants) {
    return Number(item?.offerPrice || item?.price || 0);
  }

  const variant = item.product.variants.find(
    (v) => v.color?.name === item.color
  );

  const sizeInfo = variant?.sizes?.find((s) => s.size === item.size);

  return Number(
    sizeInfo?.offerPrice ?? sizeInfo?.price ?? item?.offerPrice ?? item?.price ?? 0
  );
};

/* =========================================================
   Field
========================================================= */

const Field = React.forwardRef(({ icon, error, className = "", ...props }, ref) => (
  <div>
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
        {icon}
      </span>
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-xl border bg-card px-4 py-3 pl-11 text-sm text-text placeholder:text-muted transition-colors focus:outline-none focus:ring-1 ${error
          ? "border-red-400 focus:border-red-400 focus:ring-red-400"
          : "border-border focus:border-primary focus:ring-primary"
          } ${className}`}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500">{error.message}</p>}
  </div>
));
Field.displayName = "Field";

/* =========================================================
   Payment Option
========================================================= */

function PaymentOption({ active, icon, title, onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={`flex flex-col items-center gap-2 rounded-xl border px-4 py-5 text-sm transition ${active
        ? "border-primary bg-primary/10 text-primary"
        : "border-border text-muted hover:border-primary/50"
        }`}
    >
      <span className="text-xl">{icon}</span>
      {title}
    </motion.button>
  );
}

/* =========================================================
   Checkout
========================================================= */

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const cartLoading = useSelector(selectCartLoading);
  const checkoutLoading = useSelector((state) => state.orders.checkoutLoading);
  const BuyNowitem = useSelector((state) => state.cart.BuyNowitem);

  const [transferImage, setTransferImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [imageError, setImageError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      phone: "",
      city: "",
      address: "",
      paymentMethod: "cash",
      senderName: "",
      senderPhone: "",
      transactionId: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const isWallet = paymentMethod === "wallet";

  /* ---------------- Determine checkout items ---------------- */

  const checkoutItems = useMemo(() => {
    if (BuyNowitem) return [BuyNowitem];
    return cartItems || [];
  }, [BuyNowitem, cartItems]);

  const total = useMemo(
    () =>
      checkoutItems.reduce((sum, item) => {
        const price = getItemPrice(item);
        const quantity = Number(item?.quantity || 1);
        return sum + price * quantity;
      }, 0),
    [checkoutItems]
  );

  useEffect(() => {
    if (!BuyNowitem) dispatch(getCart());
  }, [dispatch, BuyNowitem]);

  // #clean up the object URL so we don't leak memory on unmount / re-select
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ---------------- Payment method switch ---------------- */

  const choosePayment = (method) => {
    setValue("paymentMethod", method, { shouldValidate: true });
    if (method === "cash") {
      setImageError("");
    }
  };

  /* ---------------- Image upload ---------------- */

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);

    setTransferImage(file);
    setPreview(URL.createObjectURL(file));
    setImageError("");
  };
  // 
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);
  /* ---------------- Submit ---------------- */

  const onSubmit = async (data) => {
    if (!checkoutItems.length || checkoutLoading) return;

    setSubmitError("");

    if (data.paymentMethod === "wallet" && !transferImage) {
      setImageError("Please upload the transfer receipt.");
      return;
    }

    const fd = new FormData();
    fd.append("fullName", data.fullName);
    fd.append("phone", data.phone);
    fd.append("city", data.city);
    fd.append("address", data.address);
    fd.append("paymentMethod", data.paymentMethod);
    fd.append("totalPrice", String(total));
    fd.append("isBuyNow", BuyNowitem ? "true" : "false");
    fd.append(
      "items",
      JSON.stringify(
        checkoutItems.map((item) => ({
          product: item.product?._id || item.product,
          name: item.product?.name || item.name,
          color: item.color,
          size: item.size,
          price: getItemPrice(item),
          quantity: Number(item.quantity || 1),
          image: item.product?.image || item.image,
        }))
      )
    );

    if (data.paymentMethod === "wallet") {
      fd.append("senderName", data.senderName);
      fd.append("senderPhone", data.senderPhone);
      fd.append("transactionId", data.transactionId);
      fd.append("image", transferImage);
    }

    const res = await dispatch(checkoutOrder(fd));

    if (checkoutOrder.fulfilled.match(res)) {
      setSubmitted(true);

      // Buy Now should NOT clear the cart
      if (!BuyNowitem) dispatch(clearCart());

      setTimeout(() => navigate("/orders"), 600);
    } else {
      setSubmitError(
        res.payload?.message ||
        res.error?.message ||
        "Couldn't place your order. Please try again."
      );
    }
  };

  /* ---------------- Success ---------------- */

  if (submitted) {
    return (
      <div dir="ltr" className="flex min-h-screen items-center justify-center bg-bg px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card flex flex-col items-center gap-4 px-10 py-14 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
            className="text-6xl text-primary"
          >
            <FiCheckCircle />
          </motion.div>
          <h2 className="text-3xl text-text">Order Placed Successfully!</h2>
          <p className="text-muted">Redirecting to your orders page...</p>
        </motion.div>
      </div>
    );
  }

  /* ---------------- Empty cart ---------------- */

  if (!cartLoading && !checkoutItems.length) {
    return (
      <div dir="ltr" className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="card flex flex-col items-center gap-4 px-10 py-14 text-center">
          <FiShoppingBag className="text-5xl text-muted" />
          <h2 className="text-2xl text-text">Your cart is empty</h2>
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="btn-primary rounded-xl px-6 py-3"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div dir="ltr" className="min-h-screen bg-bg px-4 py-10 md:px-10 lg:px-20">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <span className="text-sm uppercase tracking-[0.2em] text-primary">Checkout</span>
        <h1 className="text-4xl text-text md:text-5xl">Complete Your Order</h1>
        <p className="mt-2 text-muted">
          Review your order and enter shipping and payment details
        </p>
      </motion.div>

      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <span className="flex items-center gap-2">
              <FiAlertCircle /> {submitError}
            </span>
            <button type="button" onClick={() => setSubmitError("")} aria-label="Dismiss">
              <FiX />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* ===================================================
            FORM
        =================================================== */}

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-6"
        >
          {/* Shipping Address */}
          <div className="card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <FiMapPin className="text-primary" />
              <h3 className="text-2xl text-text">Shipping Address</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                icon={<FiUser />}
                placeholder="Full Name"
                error={errors.fullName}
                {...register("fullName", { required: "Full name is required" })}
              />
              <Field
                icon={<FiPhone />}
                type="tel"
                placeholder="Phone Number"
                error={errors.phone}
                {...register("phone", {
                  required: "Phone number is required",
                  minLength: { value: 8, message: "Enter a valid phone number" },
                })}
              />
              <Field
                icon={<FiHome />}
                placeholder="City / Region"
                error={errors.city}
                {...register("city", { required: "City is required" })}
              />
              <Field
                icon={<FiMapPin />}
                placeholder="Detailed Address"
                error={errors.address}
                {...register("address", { required: "Address is required" })}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6 md:p-8">
            <div className="mb-6 flex items-center gap-2">
              <FiCreditCard className="text-primary" />
              <h3 className="text-2xl text-text">Payment Method</h3>
            </div>

            {/* keeps paymentMethod in the form's data without a visible input */}
            <input type="hidden" {...register("paymentMethod")} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PaymentOption
                active={paymentMethod === "cash"}
                icon={<FiDollarSign />}
                title="Cash on Delivery"
                onClick={() => choosePayment("cash")}
              />
              <PaymentOption
                active={isWallet}
                icon={<FiCreditCard />}
                title="E-Wallet"
                onClick={() => choosePayment("wallet")}
              />
            </div>

            <AnimatePresence initial={false}>
              {isWallet && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 md:grid-cols-2">
                    <Field
                      icon={<FiUser />}
                      placeholder="Sender Name"
                      error={errors.senderName}
                      {...register("senderName", {
                        required: isWallet ? "Sender name is required" : false,
                      })}
                    />
                    <Field
                      icon={<FiPhone />}
                      type="tel"
                      placeholder="Sender Phone Number"
                      error={errors.senderPhone}
                      {...register("senderPhone", {
                        required: isWallet ? "Sender phone is required" : false,
                      })}
                    />
                    <Field
                      icon={<FiCreditCard />}
                      placeholder="Transaction ID"
                      className="md:col-span-2"
                      error={errors.transactionId}
                      {...register("transactionId", {
                        required: isWallet ? "Transaction ID is required" : false,
                      })}
                    />

                    <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card px-4 py-6 text-center transition hover:border-primary md:col-span-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImage}
                      />

                      {preview ? (
                        <img
                          src={preview}
                          alt="Transfer Receipt"
                          className="max-h-64 rounded-lg object-contain"
                        />
                      ) : (
                        <>
                          <FiUpload className="text-2xl text-primary" />
                          <span className="text-sm text-muted">
                            Upload transfer receipt image
                          </span>
                        </>
                      )}
                    </label>
                    {imageError && (
                      <p className="-mt-2 text-xs text-red-500 md:col-span-2">{imageError}</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            type="submit"
            disabled={checkoutLoading || !checkoutItems.length}
            whileTap={{ scale: 0.97 }}
            className="btn-primary flex items-center justify-center gap-2 rounded-xl py-4 text-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutLoading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              >
                <FiLoader />
              </motion.span>
            ) : (
              <FiArrowRight />
            )}
            {checkoutLoading ? "Processing Order..." : "Place Order"}
          </motion.button>
        </motion.form>

        {/* ===================================================
            ORDER SUMMARY
        =================================================== */}

        <motion.aside
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card sticky top-6 h-fit p-6 md:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <FiShoppingBag className="text-primary" />
            <h3 className="text-2xl text-text">Order Summary</h3>
          </div>

          <div className="flex flex-col gap-4">
            {checkoutItems.map((item, i) => (
              <motion.div
                key={`${item.product?._id || item.product}-${item.color}-${item.size}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <img
                  src={item.product?.image || item.image}
                  alt={item.product?.name || item.name}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-text">
                    {item.product?.name || item.name}
                  </p>
                  <p className="text-xs text-muted">
                    {item.color && `${item.color} · `}
                    {item.size && `${item.size} · `}× {item.quantity || 1}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm text-primary">
                  EGP {(getItemPrice(item) * Number(item.quantity || 1)).toLocaleString()}
                </span>
              </motion.div>
            ))}

            <div className="mt-2 flex items-center justify-between border-t border-border pt-4 text-lg text-text">
              <span>Total</span>
              <span className="text-xl font-semibold text-primary">
                EGP {total.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}