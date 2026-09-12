import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiStar,
  FiUser,
  FiMinus,
  FiPlus,
  FiClock,
} from "react-icons/fi";

import {
  getProductDetails,
  addReview,
} from "../features/products/productSlice";

import {
  addToCart,
  BuyNowitem,
  selectCartActionLoading,
} from "../features/cart/cartSlice";

import Loading from "../components/common/Loading";

/* =========================================================
   ANIMATION
   (single orchestrated entrance for the hero, nothing else
   animates on scroll — keeps the page calm)
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 14,
  },

  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: index * 0.08,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

/* =========================================================
   HELPERS  — unchanged data logic
========================================================= */

const getSizePrice = (size) => {
  if (!size) return 0;

  const price = Number(size.price ?? 0);
  const offerPrice = Number(size.offerPrice ?? 0);

  if (offerPrice > 0 && offerPrice < price) {
    return offerPrice;
  }

  return price;
};

const getMinPrice = (product) => {
  const sizes = [];

  product?.variants?.forEach((variant) => {
    variant?.sizes?.forEach((size) => {
      sizes.push(size);
    });
  });

  if (!sizes.length) {
    return {
      price: null,
      oldPrice: null,
    };
  }

  let cheapest = sizes[0];

  sizes.forEach((size) => {
    const currentPrice = getSizePrice(size);
    const cheapestPrice = getSizePrice(cheapest);

    if (currentPrice < cheapestPrice) {
      cheapest = size;
    }
  });

  const price = Number(cheapest?.price ?? 0);
  const offerPrice = Number(cheapest?.offerPrice ?? 0);

  if (offerPrice > 0 && offerPrice < price) {
    return {
      price: offerPrice,
      oldPrice: price,
    };
  }

  return {
    price,
    oldPrice: null,
  };
};

/* =========================================================
   STAR RATING
========================================================= */

