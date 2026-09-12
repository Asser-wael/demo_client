import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiChevronDown,
  FiStar,
  FiShoppingBag,
  FiInbox,
} from "react-icons/fi";

import { getProducts } from "../features/products/productSlice";
import { getCategories } from "../features/category/categorySlice";
import Currency from "../components/company/Currency";

// ==========================================
// MOTION CONFIG
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: Math.min(index, 8) * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 320, damping: 34 } },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

// ==========================================
// HELPERS
// ==========================================
function getEffectivePrice(size) {
  const hasOffer =
    size.offerPrice !== undefined &&
    size.offerPrice !== null &&
    Number(size.offerPrice) > 0 &&
    Number(size.offerPrice) < Number(size.price);
  return hasOffer ? Number(size.offerPrice) : Number(size.price);
}

function getPriceInfo(item) {
  const allSizes = (item?.variants ?? []).flatMap((v) => v.sizes ?? []);
  if (allSizes.length === 0) return { price: "—", oldPrice: null };

  const cheapest = allSizes.reduce((min, s) =>
    getEffectivePrice(s) < getEffectivePrice(min) ? s : min
  );

  const hasOffer =
    cheapest.offerPrice !== undefined &&
    cheapest.offerPrice !== null &&
    Number(cheapest.offerPrice) > 0 &&
    Number(cheapest.offerPrice) < Number(cheapest.price);

  return {
    price: hasOffer ? cheapest.offerPrice : cheapest.price,
    oldPrice: hasOffer ? cheapest.price : null,
  };
}

function getMinPrice(item) {
  const allSizes = (item?.variants ?? []).flatMap((v) => v.sizes ?? []);
  if (allSizes.length === 0) return 0;
  return Math.min(...allSizes.map(getEffectivePrice));
}

function getInStock(item) {
  return (item?.variants ?? []).some((v) =>
    (v.sizes ?? []).some((s) => Number(s.stock) > 0)
  );
}

