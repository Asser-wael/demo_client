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
// TOAST CARD COMPONENT — Editorial style:
// sharp corners, single border, flat card
// surface, no blur/glow/shine — matches the
// admin shell's bordered card language.
// ==========================================

const ToastCard = ({
  t,
  accent,
  icon,
  title,
  message,
  isAdminOrder,
  amount,
  persistent,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: t.visible ? 1 : 0, y: t.visible ? 0 : -10 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="relative flex w-[360px] max-w-[calc(100vw-32px)] items-start gap-3 border border-border bg-card p-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center border border-border text-lg"
        style={{ color: accent }}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-[15px] font-semibold text-text">
            {title}
          </h3>

          {persistent && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ background: accent }}
            />
          )}
        </div>

        <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-muted">
          {message}
        </p>

        {isAdminOrder && amount !== undefined && (
          <div className="mt-3 flex items-center justify-between border border-border px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              Order total
            </span>
            <span
              className="text-sm font-semibold"
              style={{ color: ORDER_ACCENT }}
            >
              NZ$ {Number(amount).toLocaleString("en-US")}
            </span>
          </div>
        )}

        {persistent && (
          <div
            className="mt-2 inline-flex items-center gap-1.5 border px-2 py-1"
            style={{ borderColor: `${accent}40`, color: accent }}
          >
            <FiBell size={10} />
            <span className="text-[9px] font-semibold uppercase tracking-[0.1em]">
              Requires attention
            </span>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Close notification"
        className="flex h-6 w-6 shrink-0 items-center justify-center border border-transparent text-muted transition-colors hover:border-border hover:text-text"
      >
        <FiX size={14} />
      </button>

      {!persistent && (
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-border">
          <motion.div
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 4, ease: "linear" }}
            className="h-full"
            style={{ background: accent }}
          />
        </div>
      )}
    </motion.div>
  );
};

// ==========================================
// SHOW TOAST HANDLER
// ==========================================

export const showToast = ({ type, message, amount }) => {
  const config = {
    adminOrder: {
      accent: ORDER_ACCENT,
      icon: <FiShoppingBag />,
      title: "New Order",
      persistent: true,
    },

    lowStock: {
      accent: STOCK_ACCENT,
      icon: <FiAlertTriangle />,
      title: "Stock Alert",
      persistent: true,
    },

    orderStatus: {
      accent: "var(--primary)",
      icon: <FiTruck />,
      title: "Order Update",
      persistent: false,
    },

    success: {
      accent: "var(--primary)",
      icon: <FiCheckCircle />,
      title: "Success",
      persistent: false,
    },

    error: {
      accent: ERROR_ACCENT,
      icon: <FiXCircle />,
      title: "An Error Occurred",
      persistent: false,
    },
  };

  let selectedType = type;
  if (type === true) selectedType = "success";
  if (type === false) selectedType = "error";

  const current = config[selectedType];

  if (!current) {
    toast(message);
    return;
  }

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
        persistent={current.persistent}
      />
    ),
    {
      duration: current.persistent ? Infinity : 4000,
      position: "top-right",
    }
  );
};