function StarRating({ value = 0, size = "text-base" }) {
  const roundedValue = Math.round(Number(value) || 0);

  return (
    <div
      className={`flex items-center gap-0.5 text-primary ${size}`}
      aria-label={`Rating ${roundedValue} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={star <= roundedValue ? "fill-current" : ""}
        />
      ))}
    </div>
  );
}

/* =========================================================
   STAR PICKER
========================================================= */

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hover || value);

        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="text-2xl text-primary transition-transform hover:scale-110"
          >
            <FiStar className={active ? "fill-current" : ""} />
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   DISH CARD  (was MiniProductCard — internal component only,
   safe to rename since nothing outside this file imports it)
========================================================= */

function DishCard({ item, index }) {
  const navigate = useNavigate();

  const { price, oldPrice } = getMinPrice(item);

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      onClick={() => navigate(`/products/${item._id}`)}
      className="card group flex w-48 flex-shrink-0 cursor-pointer flex-col overflow-hidden sm:w-56"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bg">
        {item?.image ? (
          <img
            src={item.image}
            alt={item.name || "Dish"}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No Photo
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 border-t border-border p-4">
        <span className="truncate font-serif text-base text-text">
          {item.name}
        </span>

        <div className="flex items-center gap-2">
          {price !== null ? (
            <span className="text-sm font-semibold text-text">
              EGP {Number(price).toLocaleString()}
            </span>
          ) : (
            <span className="text-sm text-muted">Price unavailable</span>
          )}

          {oldPrice !== null && (
            <span className="text-xs text-muted line-through">
              EGP {Number(oldPrice).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   MENU RAIL  (was ProductRail)
========================================================= */

function MenuRail({ title, subtitle, items }) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-16">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-border pb-4">
        <h2 className="font-serif text-2xl text-text">{title}</h2>

        {subtitle && (
          <p className="text-sm text-muted">{subtitle}</p>
        )}
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scrollbar-thin">
        {items.map((item, index) => (
          <DishCard key={item._id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   REVIEWS  (dispatch, state shape, and field names untouched)
========================================================= */

function ReviewsSection({ product, productId }) {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth?.user);

  const reviewLoading = useSelector(
    (state) => state.products?.reviewLoading
  );

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanComment = comment.trim();

    if (!rating || !cleanComment || reviewLoading) {
      return;
    }

    const result = await dispatch(
      addReview({
        productId,
        rating,
        comment: cleanComment,
      })
    );

    if (addReview.fulfilled.match(result)) {
      setRating(0);
      setComment("");
    }
  };

  const averageRating = Number(product?.rating || 0);

  const reviewsCount = Number(
    product?.numReviews || reviews.length || 0
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="card p-8 md:p-10">
        {/* Header */}

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
          <div>
            <h2 className="font-serif text-2xl text-text">
              What Guests Are Saying
            </h2>

            <div className="mt-3 flex items-center gap-2">
              <StarRating value={averageRating} />

              <span className="text-sm text-muted">
                {averageRating.toFixed(1)} · {reviewsCount}{" "}
                {reviewsCount === 1 ? "review" : "reviews"}
              </span>
            </div>
          </div>
        </div>

        {/* Add Review */}

        <div className="mb-8 rounded-2xl border border-border p-6">
          {user ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-text">
                  Rate this dish
                </label>

                <StarPicker value={rating} onChange={setRating} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-text">
                  Your review
                </label>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="How was the taste, portion, and presentation?"
                  className="w-full resize-none rounded-xl border border-border bg-transparent px-4 py-3 text-sm text-text placeholder:text-muted transition-colors focus:border-primary focus:outline-none"
                />

                <div className="mt-1 text-right text-xs text-muted">
                  {comment.length}/1000
                </div>
              </div>

              <button
                type="submit"
                disabled={reviewLoading || !rating || !comment.trim()}
                className="btn-primary self-start rounded-xl px-6 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reviewLoading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-start gap-3">
              <p className="text-sm text-muted">
                Sign in to share your experience with this dish.
              </p>

              <Link
                to="/login"
                className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold"
              >
                Log In to Review
              </Link>
            </div>
          )}
        </div>

        {/* Reviews List */}

        {!reviews.length ? (
          <p className="text-sm text-muted">
            No reviews yet — be the first to tell us how it was.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {reviews
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
              )
              .map((review) => (
                <div key={review._id} className="py-5 first:pt-0 last:pb-0">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-border text-muted">
                      <FiUser />
                    </div>

                    <div>
                      <span className="block text-sm font-semibold text-text">
                        {review.name || review.user?.name || "Guest"}
                      </span>

                      <span className="text-xs text-muted">
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className="ml-auto">
                      <StarRating value={review.rating} size="text-sm" />
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-muted">
                    {review.comment}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   DISH DETAILS  (export name kept as ProductDetails so no
   route or import elsewhere in the app needs to change)
========================================================= */

export default function ProductDetails() {
  const { id } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { productDetails, detailsLoading } = useSelector(
    (state) => state.products
  );

  const currentProduct = productDetails?.product || null;

  const relatedProducts = productDetails?.relatedProducts || [];

  const differentProducts = productDetails?.differentProducts || [];

  const cartActionLoading = useSelector(selectCartActionLoading);

  const [color, setColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  /* GET PRODUCT */

  useEffect(() => {
    if (id) {
      dispatch(getProductDetails(id));
    }
  }, [dispatch, id]);

  /* SCROLL TOP */

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  /* INITIAL VARIANT */

  useEffect(() => {
    if (!currentProduct?.variants?.length) {
      setColor(null);
      setSelectedSize(null);
      setQuantity(1);
      return;
    }

    const firstAvailableVariant =
      currentProduct.variants.find((variant) =>
        variant?.sizes?.some((size) => Number(size?.stock || 0) > 0)
      ) || currentProduct.variants[0];

    const firstAvailableSize =
      firstAvailableVariant?.sizes?.find(
        (size) => Number(size?.stock || 0) > 0
      ) || null;

    setColor(firstAvailableVariant);
    setSelectedSize(firstAvailableSize);
    setQuantity(1);
  }, [currentProduct]);

  /* KEEP QUANTITY INSIDE STOCK */

  useEffect(() => {
    const stock = Number(selectedSize?.stock || 0);

    if (stock <= 0) {
      setQuantity(1);
      return;
    }

    setQuantity((prev) => Math.min(Math.max(Number(prev) || 1, 1), stock));
  }, [selectedSize]);

  if (detailsLoading) {
    return <Loading />;
  }

  if (!currentProduct) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg text-text">
        Dish not found
      </div>
    );
  }

  /* CURRENT VARIANT DATA */

  const stock = Number(selectedSize?.stock || 0);

  const isOutOfStock = !selectedSize || stock <= 0;

  const price = Number(selectedSize?.price ?? 0);

  const offerPrice = Number(selectedSize?.offerPrice ?? 0);

  const hasOffer = offerPrice > 0 && offerPrice < price;

  const finalPrice = hasOffer ? offerPrice : price;

  /* QUANTITY */

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    if (isOutOfStock) return;

    setQuantity((prev) => Math.min(stock, prev + 1));
  };

  /* CHANGE COLOR (drives the "Preparation" picker below) */

  const changeColor = (variant) => {
    if (!variant) return;

    setColor(variant);

    const firstAvailableSize =
      variant?.sizes?.find((size) => Number(size?.stock || 0) > 0) || null;

    setSelectedSize(firstAvailableSize);
    setQuantity(1);
  };

  /* CHANGE SIZE (drives the "Portion" picker below) */

  const changeSize = (size) => {
    if (!size) return;

    if (Number(size.stock || 0) <= 0) {
      return;
    }

    setSelectedSize(size);
    setQuantity(1);
  };

  /* VALIDATION */

  const isValidSelection = Boolean(
    currentProduct?._id &&
    color?.color?.name &&
    selectedSize?.size &&
    !isOutOfStock
  );

  /* ADD TO CART */

  const handleAddToCart = () => {
    if (!isValidSelection) {
      return;
    }

    dispatch(
      addToCart({
        productId: currentProduct._id,
        color: color.color.name,
        size: selectedSize.size,
        quantity,
      })
    );
  };

  /* BUY NOW */

  const handleBuyNow = () => {
    if (!isValidSelection) {
      return;
    }

    dispatch(
      BuyNowitem({
        product: {
          _id: currentProduct._id,
          name: currentProduct.name,
          image: currentProduct.image,
        },

        productId: currentProduct._id,

        name: currentProduct.name,

        image: currentProduct.image,

        /* IMPORTANT: send primitive values, NOT objects. */
        color: color.color.name,

        size: selectedSize.size,

        price: finalPrice,

        offerPrice: hasOffer ? offerPrice : null,

        quantity,
      })
    );

    navigate("/checkout");
  };

  /* UI */

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* BREADCRUMB */}

      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="text-sm text-muted">
          Menu / {currentProduct.category?.name || "Dishes"} /{" "}
          {currentProduct.name}
        </div>
      </div>

      {/* DISH HERO */}

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_1fr_0.85fr]">
        {/* IMAGE */}

        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeUp}
          className="card overflow-hidden p-3"
        >
          <div className="aspect-[4/3] overflow-hidden rounded-xl bg-bg">
            {currentProduct.image ? (
              <img
                src={currentProduct.image}
                alt={currentProduct.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No Photo
              </div>
            )}
          </div>
        </motion.div>

        {/* DETAILS */}

        <motion.div
          initial="hidden"
          animate="visible"
          custom={1}
          variants={fadeUp}
          className="py-2"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1 text-xs text-primary">
            {currentProduct.category?.name || "Chef's Special"}
          </span>

          <h1 className="mt-5 font-serif text-4xl leading-tight text-text sm:text-5xl">
            {currentProduct.name}
          </h1>

          {/* Rating */}

          <div className="mt-4 flex items-center gap-3">
            <StarRating value={currentProduct.rating || 0} />

            <span className="text-sm text-muted">
              {currentProduct.numReviews
                ? `${Number(currentProduct.rating || 0).toFixed(1)} (${currentProduct.numReviews
                } reviews)`
                : "No ratings yet"}
            </span>
          </div>

          {/* Description */}

          <p className="mt-6 max-w-md leading-8 text-muted">
            {currentProduct.description}
          </p>

          {/* PREPARATION (color variants) */}

          {currentProduct.variants?.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-sm font-semibold text-text">
                Preparation
              </h3>

              <div className="flex flex-wrap gap-2">
                {currentProduct.variants.map((variant, index) => {
                  const colorName = variant?.color?.name;

                  if (!colorName) {
                    return null;
                  }

                  const isSelected = color?.color?.name === colorName;

                  return (
                    <button
                      key={`${colorName}-${index}`}
                      type="button"
                      onClick={() => changeColor(variant)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border text-text hover:border-primary"
                        }`}
                    >
                      {colorName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PORTION (size variants) */}

          {color?.sizes?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-text">
                Portion
              </h3>

              <div className="flex flex-wrap gap-2">
                {color.sizes.map((size, index) => {
                  const sizeName = size?.size;

                  const isSelected = selectedSize?.size === sizeName;

                  const outOfStock = Number(size?.stock || 0) <= 0;

                  return (
                    <button
                      key={`${sizeName}-${index}`}
                      type="button"
                      disabled={outOfStock}
                      onClick={() => changeSize(size)}
                      className={`rounded-xl border px-5 py-2.5 text-sm transition-all ${isSelected
                          ? "border-primary bg-primary text-white"
                          : "border-border text-text hover:border-primary"
                        } ${outOfStock
                          ? "cursor-not-allowed opacity-40 line-through"
                          : ""
                        }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* ORDER CARD */}

        <motion.div
          initial="hidden"
          animate="visible"
          custom={2}
          variants={fadeUp}
          className="card h-fit p-6"
        >
          <h3 className="mb-5 font-serif text-lg text-text">Your Order</h3>

          {/* Selected Variant */}

          <div className="rounded-lg border border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Preparation</span>

              <span className="font-semibold">
                {color?.color?.name || "—"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Portion</span>

              <span className="font-semibold">
                {selectedSize?.size || "—"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Price</span>

              <div className="flex items-center gap-2">
                {hasOffer && (
                  <span className="text-sm text-muted line-through">
                    <Currency amount={price.toLocaleString()} />

                  </span>
                )}

                <span className="font-semibold text-primary">
                  {finalPrice > 0
                    ? ` ${<Currency amount={finalPrice.toLocaleString()} />}`
                    : "—"}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-muted">Availability</span>

              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${!isOutOfStock ? "text-green-600" : "text-red-500"
                  }`}
              >
                <FiClock className="text-sm" />
                {!isOutOfStock ? `${stock} left today` : "Sold out today"}
              </span>
            </div>
          </div>

          {/* QUANTITY */}

          <div className="mt-6">
            <label className="mb-2 block text-sm font-semibold">
              Quantity
            </label>

            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={decreaseQuantity}
                disabled={isOutOfStock || quantity <= 1}
                className="text-lg transition hover:text-primary disabled:opacity-30"
              >
                <FiMinus />
              </button>

              <span className="font-semibold">{quantity}</span>

              <button
                type="button"
                aria-label="Increase quantity"
                onClick={increaseQuantity}
                disabled={isOutOfStock || quantity >= stock}
                className="text-lg transition hover:text-primary disabled:opacity-30"
              >
                <FiPlus />
              </button>
            </div>
          </div>

          {/* ADD TO CART */}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isValidSelection || cartActionLoading}
            className="btn-primary mt-6 w-full rounded-xl px-5 py-4 font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cartActionLoading
              ? "Adding..."
              : isOutOfStock
                ? "Sold Out Today"
                : "Add to Order"}
          </button>

          {/* BUY NOW */}

          <button
            type="button"
            disabled={!isValidSelection}
            onClick={handleBuyNow}
            className="mt-3 w-full rounded-xl border border-primary px-5 py-4 font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Order Now
          </button>

          {/* Selection warning */}

          {!selectedSize && (
            <p className="mt-3 text-center text-xs text-muted">
              Choose a preparation and portion to continue.
            </p>
          )}
        </motion.div>
      </section>

      {/* ABOUT THE DISH */}

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="card p-8 md:p-10">
          <h2 className="font-serif text-3xl text-text">About This Dish</h2>

          <p className="mt-4 max-w-2xl leading-8 text-muted">
            {currentProduct.description}
          </p>
        </div>
      </section>

      {/* RELATED */}

      <MenuRail
        title="Pairs Well With"
        subtitle="From the same category"
        items={relatedProducts}
      />

      {/* DIFFERENT */}

      <MenuRail
        title="More From Our Menu"
        subtitle="Something different to try"
        items={differentProducts}
      />

      {/* REVIEWS */}

      <ReviewsSection product={currentProduct} productId={id} />
    </div>
  );
}