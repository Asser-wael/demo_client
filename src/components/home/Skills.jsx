import React from "react";
import { motion } from "framer-motion";
import { FiTruck, FiShield, FiRefreshCw, FiClock } from "react-icons/fi";

const trustItems = [
  {
    icon: FiTruck,
    number: "01",
    title: "Worldwide Delivery",
    description: "Express insured shipping directly to your doorstep with full tracking.",
  },
  {
    icon: FiShield,
    number: "02",
    title: "Guaranteed Authenticity",
    description: "Every item is crafted with premium grade materials and certified quality.",
  },
  {
    icon: FiRefreshCw,
    number: "03",
    title: "Seamless Returns",
    description: "14-day complimentary hassle-free return and exchange policy.",
  },
  {
    icon: FiClock,
    number: "04",
    title: "Dedicated Concierge",
    description: "24/7 personal customer support for a flawless shopping service.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Skills() {
  return (
    <section className="border-b border-[var(--border)] bg-[var(--bg)]">
      <div className="max-w-[1450px] mx-auto px-5 sm:px-8 lg:px-12 py-16 lg:py-24">
        
        {/* Header Tag */}
        <div className="mb-12 text-center">
          <span className="text-[9px] uppercase tracking-[0.35em] text-[var(--muted)] font-medium">
            The Standard
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl mt-2 tracking-tight">
            Designed for Excellence
          </h2>
        </div>

        {/* Grid Container */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--border)] border border-[var(--border)]"
        >
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                className="group relative bg-[var(--bg)] p-8 lg:p-10 flex flex-col justify-between transition-colors duration-500 hover:bg-[var(--card)]"
              >
                {/* Top Row: Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-mono tracking-widest text-[var(--muted)] group-hover:text-[var(--text)] transition-colors">
                      [{item.number}]
                    </span>
                    <div className="w-10 h-10 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text)] transition-all duration-300 group-hover:bg-[var(--text)] group-hover:text-[var(--bg)] group-hover:border-[var(--text)]">
                      <Icon className="text-base" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-serif text-xl font-medium text-[var(--text)] mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Subtle Hover Indicator Line */}
                <div className="mt-8 pt-4 border-t border-[var(--border)]/40 flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Learn More</span>
                  <span>→</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}