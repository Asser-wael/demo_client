import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import {
  FiClock,
  FiHeart,
  FiPlus,
  FiStar,
  FiArrowUpRight,
  FiAward,
  FiShield,
  FiTruck,
} from "react-icons/fi";

import { getCategories } from "../../src/features/category/categorySlice";
import { getPopularProducts } from "../features/popular/popularSlice";
import { getLatestProducts } from "../features/products/productSlice";
import { getTrustItems } from "../features/trust/trustSlice";

import Currency from "../components/company/Currency";

// ============================================================
// ANIMATION
// ============================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16,
  },

  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: Math.min(index * 0.05, 0.25),
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const staticVariant = {
  hidden: {
    opacity: 1,
    y: 0,
  },

  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0,
    },
  },
};

// ============================================================
// SWIPER
// ============================================================

const swiperBreakpoints = {
  0: {
    slidesPerView: 1.15,
    spaceBetween: 14,
  },

  480: {
    slidesPerView: 1.45,
    spaceBetween: 16,
  },

  640: {
    slidesPerView: 2.15,
    spaceBetween: 18,
  },

  768: {
    slidesPerView: 2.5,
    spaceBetween: 20,
  },

  1024: {
    slidesPerView: 3.2,
    spaceBetween: 22,
  },

  1280: {
    slidesPerView: 4,
    spaceBetween: 24,
  },
};

// ============================================================
// STATIC CONTENT
// ============================================================

const kitchenNotes = [
  {
    icon: FiTruck,
    title: "Delivered hot",
    description:
      "Sealed within minutes of leaving the pass, on the road in under ten.",
  },

  {
    icon: FiAward,
    title: "Trained kitchen",
    description:
      "Every section runs under a head chef with formal culinary training.",
  },

  {
    icon: FiShield,
    title: "Sourced daily",
    description:
      "Produce and fish are bought each morning, not held in cold storage.",
  },

  {
    icon: FiClock,
    title: "Open late",
    description:
      "Kitchen takes orders until 1am, seven nights a week.",
  },
];

// ============================================================
// PRICE HELPERS
// ============================================================

function getEffectivePrice(size) {
  const price = Number(size?.price);

  const offerPrice = Number(size?.offerPrice);

  const hasOffer =
    Number.isFinite(offerPrice) &&
    offerPrice > 0 &&
    Number.isFinite(price) &&
    offerPrice < price;

  return hasOffer ? offerPrice : price;
}

function getPriceInfo(item) {
  const allSizes = (item?.variants ?? []).flatMap(
    (variant) => variant?.sizes ?? []
  );

  if (!allSizes.length) {
    return {
      price: null,
      oldPrice: null,
    };
  }

  const cheapest = allSizes.reduce((min, current) => {
    return getEffectivePrice(current) < getEffectivePrice(min)
      ? current
      : min;
  });

  const price = Number(cheapest?.price);
  const offerPrice = Number(cheapest?.offerPrice);

  const hasOffer =
    Number.isFinite(offerPrice) &&
    offerPrice > 0 &&
    Number.isFinite(price) &&
    offerPrice < price;

  return {
    price: hasOffer ? offerPrice : price,
    oldPrice: hasOffer ? price : null,
  };
}

function getAllSizesList(item) {
  const sizes = new Set();

  item?.variants?.forEach((variant) => {
    variant?.sizes?.forEach((size) => {
      if (size?.size) {
        sizes.add(size.size);
      }
    });
  });

  return Array.from(sizes);
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({
  title,
  buttonText,
  onClick,
}) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8 sm:mb-10">
      <h2 className="font-serif text-3xl sm:text-4xl leading-tight text-[var(--color-text-bright)]">
        {title}
      </h2>

      {buttonText && (
        <button
          type="button"
          onClick={onClick}
          className="
            hidden sm:flex
            shrink-0
            items-center
            gap-2
            text-[13px]
            font-semibold
            text-[var(--color-text-muted)]
            hover:text-[var(--color-accent)]
            transition-colors
          "
        >
          {buttonText}
          <FiArrowUpRight className="text-sm" />
        </button>
      )}
    </div>
  );
}

