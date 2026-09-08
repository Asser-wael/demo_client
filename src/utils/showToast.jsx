import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiXCircle,
  FiShoppingBag,
  FiAlertTriangle,
  FiTruck,
  FiX,
  FiBell,
} from "react-icons/fi";

// ==========================================
// CONSTANTS
// ==========================================

const ORDER_ACCENT = "#10B981"; // Emerald
const STOCK_ACCENT = "#F59E0B"; // Amber
const ERROR_ACCENT = "#EF4444";

// ==========================================
// TOAST CARD COMPONENT
// ==========================================

const ToastCard = ({
  t,
  accent,
  icon,
  title,
  message,
  isSuccess,
  amount,
  isAdminOrder,
  persistent,
}) => {
  const activeAccent = accent;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -18,
        scale: 0.94,
        filter: "blur(6px)",
      }}
      animate={{
        opacity: t.visible ? 1 : 0,
        y: t.visible ? 0 : -18,
        scale: t.visible ? 1 : 0.94,
        filter: t.visible ? "blur(0px)" : "blur(6px)",
      }}
      exit={{
        opacity: 0,
        scale: 0.9,
        filter: "blur(4px)",
      }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="
        relative
        w-[390px]
        max-w-[calc(100vw-32px)]
        overflow-hidden
        rounded-[22px]
        border
        bg-[var(--glass)]
        shadow-[var(--shadow)]
        backdrop-blur-[20px]
      "
      style={{
        borderColor: `${activeAccent}35`,
        boxShadow: `
          0 20px 50px rgba(0, 0, 0, 0.14),
          0 0 30px ${activeAccent}18
        `,
      }}
    >
      {/* ==========================================
          TOP ACCENT LINE
      ========================================== */}

      <div
        className="absolute inset-x-0 top-0 h-[2px]"
        style={{
          background: `
            linear-gradient(
              90deg,
              transparent 0%,
              ${activeAccent} 50%,
              transparent 100%
            )
          `,
          boxShadow: `0 0 14px ${activeAccent}`,
        }}
      />

      <div className="p-4 sm:p-5">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="flex items-start gap-3.5">

          {/* Icon Badge */}
          <div
            className="
              relative
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
            "
            style={{
              borderColor: `${activeAccent}30`,
              color: activeAccent,
              background: `
                radial-gradient(
                  circle at center,
                  ${activeAccent}18,
                  transparent 80%
                )
              `,
            }}
          >
            <motion.span
              className="
                absolute
                inset-0
                rounded-2xl
                blur-sm
              "
              animate={{
                opacity: [0.12, 0.28, 0.12],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: activeAccent,
              }}
            />

            <span className="relative text-[20px] drop-shadow-sm">
              {icon}
            </span>
          </div>

          {/* Title + Message */}
          <div className="min-w-0 flex-1 pt-0.5">

            <div className="flex items-center gap-2">

              <h3
                className="
                  font-serif
                  text-[16px]
                  font-bold
                  tracking-tight
                "
                style={{
                  color: "var(--text)",
                }}
              >
                {title}
              </h3>

              {persistent && (
                <span
                  className="
                    h-1.5
                    w-1.5
                    shrink-0
                    rounded-full
                    animate-pulse
                  "
                  style={{
                    background: activeAccent,
                    boxShadow: `0 0 8px ${activeAccent}`,
                  }}
                />
              )}

              {isSuccess && (
                <span
                  className="
                    h-2
                    w-2
                    shrink-0
                    rounded-full
                    animate-pulse
                  "
                  style={{
                    background: "var(--primary)",
                    boxShadow: "0 0 8px var(--primary)",
                  }}
                />
              )}
            </div>

            <p
              className="
                mt-1
                line-clamp-2
                text-[13px]
                font-medium
                leading-relaxed
              "
              style={{
                color: "var(--muted)",
              }}
            >
              {message}
            </p>

            {/* Persistent Badge */}
            {persistent && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                  duration: 0.25,
                }}
                className="
                  mt-2
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  px-2.5
                  py-1
                "
                style={{
                  background: `${activeAccent}12`,
                  color: activeAccent,
                }}
              >
                <FiBell size={10} />

                <span
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.1em]
                  "
                >
                  Requires attention
                </span>
              </motion.div>
            )}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            aria-label="Close notification"
            className="
              flex
              h-7
              w-7
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-transparent
              text-[var(--muted)]
              transition-all
              duration-200
              hover:border-[var(--border)]
              hover:bg-[var(--card)]
              hover:text-[var(--text)]
            "
          >
            <FiX size={14} />
          </button>
        </div>

        {/* ==========================================
            ADMIN ORDER AMOUNT
        ========================================== */}

        {isAdminOrder && amount !== undefined && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              delay: 0.12,
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              group
              relative
              mt-4
              overflow-hidden
              rounded-[18px]
              border
              px-4
              py-3.5
            "
            style={{
              borderColor: `${ORDER_ACCENT}35`,
              background: `
                linear-gradient(
                  135deg,
                  ${ORDER_ACCENT}15 0%,
                  ${ORDER_ACCENT}05 45%,
                  transparent 100%
                )
              `,
            }}
          >
            {/* Decorative Glow */}
            <motion.div
              className="
                pointer-events-none
                absolute
                -right-8
                -top-10
                h-28
                w-28
                rounded-full
                blur-3xl
              "
              animate={{
                opacity: [0.08, 0.2, 0.08],
                scale: [0.9, 1.1, 0.9],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                background: ORDER_ACCENT,
              }}
            />

            {/* Shine */}
            <motion.div
              className="
                pointer-events-none
                absolute
                inset-y-0
                -left-[100%]
                w-[60%]
                skew-x-[-20deg]
              "
              animate={{
                left: ["-100%", "180%"],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "easeInOut",
              }}
              style={{
                background: `
                  linear-gradient(
                    90deg,
                    transparent,
                    ${ORDER_ACCENT}12,
                    transparent
                  )
                `,
              }}
            />

            <div className="relative flex items-center justify-between gap-4">

              {/* Left */}
              <div className="flex flex-col">

                <div className="flex items-center gap-2">

                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.2em]
                    "
                    style={{
                      color: "var(--muted)",
                    }}
                  >
                    Order Total
                  </span>

                  <span
                    className="
                      h-1
                      w-1
                      rounded-full
                    "
                    style={{
                      background: ORDER_ACCENT,
                    }}
                  />
                </div>

                <span
                  className="
                    mt-1
                    text-[10px]
                    font-medium
                  "
                  style={{
                    color: "var(--muted)",
                  }}
                >
                  Payment amount
                </span>
              </div>

              {/* Amount */}
              <motion.div
                initial={{
                  scale: 0.75,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 260,
                  damping: 17,
                }}
                className="
                  flex
                  items-baseline
                  gap-1
                  shrink-0
                "
              >
                <span
                  className="
                    text-[24px]
                    font-black
                    tracking-[-0.03em]
                  "
                  style={{
                    color: ORDER_ACCENT,
                    textShadow: `
                      0 0 8px ${ORDER_ACCENT}30,
                      0 0 20px ${ORDER_ACCENT}20
                    `,
                  }}
                >
                  {Number(amount).toLocaleString("en-US")}
                </span>

                <span
                  className="
                    text-[10px]
                    font-extrabold
                    tracking-[0.08em]
                  "
                  style={{
                    color: ORDER_ACCENT,
                  }}
                >
                  EGP
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* ==========================================
          BOTTOM BAR
      ========================================== */}

      {persistent ? (
        <div
          className="
            relative
            flex
            h-[27px]
            w-full
            items-center
            justify-center
            gap-1.5
            overflow-hidden
          "
          style={{
            background: `${activeAccent}10`,
          }}
        >
          {/* Moving Shine */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(
                  90deg,
                  transparent,
                  ${activeAccent}25,
                  transparent
                )
              `,
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: [
                "-100% 0%",
                "200% 0%",
              ],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <span
            className="
              relative
              h-1.5
              w-1.5
              rounded-full
            "
            style={{
              background: activeAccent,
              boxShadow: `0 0 7px ${activeAccent}`,
            }}
          />

          <span
            className="
              relative
              text-[9px]
              font-bold
              uppercase
              tracking-[0.12em]
            "
            style={{
              color: activeAccent,
            }}
          >
            Tap × to dismiss
          </span>
        </div>
      ) : (
        <div
          className="
            h-[2.5px]
            w-full
            overflow-hidden
          "
          style={{
            background: "rgba(0,0,0,0.03)",
          }}
        >
          <motion.div
            initial={{
              width: "100%",
            }}
            animate={{
              width: "0%",
            }}
            transition={{
              duration: 4,
              ease: "linear",
            }}
            className="h-full"
            style={{
              background: `
                linear-gradient(
                  90deg,
                  ${accent},
                  var(--primary)
                )
              `,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// SHOW TOAST HANDLER
// ==========================================

export const showToast = ({
  type,
  message,
  amount,
}) => {
  const config = {
    // ========================================
    // ADMIN ORDER
    // ========================================

    adminOrder: {
      accent: ORDER_ACCENT,
      icon: <FiShoppingBag />,
      title: "New Order",
      persistent: true,
    },

    // ========================================
    // LOW STOCK
    // ========================================

    lowStock: {
      accent: STOCK_ACCENT,
      icon: <FiAlertTriangle />,
      title: "Stock Alert",
      persistent: true,
    },

    // ========================================
    // ORDER STATUS
    // ========================================

    orderStatus: {
      accent: "var(--primary)",
      icon: <FiTruck />,
      title: "Order Update",
      persistent: false,
    },

    // ========================================
    // SUCCESS
    // ========================================

    success: {
      accent: "var(--primary)",
      icon: <FiCheckCircle />,
      title: "Success",
      persistent: false,
    },

    // ========================================
    // ERROR
    // ========================================

    error: {
      accent: ERROR_ACCENT,
      icon: <FiXCircle />,
      title: "An Error Occurred",
      persistent: false,
    },
  };

  // ==========================================
  // BOOLEAN TYPES
  // ==========================================

  let selectedType = type;

  if (type === true) {
    selectedType = "success";
  }

  if (type === false) {
    selectedType = "error";
  }

  const current = config[selectedType];

  // ==========================================
  // FALLBACK
  // ==========================================

  if (!current) {
    toast(message);
    return;
  }

  // ==========================================
  // CUSTOM TOAST
  // ==========================================

  toast.custom(
    (t) => (
      <ToastCard
        t={t}
        accent={current.accent}
        icon={current.icon}
        title={current.title}
        message={message}
        amount={amount}
        isAdminOrder={selectedType === "adminOrder"}
        isSuccess={selectedType === "success"}
        persistent={current.persistent}
      />
    ),
    {
      duration: current.persistent
        ? Infinity
        : 4000,

      position: "top-right",
    }
  );
};