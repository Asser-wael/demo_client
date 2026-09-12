import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowUpRight,
  FiGrid,
  FiSearch,
  FiX,
  FiPackage,
} from "react-icons/fi";

import { getCategories } from "../features/category/categorySlice";

// ==========================================
// MOTION CONFIG
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: index * 0.06,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const heroFade = {
  hidden: { opacity: 0, y: 12 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Collections() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { categories, loading } = useSelector((state) => state.categories);

  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const filteredCategories =
    categories?.filter((cat) =>
      cat?.name?.toLowerCase().includes(search.trim().toLowerCase())
    ) ?? [];

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  return (
    <div className="w-full">
      {/* ===== HERO HEADER ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-8 sm:pb-10">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={heroFade}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-[var(--glass)] border border-[var(--border)] backdrop-blur-md w-fit mb-4 sm:mb-5"
        >
          <FiGrid className="text-[var(--primary)] text-xs sm:text-sm" />
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[var(--muted)]">
            Our Menu Sections
          </span>
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="visible"
          variants={heroFade}
          className="logo text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--text)] leading-tight"
        >
          Explore by{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]">
            Category
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={heroFade}
          className="text-xs sm:text-base text-[var(--muted)] font-light max-w-lg mt-3 sm:mt-4 leading-relaxed"
        >
          Discover our handcrafted culinary creations, prepared fresh daily for every taste.
        </motion.p>

        {/* Search Bar */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={heroFade}
          className="relative max-w-md mt-6 sm:mt-8"
        >
          <FiSearch className="absolute top-1/2 -translate-y-1/2 left-4 text-[var(--muted)] text-sm sm:text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories or dishes..."
            className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl bg-[var(--card)] border border-[var(--border)] text-xs sm:text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 -translate-y-1/2 right-4 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
            >
              <FiX className="text-sm sm:text-base" />
            </button>
          )}
        </motion.div>
      </section>

      {/* ===== CATEGORIES GRID ===== */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] sm:aspect-[3/4] rounded-2xl bg-[var(--border)] animate-pulse"
              />
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4"
          >
            <FiPackage className="text-3xl sm:text-4xl text-[var(--muted)] mb-3 sm:mb-4" />
            <span className="logo text-lg sm:text-xl font-semibold text-[var(--text)]">
              No menu categories found
            </span>
            <span className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Try searching for something else on our menu
            </span>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredCategories.map((item, index) => (
              <motion.div
                key={item._id ?? index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => navigate(`/collections/${item._id}`)}
                className="group relative w-full aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border border-[var(--border)] shadow-[var(--shadow)]"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {item.productsCount !== undefined && (
                  <span className="absolute top-3 left-3 font-mono text-[10px] sm:text-xs font-semibold tracking-wide text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full">
                    {item.productsCount} dishes
                  </span>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4 flex items-center justify-between">
                  <span className="logo text-base sm:text-lg text-white font-semibold tracking-wide truncate pr-2">
                    {item.name}
                  </span>
                  <FiArrowUpRight className="text-white text-base sm:text-lg shrink-0 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}