// ============================================================
// MENU CARD
// ============================================================

function MenuCard({
  item,
  index = 0,
  badgeLabel,
  showNewTag = false,
}) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const { price, oldPrice } = getPriceInfo(item);
  const sizeBadges = getAllSizesList(item);

  const rating =
    typeof item?.rating === "number"
      ? item.rating.toFixed(1)
      : "4.9";

  return (
    <motion.article
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
      variants={reduceMotion ? staticVariant : fadeUp}
      onClick={() => navigate(`/menu/${item?._id}`)}
      className="
        group
        h-full
        flex
        flex-col
        overflow-hidden
        cursor-pointer
        rounded-xl
        border
        border-[var(--color-border-subtle)]
        bg-[var(--color-bg-surface)]
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-[var(--color-accent)]
        hover:shadow-xl
      "
    >
      {/* IMAGE */}
      <div
        className="
          relative
          aspect-[4/3]
          overflow-hidden
          bg-[var(--color-bg-elevated)]
        "
      >
        {item?.image ? (
          <img
            src={item.image}
            alt={item?.name || "Dish"}
            loading="lazy"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              ease-out
              group-hover:scale-105
            "
          />
        ) : (
          <div className="absolute inset-0 bg-[var(--color-bg-elevated)]" />
        )}

        {/* IMAGE OVERLAY */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/25
            via-transparent
            to-transparent
            opacity-60
          "
        />

        {/* BADGES */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
          {showNewTag && (
            <span
              className="
                rounded-full
                border
                border-[var(--color-accent)]
                bg-[var(--color-bg-primary)]/90
                px-3
                py-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.14em]
                text-[var(--color-accent)]
                backdrop-blur-md
              "
            >
              New
            </span>
          )}

          {badgeLabel && (
            <span
              className="
                rounded-full
                border
                border-[var(--color-border-subtle)]
                bg-[var(--color-bg-primary)]/90
                px-3
                py-1.5
                text-[9px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-[var(--color-text-muted)]
                backdrop-blur-md
              "
            >
              {badgeLabel}
            </span>
          )}
        </div>

        {/* HEART */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Save dish"
          className="
            absolute
            top-3
            right-3
            z-20
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-[var(--color-border-subtle)]
            bg-[var(--color-bg-primary)]/85
            text-[var(--color-text-main)]
            backdrop-blur-md
            transition-all
            duration-200
            hover:border-[var(--color-accent)]
            hover:text-[var(--color-accent)]
          "
        >
          <FiHeart className="text-sm" />
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div>
          {/* CATEGORY + RATING */}
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <span
              className="
                min-w-0
                truncate
                text-[10px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[var(--color-text-muted)]
              "
            >
              {item?.category?.name || "Signature dish"}
            </span>

            <span
              className="
                flex
                shrink-0
                items-center
                gap-1
                rounded-md
                bg-[var(--color-bg-elevated)]
                px-2
                py-1
                text-[11px]
                font-semibold
                text-[var(--color-text-main)]
              "
            >
              <FiStar
                className="
                  text-[var(--color-accent)]
                  fill-[var(--color-accent)]
                "
              />

              {rating}
            </span>
          </div>

          {/* NAME */}
          <h3
            className="
              truncate
              font-serif
              text-xl
              leading-tight
              text-[var(--color-text-bright)]
              transition-colors
              duration-200
              group-hover:text-[var(--color-accent)]
            "
          >
            {item?.name}
          </h3>

          {/* DESCRIPTION */}
          {item?.description && (
            <p
              className="
                mt-2
                line-clamp-2
                text-xs
                leading-relaxed
                text-[var(--color-text-muted)]
              "
            >
              {item.description}
            </p>
          )}

          {/* SIZES */}
          {sizeBadges.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {sizeBadges.map((size, i) => (
                <span
                  key={`${size}-${i}`}
                  className="
                    rounded
                    border
                    border-[var(--color-border-subtle)]
                    bg-[var(--color-bg-elevated)]
                    px-2
                    py-1
                    text-[9px]
                    font-mono
                    uppercase
                    text-[var(--color-text-muted)]
                  "
                >
                  {size}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[var(--color-border-subtle)]
            pt-4
            mt-5
          "
        >
          <div className="flex min-w-0 items-baseline gap-2">
            {price !== null && (
              <Currency
                amount={price}
                className="
                  truncate
                  text-base
                  font-bold
                  text-[var(--color-text-bright)]
                "
              />
            )}

            {oldPrice !== null && (
              <Currency
                amount={oldPrice}
                className="
                  shrink-0
                  text-xs
                  text-[var(--color-text-muted)]
                  line-through
                "
              />
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/menu/${item?._id}`);
            }}
            aria-label={`Order ${item?.name || "dish"}`}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[var(--color-accent)]
              text-[var(--color-text-bright)]
              transition-all
              duration-200
              hover:scale-105
              hover:bg-[var(--color-accent-hover)]
            "
          >
            <FiPlus className="text-base" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

// ============================================================
// PRODUCT SWIPER
// ============================================================

function ProductSwiper({
  products = [],
  badgeLabel,
  showNewTag = false,
  reduceMotion,
}) {
  if (!products?.length) {
    return (
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] px-6 py-12 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          No dishes available right now.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1.15}
        spaceBetween={14}
        breakpoints={swiperBreakpoints}
        autoplay={
          reduceMotion
            ? false
            : {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
        }
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        watchSlidesProgress
        observer
        observeParents
        className="home-products-swiper !overflow-visible !pb-14"
      >
        {products.map((raw, index) => {
          const item = raw?.id || raw;

          if (!item?._id) return null;

          return (
            <SwiperSlide
              key={item._id}
              className="!h-auto"
            >
              <div className="h-full">
                <MenuCard
                  item={item}
                  index={index}
                  badgeLabel={badgeLabel}
                  showNewTag={showNewTag}
                />
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}

// ============================================================
// HOME PAGE
// ============================================================

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const {
    categories,
    loading: categoriesLoading,
  } = useSelector((state) => state.categories);

  const {
    popularProducts,
    loading: popularLoading,
  } = useSelector((state) => state.popular);

  const {
    latestProducts,
    loading: newLoading,
  } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getPopularProducts());
    dispatch(getLatestProducts());
  }, [dispatch]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const variant = reduceMotion ? staticVariant : fadeUp;

  return (
    <main
      className="
        min-h-screen
        w-full
        overflow-x-hidden
        bg-[var(--color-bg-primary)]
        font-sans
        text-[var(--color-text-main)]
        antialiased
      "
    >
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-10 lg:pb-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* LEFT */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={variant}
          >
            <div className="mb-5 flex items-center gap-3">
              <span className="h-px w-8 bg-[var(--color-accent)]" />

              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[var(--color-accent)]
                "
              >
                Fresh every day
              </span>
            </div>

            <h1
              className="
                max-w-2xl
                font-serif
                text-[38px]
                leading-[1.04]
                text-[var(--color-text-bright)]
                sm:text-[50px]
                lg:text-[58px]
              "
            >
              A kitchen built around what's fresh today.
            </h1>

            <p
              className="
                mt-6
                max-w-xl
                text-[14px]
                leading-7
                text-[var(--color-text-muted)]
                sm:text-[15px]
              "
            >
              We buy from the market each morning and build the day's
              dishes around it. Order for delivery or reserve a table
              for the full room.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("/menu")}
                className="
                  rounded-md
                  bg-[var(--color-accent)]
                  px-6
                  py-3
                  text-[13px]
                  font-semibold
                  text-[var(--color-text-bright)]
                  shadow-sm
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:bg-[var(--color-accent-hover)]
                "
              >
                View the menu
              </button>

              <button
                type="button"
                onClick={() => navigate("/menu?sort=new")}
                className="
                  rounded-md
                  border
                  border-[var(--color-border-subtle)]
                  px-6
                  py-3
                  text-[13px]
                  font-semibold
                  text-[var(--color-text-main)]
                  transition-all
                  duration-200
                  hover:border-[var(--color-accent)]
                  hover:text-[var(--color-accent)]
                "
              >
                Today's specials
              </button>
            </div>
          </motion.div>

          {/* RIGHT */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={1}
            variants={variant}
            className="relative mx-auto w-full max-w-[520px] lg:mx-0"
          >
            <div
              className="
                relative
                aspect-[4/5]
                overflow-hidden
                rounded-2xl
                border
                border-[var(--color-border-subtle)]
                bg-[var(--color-bg-surface)]
                shadow-2xl
              "
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/bg2.mp4" type="video/mp4" />
              </video>

              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* TICKET */}
            <div
              className="
                absolute
                -bottom-6
                left-4
                w-[220px]
                rounded-xl
                border
                border-[var(--color-border-subtle)]
                bg-[var(--color-bg-surface)]/95
                p-4
                shadow-2xl
                backdrop-blur-xl
                sm:-left-8
                sm:w-[250px]
              "
            >
              <div
                className="
                  mb-3
                  border-b
                  border-dashed
                  border-[var(--color-border-subtle)]
                  pb-2
                "
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-[var(--color-text-muted)]
                  "
                >
                  Tonight's special
                </span>
              </div>

              <p
                className="
                  font-serif
                  text-[15px]
                  leading-snug
                  text-[var(--color-text-bright)]
                "
              >
                Butter-poached lobster, charred corn
              </p>

              <div className="mt-2 text-sm font-semibold text-[var(--color-accent)]">
                <Currency amount={40} />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======================================================
          KITCHEN NOTES
      ====================================================== */}

      <section
        className="
          border-y
          border-[var(--color-border-subtle)]
          bg-[var(--color-bg-surface)]
        "
      >
        <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {kitchenNotes.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.3,
                  }}
                  variants={variant}
                  className="flex gap-3"
                >
                  <Icon
                    className="
                      mt-0.5
                      shrink-0
                      text-lg
                      text-[var(--color-accent)]
                    "
                  />

                  <div>
                    <h3
                      className="
                        text-[14px]
                        font-semibold
                        text-[var(--color-text-bright)]
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-1
                        text-[13px]
                        leading-relaxed
                        text-[var(--color-text-muted)]
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================================================
          TRUST
      ====================================================== */}

      <TrustSection />

      {/* ======================================================
          CATEGORIES
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 lg:px-10">
        <SectionHeader
          title="Browse the menu"
          buttonText="All categories"
          onClick={() => navigate("/menu")}
        />

        {categoriesLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="
                  aspect-[3/4]
                  animate-pulse
                  rounded-xl
                  border
                  border-[var(--color-border-subtle)]
                  bg-[var(--color-bg-surface)]
                "
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories?.slice(0, 4).map((item, index) => (
              <motion.div
                key={item?._id || index}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.15,
                }}
                variants={variant}
                onClick={() =>
                  navigate(`/menu?category=${item?._id}`)
                }
                className="
                  group
                  relative
                  aspect-[3/4]
                  cursor-pointer
                  overflow-hidden
                  rounded-xl
                  border
                  border-[var(--color-border-subtle)]
                  bg-[var(--color-bg-surface)]
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-[var(--color-accent)]
                "
              >
                <img
                  src={item?.image}
                  alt={item?.name || "Category"}
                  loading="lazy"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/80
                    via-black/15
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute
                    bottom-0
                    left-0
                    right-0
                    flex
                    items-end
                    justify-between
                    gap-2
                    p-4
                    sm:p-5
                  "
                >
                  <h3
                    className="
                      font-serif
                      text-lg
                      text-white
                      sm:text-xl
                    "
                  >
                    {item?.name}
                  </h3>

                  <FiArrowUpRight
                    className="
                      shrink-0
                      text-white/60
                      transition-colors
                      group-hover:text-[var(--color-accent)]
                    "
                  />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ======================================================
          POPULAR
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 pb-20 sm:px-8 lg:px-10">
        <SectionHeader
          title="What people keep ordering"
          buttonText="Full menu"
          onClick={() => navigate("/menu")}
        />

        {popularLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="
                  aspect-[3/4]
                  animate-pulse
                  rounded-xl
                  border
                  border-[var(--color-border-subtle)]
                  bg-[var(--color-bg-surface)]
                "
              />
            ))}
          </div>
        ) : (
          <ProductSwiper
            products={popularProducts}
            badgeLabel="Often ordered"
            reduceMotion={reduceMotion}
          />
        )}
      </section>

      {/* ======================================================
          EDITORIAL
      ====================================================== */}

      <section className="px-5 pb-20 sm:px-8 lg:px-10">
        <div
          className="
            mx-auto
            grid
            max-w-[1280px]
            overflow-hidden
            rounded-2xl
            border
            border-[var(--color-border-subtle)]
            bg-[var(--color-bg-surface)]
            lg:grid-cols-2
          "
        >
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-[var(--color-accent)]
              "
            >
              From our kitchen
            </span>

            <h2
              className="
                mt-4
                max-w-lg
                font-serif
                text-3xl
                leading-tight
                text-[var(--color-text-bright)]
                sm:text-4xl
              "
            >
              Cooked to order, not held under a heat lamp.
            </h2>

            <p
              className="
                mt-5
                max-w-md
                text-[14px]
                leading-7
                text-[var(--color-text-muted)]
              "
            >
              Every plate starts when your order comes in. It takes
              a little longer than fast food, and it tastes like it.
            </p>

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="
                mt-8
                w-fit
                rounded-md
                bg-[var(--color-accent)]
                px-6
                py-3
                text-[13px]
                font-semibold
                text-[var(--color-text-bright)]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:bg-[var(--color-accent-hover)]
              "
            >
              Reserve a table
            </button>
          </div>

          <div className="relative min-h-[320px] lg:min-h-[440px]">
            <img
              src="/dishFromCH.jpg"
              alt="Dish from the kitchen"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* ======================================================
          NEW ARRIVALS
      ====================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 pb-24 sm:px-8 lg:px-10">
        <SectionHeader
          title="New on the menu this season"
          buttonText="See seasonal menu"
          onClick={() => navigate("/menu?sort=new")}
        />

        {newLoading ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="
                  aspect-[3/4]
                  animate-pulse
                  rounded-xl
                  border
                  border-[var(--color-border-subtle)]
                  bg-[var(--color-bg-surface)]
                "
              />
            ))}
          </div>
        ) : (
          <ProductSwiper
            products={latestProducts}
            showNewTag
            reduceMotion={reduceMotion}
          />
        )}
      </section>

      {/* ======================================================
          PHILOSOPHY
      ====================================================== */}

      <section
        className="
          border-y
          border-[var(--color-border-subtle)]
          bg-[var(--color-bg-surface)]
          py-20
        "
      >
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8 sm:text-left">
          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-[var(--color-accent)]
            "
          >
            Our philosophy
          </span>

          <h2
            className="
              mt-4
              font-serif
              text-3xl
              leading-snug
              text-[var(--color-text-bright)]
              sm:text-4xl
            "
          >
            We'd rather run out of a dish than serve a worse version
            of it.
          </h2>

          <p
            className="
              mt-5
              text-[14px]
              leading-7
              text-[var(--color-text-muted)]
            "
          >
            That means the menu changes with the season and, some
            nights, with what the market had. Ask your server what's
            good today; we'll tell you honestly.
          </p>
        </div>
      </section>

      {/* ======================================================
          NEWSLETTER
      ====================================================== */}

      <section
        className="
          bg-[var(--color-accent)]
          py-20
          text-[var(--color-text-bright)]
        "
      >
        <div className="mx-auto max-w-xl px-5 sm:px-8">
          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              opacity-70
            "
          >
            Stay in the loop
          </span>

          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            Hear about new menus first.
          </h2>

          <p className="mt-3 text-[14px] leading-7 opacity-80">
            One email when the season changes. No specials spam,
            no daily blasts.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="mt-7 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="you@email.com"
              className="
                min-w-0
                flex-1
                rounded-md
                border
                border-white/20
                bg-black/10
                px-4
                py-3
                text-sm
                text-[var(--color-text-bright)]
                outline-none
                placeholder:text-[var(--color-text-bright)]/50
                focus:border-white/50
                focus:ring-2
                focus:ring-white/20
              "
            />

            <button
              type="submit"
              className="
                rounded-md
                bg-[var(--color-bg-primary)]
                px-6
                py-3
                text-[13px]
                font-semibold
                text-[var(--color-text-bright)]
                transition-colors
                duration-200
                hover:bg-[var(--color-bg-surface)]
              "
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* ======================================================
          SWIPER GLOBAL STYLES
      ====================================================== */}

      <style>{`
        .home-products-swiper {
          width: 100%;
        }

        .home-products-swiper .swiper-wrapper {
          align-items: stretch;
        }

        .home-products-swiper .swiper-slide {
          height: auto;
          display: flex;
        }

        .home-products-swiper .swiper-slide > div {
          width: 100%;
        }

        .home-products-swiper .swiper-pagination {
          bottom: 0 !important;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .home-products-swiper
          .swiper-pagination-bullet {
          width: 6px;
          height: 6px;
          margin: 0 4px !important;
          opacity: 0.35;
          background: var(--color-text-muted);
          transition: all 0.25s ease;
        }

        .home-products-swiper
          .swiper-pagination-bullet-active {
          width: 20px;
          border-radius: 999px;
          opacity: 1;
          background: var(--color-accent);
        }

        @media (max-width: 640px) {
          .home-products-swiper {
            margin-right: -20px;
            padding-right: 20px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .home-products-swiper .swiper-wrapper {
            transition-duration: 0ms !important;
          }
        }
      `}</style>
    </main>
  );
}

// ============================================================
// TRUST ITEM
// ============================================================

function TrustItem({ item, index }) {
  const [img, setImg] = useState(null);
  const reduceMotion = useReducedMotion();

  const variant = reduceMotion ? staticVariant : fadeUp;

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{
          once: true,
          amount: 0.3,
        }}
        variants={variant}
        className="flex items-center gap-4 text-left"
      >
        <button
          type="button"
          onClick={() => setImg(item?.image)}
          aria-label={`View ${item?.title || "certification"}`}
          className="
            relative
            flex
            h-12
            w-12
            shrink-0
            cursor-zoom-in
            items-center
            justify-center
            overflow-hidden
            rounded-md
            border
            border-[var(--color-border-subtle)]
            transition-colors
            duration-200
            hover:border-[var(--color-accent)]
          "
        >
          <img
            src={item?.image}
            alt={item?.title || "Quality badge"}
            loading="lazy"
            className="h-6 w-6 object-contain"
          />
        </button>

        <h3
          className="
            text-[14px]
            font-medium
            text-[var(--color-text-bright)]
          "
        >
          {item?.title}
        </h3>
      </motion.div>

      {img && (
        <div
          onClick={() => setImg(null)}
          className="
            fixed
            inset-0
            z-[9999]
            flex
            cursor-zoom-out
            items-center
            justify-center
            bg-black/85
            p-4
            backdrop-blur-sm
          "
        >
          <img
            src={img}
            alt="Preview"
            className="
              max-h-[85vh]
              max-w-[85vw]
              rounded-lg
              border
              border-white/10
              object-contain
            "
          />
        </div>
      )}
    </>
  );
}

// ============================================================
// TRUST SECTION
// ============================================================

function TrustSection() {
  const dispatch = useDispatch();

  const {
    trustItems,
    loading,
  } = useSelector((state) => state.trust);

  useEffect(() => {
    dispatch(getTrustItems());
  }, [dispatch]);

  if (
    !loading &&
    (!trustItems || trustItems.length === 0)
  ) {
    return null;
  }

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10">
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="
                  h-12
                  animate-pulse
                  rounded-md
                  border
                  border-[var(--color-border-subtle)]
                  bg-[var(--color-bg-surface)]
                "
              />
            ))
          : trustItems.map((item, index) => (
              <TrustItem
                key={item?._id || index}
                item={item}
                index={index}
              />
            ))}
      </div>
    </section>
  );
}
