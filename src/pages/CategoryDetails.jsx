import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiArrowLeft,
  FiStar,
  FiFilter,
  FiChevronDown,
} from "react-icons/fi";
import { MdOutlineRestaurantMenu } from "react-icons/md";

import { getCategories } from "../features/category/categorySlice";
import { getProducts } from "../features/products/productSlice";

// ==========================================
// CURRENCY COMPONENT
// ==========================================
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

// ==========================================
// HELPERS
// ==========================================
function getPriceInfo(item) {
  const firstVariant = item?.variants?.[0];
  const firstSize = firstVariant?.sizes?.[0];

  if (firstSize) {
    const hasOffer =
      firstSize.offerPrice !== undefined &&
      firstSize.offerPrice !== null &&
      firstSize.offerPrice !== "" &&
      Number(firstSize.offerPrice) > 0 &&
      Number(firstSize.offerPrice) < Number(firstSize.price);

    return {
      price: hasOffer ? firstSize.offerPrice : firstSize.price,
      oldPrice: hasOffer ? firstSize.price : null,
      portion: firstSize.size,
    };
  }

  return {
    price: item?.price ?? null,
    oldPrice: item?.oldPrice ?? null,
    portion: null,
  };
}

function getCategoryId(product) {
  return product?.category?._id || product?.category || null;
}

// ==========================================
// DISH / MENU ITEM CARD
// ==========================================
function ProductCard({ item, index }) {
  const navigate = useNavigate();
  const { price, oldPrice, portion } = getPriceInfo(item);
  const options = item?.variants?.slice(0, 5) ?? [];

  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onClick={() => navigate(`/products/${item._id}`)}
      className="card group flex flex-col overflow-hidden cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-2 p-4 border-t border-[var(--border)]">
        <span className="logo text-base font-semibold text-[var(--text)] truncate">
          {item.name}
        </span>

        {options.length > 0 && (
          <div className="flex items-center gap-1.5 mt-0.5">
            {options.map((variant, i) => (
              <span
                key={variant.variant?.hex ?? i}
                title={variant.variant?.name}
                className="w-3.5 h-3.5 rounded-full border border-[var(--border)] shrink-0"
                style={{ backgroundColor: variant.variant?.hex || "#ccc" }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <Currency
              amount={price}
              className="text-sm font-bold text-[var(--text)]"
            />
            {oldPrice && (
              <Currency
                amount={oldPrice}
                className="text-xs text-[var(--muted)] line-through"
              />
            )}
          </div>
          <div className="flex items-center gap-1 text-[var(--muted)] text-xs">
            <FiStar className="text-[var(--primary)] fill-current" />
            {item.rating ?? "4.9"}
          </div>
        </div>

        {portion && (
          <span className="text-[11px] text-[var(--muted)]">
            Serving size: {portion}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function CategoryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.categories
  );
  const { products, loading: productsLoading } = useSelector(
    (state) => state.products
  );

  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProducts());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const category = useMemo(
    () => categories?.find((cat) => cat._id === id),
    [categories, id]
  );

  const filteredProducts = useMemo(() => {
    let list = products?.filter((item) => getCategoryId(item) === id) ?? [];

    if (sortBy === "priceLow") {
      list = [...list].sort(
        (a, b) => Number(getPriceInfo(a).price) - Number(getPriceInfo(b).price)
      );
    } else if (sortBy === "priceHigh") {
      list = [...list].sort(
        (a, b) => Number(getPriceInfo(b).price) - Number(getPriceInfo(a).price)
      );
    }

    return list;
  }, [products, id, sortBy]);

  const sortLabels = {
    default: "Recommended",
    priceLow: "Price: Low to High",
    priceHigh: "Price: High to Low",
  };

  const loading = categoriesLoading || productsLoading;

  return (
    <div className="w-full">
      {/* ===== MENU CATEGORY HERO ===== */}
      <section
        className="
        relative min-h-[260px] sm:min-h-[340px]
        max-w-[1400px] mx-auto my-4 sm:my-6 rounded-3xl overflow-hidden
        bg-cover bg-center bg-no-repeat
        flex items-end
        shadow-[var(--shadow)]
        "
        style={{
          backgroundImage: category?.image ? `url(${category.image})` : undefined,
          backgroundColor: !category?.image ? "var(--card)" : undefined,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        <div className="relative z-10 w-full px-6 sm:px-10 py-8 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate("/collections")}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/80 hover:text-white transition-colors w-fit"
            >
              <FiArrowLeft className="text-sm" />
              Back to Menu Categories
            </button>

            <h1 className="logo text-3xl sm:text-5xl font-bold text-white">
              {category?.name || "Menu Category"}
            </h1>

            <span className="text-xs sm:text-sm text-white/70">
              {filteredProducts.length} dish
              {filteredProducts.length !== 1 && "es"} available
            </span>
          </div>
        </div>
      </section>

      {/* ===== TOOLBAR ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <FiFilter className="text-[var(--primary)]" />
            <span>Exploring menu items</span>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSortOpen((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] transition-colors"
            >
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
                className="absolute right-0 mt-2 w-48 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden z-20"
              >
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--border)] transition-colors ${
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

      {/* ===== DISHES GRID ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl bg-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <MdOutlineRestaurantMenu className="text-5xl text-[var(--muted)] mb-4" />
            <span className="logo text-xl font-semibold text-[var(--text)]">
              No dishes found in this menu section
            </span>
            <button
              onClick={() => navigate("/products")}
              className="flex items-center gap-2 mt-6 text-sm font-semibold text-[var(--primary)] hover:gap-3 transition-all"
            >
              Browse full menu
              <FiArrowUpRight />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((item, index) => (
              <ProductCard key={item._id} item={item} index={index} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}