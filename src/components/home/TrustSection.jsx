import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";

import { getTrustItems } from "../../features/trust/trustSlice";

// ============================================================
// ANIMATION
// ============================================================

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ============================================================
// TRUST ITEM
// ============================================================

function TrustItem({ item, index }) {
  const [img, setImg] = useState(null);

  return (
    <>
      <motion.div
        custom={index}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
        className="
          group flex flex-col items-center gap-4
          text-center px-4
          sm:flex-row sm:text-left sm:gap-5
        "
      >
        {/* Animated Icon */}
        <motion.button
          type="button"
          onClick={() => setImg(item?.image)}
          whileHover={{
            scale: 1.08,
            rotate: 3,
          }}
          whileTap={{
            scale: 0.94,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
          className="
            relative flex h-14 w-14 shrink-0
            items-center justify-center
            rounded-full
            border border-[var(--border)]
            bg-[var(--bg)]
            overflow-hidden
            cursor-zoom-in
            transition-colors duration-300
            group-hover:border-[var(--primary)]
          "
        >
          {/* Glow */}
          <motion.span
            className="
              absolute inset-0 rounded-full
              bg-[var(--primary)]
              opacity-0
              blur-xl
            "
            whileHover={{
              opacity: 0.15,
              scale: 1.3,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Icon */}
          <motion.img
            src={item?.image}
            alt={item?.title || "Trust badge"}
            className="relative z-10 h-7 w-7 object-contain"
            whileHover={{
              scale: 1.15,
              rotate: -3,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 12,
            }}
          />
        </motion.button>

        {/* Content */}
        <motion.div
          whileHover={{ x: 3 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <h3 className="
            font-serif
            text-sm sm:text-base
            font-medium
            text-[var(--text)]
            leading-snug
            transition-colors duration-300
            group-hover:text-[var(--primary)]
          ">
            {item?.title}
          </h3>
        </motion.div>
      </motion.div>

      {/* Image Preview */}
      {img && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setImg(null)}
          className="
            fixed inset-0 z-[9999]
            flex items-center justify-center
            bg-black/80 backdrop-blur-sm
            p-4 cursor-zoom-out
          "
        >
          <motion.img
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 250,
              damping: 20,
            }}
            src={img}
            alt={item?.title || "Trust badge"}
            onClick={(e) => e.stopPropagation()}
            className="
              max-h-[90vh]
              max-w-[90vw]
              object-contain
              rounded-2xl
              shadow-2xl
            "
          />

          <motion.button
            type="button"
            onClick={() => setImg(null)}
            whileHover={{
              scale: 1.1,
              rotate: 90,
            }}
            whileTap={{ scale: 0.9 }}
            className="
              absolute top-5 right-5
              flex h-10 w-10
              items-center justify-center
              rounded-full
              bg-white/10
              text-white
              text-2xl
              hover:bg-white/20
              transition
            "
          >
            ×
          </motion.button>
        </motion.div>
      )}
    </>
  );
}
// ============================================================
// SKELETON
// ============================================================

function TrustSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4 lg:gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5 px-4"
        >
          <div className="h-14 w-14 shrink-0 rounded-full bg-[var(--card)] animate-pulse" />
          <div className="h-3 w-24 rounded-full bg-[var(--card)] animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ============================================================
// TRUST SECTION
// ============================================================

export default function TrustSection() {
  const dispatch = useDispatch();

  const { trustItems, loading } = useSelector((state) => state.trust);

  useEffect(() => {
    dispatch(getTrustItems());
  }, [dispatch]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // الفارق الزمني بين ظهور العناصر
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  if (!loading && (!trustItems || trustItems.length === 0)) {
    return null;
  }

  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-8 lg:px-12 py-12 sm:py-14">

        {/* Title */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // تعمل الحركة مرة واحدة عند الوصول إليها أثناء التمرير
          className="text-center mb-10 sm:mb-12"
        >
          <motion.span
            variants={itemVariants}
            className="block mb-2 text-xs sm:text-sm uppercase tracking-[0.3em] text-[var(--primary)]"
          >
            Why Choose Us
          </motion.span>

          <motion.h2
            variants={itemVariants}
            className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-[var(--text)]"
          >
            A Shopping Experience You Can Trust
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-[var(--muted)]"
          >
            Everything you need for a seamless, secure, and premium shopping experience.
          </motion.p>
        </motion.div>

        {loading ? (
          <TrustSkeleton />
        ) : (
          <div className="grid grid-cols-2 gap-y-10 gap-x-4 lg:grid-cols-4 lg:gap-8">
            {trustItems.map((item, index) => (
              <TrustItem
                key={item?._id || index}
                item={item}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
