import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiTag,
  FiZap,
  FiStar,
  FiArrowUpRight,
  FiPackage,
  FiChevronDown,
  FiFilter,
} from "react-icons/fi";

import { getCategories } from "../features/category/categorySlice";
import { getProducts } from "../features/products/productSlice";

// ==========================================
// MOTION CONFIG
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const iconFloat = {
  hidden: { opacity: 0, scale: 0.6, rotate: -15 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 260, damping: 18 },
  },
};

// ==========================================
// HELPERS
// ==========================================
function getBestOffer(item) {
  const variants = item?.variants ?? [];

  for (const variant of variants) {
    for (const size of variant?.sizes ?? []) {
      const hasOffer =
        size.offerPrice !== undefined &&
        size.offerPrice !== null &&
        size.offerPrice != "" &&
        Number(size.offerPrice) > 0 &&
        Number(size.offerPrice) < Number(size.price);

      if (hasOffer) {
        const discount = Math.round(
          ((Number(size.price) - Number(size.offerPrice)) /
            Number(size.price)) *
            100
        );

        return {
          price: size.offerPrice,
          oldPrice: size.price,
          discount,
          size: size.size,
        };
      }
    }
  }

  return null;
}

function getCategoryId(product) {
  return product?.category?._id || product?.category || null;
}

// ==========================================
// PRODUCT CARD
// ==========================================
function SaleCard({ item, index }) {
  const navigate = useNavigate();
  const offer = getBestOffer(item);
  const swatches = item?.variants?.slice(0, 5) ?? [];

  if (!offer) return null;

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${item._id}`)}
      className="card group flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] sm:aspect-[4/5] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <span className="absolute top-3 left-3 flex items-center gap-1 font-mono text-[10px] sm:text-xs font-bold tracking-wide text-white bg-[var(--primary)] px-2.5 py-1 rounded-full">
          <FiZap className="text-[10px]" />
          SAVE {offer.discount}%
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3.5 sm:p-4 border-t border-[var(--border)]">
        <span className="logo text-sm sm:text-base font-semibold text-[var(--text)] truncate">
          {item.name}
        </span>

        {swatches.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {swatches.map((variant, i) => (
              <span
                key={variant.color?.hex ?? i}
                title={variant.color?.name}
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-[var(--border)] shrink-0"
                style={{ backgroundColor: variant.color?.hex || "#ccc" }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-bold text-[var(--primary)]">
              EGP {offer.price}
            </span>
            <span className="text-[10px] sm:text-xs text-[var(--muted)] line-through">
              EGP {offer.oldPrice}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[var(--muted)] text-[10px] sm:text-xs">
            <FiStar className="text-[var(--primary)] fill-current" />
            {item.rating ?? "4.8"}
          </div>
        </div>

        {offer.size && (
          <span className="text-[10px] sm:text-[11px] text-[var(--muted)]">
            Portion size: {offer.size}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function Sale() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.categories);
  const { products, loading } = useSelector((state) => state.products);

  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("discountHigh");

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProducts());
  }, [dispatch]);

  const saleProducts = useMemo(() => {
    return (
      products
        ?.map((item) => ({ item, offer: getBestOffer(item) }))
        .filter(({ offer }) => offer !== null) ?? []
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = saleProducts;

    if (activeCategory !== "all") {
      list = list.filter(({ item }) => getCategoryId(item) === activeCategory);
    }

    if (sortBy === "discountHigh") {
      list = [...list].sort((a, b) => b.offer.discount - a.offer.discount);
    } else if (sortBy === "priceLow") {
      list = [...list].sort(
        (a, b) => Number(a.offer.price) - Number(b.offer.price)
      );
    } else if (sortBy === "priceHigh") {
      list = [...list].sort(
        (a, b) => Number(b.offer.price) - Number(a.offer.price)
      );
    }

    return list.map(({ item }) => item);
  }, [saleProducts, activeCategory, sortBy]);

  const sortLabels = {
    discountHigh: "Best Deals",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
  };

  const availableCategories = useMemo(() => {
    const ids = new Set(saleProducts.map(({ item }) => getCategoryId(item)));
    return categories?.filter((cat) => ids.has(cat._id)) ?? [];
  }, [categories, saleProducts]);

  return (
    <div className="w-full">
      {/* ===== HERO HEADER ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-6 sm:pb-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={iconFloat}
          className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--primary)]/10 border border-[var(--primary)]/20 mb-4 sm:mb-6"
        >
          <motion.div
            animate={{ rotate: [0, -12, 12, -8, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              repeatDelay: 2.5,
              ease: "easeInOut",
            }}
          >
            <FiTag className="text-xl sm:text-2xl text-[var(--primary)]" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="logo text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight"
        >
          Special Chef's{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Offers
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs sm:text-base text-[var(--muted)] font-light max-w-lg mt-3 sm:mt-4 leading-relaxed"
        >
          Special promotional prices on our signature dishes and combos. Available for a limited time.
        </motion.p>
      </section>

      {/* ===== TOOLBAR ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border)] pb-4">
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors border ${
                activeCategory === "all"
                  ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                  : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
              }`}
            >
              All Items
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`shrink-0 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-semibold tracking-wide transition-colors border ${
                  activeCategory === cat._id
                    ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                    : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setSortOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-xs sm:text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] transition-colors"
            >
              <FiFilter className="text-xs text-[var(--primary)]" />
              {sortLabels[sortBy]}
              <FiChevronDown
                className={`text-xs transition-transform ${
                  sortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-44 sm:w-48 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden z-20"
              >
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 sm:py-2.5 text-xs sm:text-sm hover:bg-[var(--border)] transition-colors ${
                      sortBy === key
                        ? "text-[var(--primary)] font-semibold"
                        : "text-[var(--text)]"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* ===== PRODUCTS GRID ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] sm:aspect-[4/5] rounded-2xl bg-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4"
          >
            <FiPackage className="text-3xl sm:text-4xl text-[var(--muted)] mb-3 sm:mb-4" />
            <span className="logo text-lg sm:text-xl font-semibold text-[var(--text)]">
              No active offers at the moment
            </span>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 mt-4 sm:mt-6 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:gap-3 transition-all"
            >
              Browse full menu
              <FiArrowUpRight />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((item, index) => (
              <SaleCard key={item._id} item={item} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}