// ==========================================
// PRODUCT CARD
// ==========================================
function ProductCard({ item, index }) {
  const navigate = useNavigate();
  const { price, oldPrice } = getPriceInfo(item);
  const inStock = getInStock(item);

  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      onClick={() => navigate(`/products/${item._id}`)}
      className="
        card group relative cursor-pointer
        overflow-hidden
        p-0
      "
    >
      {/* IMAGE */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--cream)]">
        <img
          src={item.image}
          alt={item.name}
          className="
            food-image
            absolute inset-0
            h-full w-full
            object-cover
          "
        />

        {/* IMAGE OVERLAY */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t
            from-[var(--primary)]/80
            via-[var(--primary)]/10
            to-transparent
            opacity-70
            transition-opacity duration-500
            group-hover:opacity-90
          "
        />

        {/* SOLD OUT */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur-xs">
            <span
              className="
                border border-[var(--border)]
                bg-[var(--card)]
                px-5 py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-[var(--text)]
                rounded-full
              "
            >
              Sold Out
            </span>
          </div>
        )}

        {/* RATING */}
        {item.rating && (
          <div
            className="
              absolute
              left-4 top-4
              flex items-center gap-1
              bg-[var(--card)]
              border border-[var(--border)]
              px-3 py-1.5
              text-xs font-semibold
              text-[var(--text)]
              rounded-full
              shadow-sm
            "
          >
            <FiStar className="fill-[var(--accent)] text-[var(--accent)]" />
            {item.rating}
          </div>
        )}

        {/* PRICE OVER IMAGE */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          <div>
            {oldPrice && (
              <span className="mr-2 text-xs text-[var(--cream)]/80 line-through">
                <Currency amount={oldPrice} />
              </span>
            )}

            <span className="text-xl font-bold tracking-tight text-white price">
              <Currency amount={price} />

            </span>
          </div>

          <div
            className="
              flex h-10 w-10 items-center justify-center
              border border-white/20
              bg-[var(--glass)]
              text-[var(--text)]
              backdrop-blur-md
              rounded-full
              transition-all duration-300
              group-hover:bg-[var(--accent)]
              group-hover:text-white
              group-hover:border-[var(--accent)]
            "
          >
            <FiShoppingBag size={17} />
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3
              className="
                truncate
                text-lg
                font-bold
                tracking-tight
                text-[var(--text)]
                font-serif
              "
            >
              {item.name}
            </h3>

            {item.description && (
              <p
                className="
                  mt-2
                  line-clamp-2
                  text-sm
                  leading-6
                  text-[var(--muted)]
                "
              >
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <span className="section-label">
            Freshly Prepared
          </span>

          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-wider
              text-[var(--accent)]
              transition-transform duration-300
              group-hover:translate-x-1
            "
          >
            View Dish →
          </span>
        </div>
      </div>
    </motion.article>
  );
}

// ==========================================
// SKELETON CARD
// ==========================================
function SkeletonCard() {
  return (
    <div className="card flex flex-col overflow-hidden p-0">
      <div className="aspect-[4/3] bg-[var(--border)]/40 animate-pulse" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-4 w-3/4 bg-[var(--border)]/60 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[var(--border)]/40 rounded animate-pulse" />
      </div>
    </div>
  );
}

// ==========================================
// FILTER PANEL
// ==========================================
function FilterPanel({
  categories,
  selectedCategory,
  setSelectedCategory,
  sizeOptions,
  selectedSizes,
  toggleSize,
  priceBounds,
  priceRange,
  setPriceRange,
  onClear,
}) {
  return (
    <div className="flex flex-col gap-8">
      {/* Category */}
      <div>
        <h3 className="section-label mb-3">
          Category
        </h3>
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`text-left text-sm px-3.5 py-2.5 rounded-xl transition-all ${!selectedCategory
              ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold"
              : "text-[var(--text)] hover:bg-[var(--cream)]"
              }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`text-left text-sm px-3.5 py-2.5 rounded-xl transition-all ${selectedCategory === cat._id
                ? "bg-[var(--accent-light)] text-[var(--accent)] font-semibold"
                : "text-[var(--text)] hover:bg-[var(--cream)]"
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="section-label mb-3">
          Price Range
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={priceBounds.min}
            max={priceRange[1]}
            value={priceRange[0]}
            onChange={(e) =>
              setPriceRange([Number(e.target.value), priceRange[1]])
            }
            className="w-full text-sm font-semibold text-[var(--text)]"
          />
          <span className="text-[var(--muted)] text-sm">—</span>
          <input
            type="number"
            min={priceRange[0]}
            max={priceBounds.max}
            value={priceRange[1]}
            onChange={(e) =>
              setPriceRange([priceRange[0], Number(e.target.value)])
            }
            className="w-full text-sm font-semibold text-[var(--text)]"
          />
        </div>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
          className="w-full mt-4 accent-[var(--accent)]"
        />
      </div>

      {/* Size / Portion Options */}
      {sizeOptions.length > 0 && (
        <div>
          <h3 className="section-label mb-3">
            Portion / Size
          </h3>
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((size) => {
              const active = selectedSizes.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => toggleSize(size)}
                  className={`min-w-10 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all ${active
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:border-[var(--accent)]"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={onClear}
        className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)] text-left transition-colors pt-2"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function Products() {
  const dispatch = useDispatch();

  const { products, loading } = useSelector((state) => state.products);
  const { categories } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getCategories());
  }, [dispatch]);

  const priceBounds = useMemo(() => {
    if (!products?.length) return { min: 0, max: 10000 };
    const mins = products.map(getMinPrice);
    return {
      min: Math.floor(Math.min(...mins) / 50) * 50,
      max: Math.ceil(Math.max(...mins) / 50) * 50 || 10000,
    };
  }, [products]);

  const [priceRange, setPriceRange] = useState([0, 10000]);
  useEffect(() => {
    setPriceRange([priceBounds.min, priceBounds.max]);
  }, [priceBounds.min, priceBounds.max]);

  const sizeOptions = useMemo(() => {
    const set = new Set();
    products?.forEach((p) =>
      p.variants?.forEach((v) => v.sizes?.forEach((s) => s.size && set.add(s.size)))
    );
    return Array.from(set).sort();
  }, [products]);

  const fuse = useMemo(
    () =>
      new Fuse(products ?? [], {
        keys: ["name", "description"],
        threshold: 0.35,
        ignoreLocation: true,
      }),
    [products]
  );

  const filtered = useMemo(() => {
    let list = search.trim()
      ? fuse.search(search.trim()).map((r) => r.item)
      : products ?? [];

    if (selectedCategory) {
      list = list.filter(
        (p) => (p.category?._id ?? p.category) === selectedCategory
      );
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.variants?.some((v) =>
          v.sizes?.some((s) => selectedSizes.includes(s.size))
        )
      );
    }

    list = list.filter((p) => {
      const min = getMinPrice(p);
      return min >= priceRange[0] && min <= priceRange[1];
    });

    const sorted = [...list];
    if (sortBy === "price-asc") sorted.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    if (sortBy === "price-desc") sorted.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    if (sortBy === "newest")
      sorted.sort(
        (a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0)
      );

    return sorted;
  }, [products, search, selectedCategory, selectedSizes, priceRange, sortBy, fuse]);

  const toggleSize = (size) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSizes([]);
    setPriceRange([priceBounds.min, priceBounds.max]);
    setSearch("");
  };

  const activeFilterCount =
    (selectedCategory ? 1 : 0) + selectedSizes.length;

  const sortLabels = {
    newest: "Newest",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
  };

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* ===== HEADER ===== */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={0}
        variants={fadeUp}
        className="mb-8"
      >
        <span className="section-label">
          Menu / Culinary Collection
        </span>
        <h1 className="logo text-4xl sm:text-5xl font-bold text-[var(--text)] mt-1">
          Our Menu
        </h1>
        <p className="text-sm text-[var(--muted)] mt-2">
          {loading ? "Preparing dishes…" : `${filtered.length} dishes available`}
        </p>
      </motion.div>

      {/* ===== TOOLBAR ===== */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={1}
        variants={fadeUp}
        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10"
      >
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu or ingredients…"
            className="pl-11 pr-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)]"
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="w-full sm:w-auto flex items-center justify-between gap-3 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
          >
            {sortLabels[sortBy]}
            <FiChevronDown
              className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>
          <AnimatePresence>
            {sortOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-[var(--shadow)] overflow-hidden z-30"
              >
                {Object.entries(sortLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setSortBy(key);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-[var(--cream)] transition-colors ${sortBy === key
                      ? "text-[var(--accent)] font-bold"
                      : "text-[var(--text)] font-medium"
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="relative flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors lg:hidden"
        >
          <FiSliders />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </motion.div>

      <div className="flex gap-10">
        {/* ===== DESKTOP SIDEBAR ===== */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 card p-6">
            <FilterPanel
              categories={categories ?? []}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              sizeOptions={sizeOptions}
              selectedSizes={selectedSizes}
              toggleSize={toggleSize}
              priceBounds={priceBounds}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              onClear={clearFilters}
            />
          </div>
        </aside>

        {/* ===== GRID ===== */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center text-center py-20 px-6 gap-4">
              <FiInbox className="text-4xl text-[var(--muted)]" />
              <h3 className="logo text-xl font-semibold text-[var(--text)]">
                No dishes match your filters
              </h3>
              <p className="text-sm text-[var(--muted)] max-w-xs">
                Try widening your price range or choosing a different category.
              </p>
              <button
                onClick={clearFilters}
                className="btn-accent px-6 py-2.5 text-sm font-semibold"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((item, index) => (
                <ProductCard key={item._id} item={item} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== MOBILE FILTER DRAWER ===== */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-[var(--card)] border-l border-[var(--border)] z-50 p-6 overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="logo text-xl font-semibold text-[var(--text)]">
                  Filters
                </h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-[var(--border)] text-[var(--text)]"
                >
                  <FiX />
                </button>
              </div>
              <FilterPanel
                categories={categories ?? []}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sizeOptions={sizeOptions}
                selectedSizes={selectedSizes}
                toggleSize={toggleSize}
                priceBounds={priceBounds}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                onClear={clearFilters}
              />
              <button
                onClick={() => setDrawerOpen(false)}
                className="btn-accent w-full mt-8 py-3 text-sm font-semibold"
              >
                Show {filtered.length} Results
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}