import { motion } from "framer-motion";
import { BiSolidMessageAltError } from "react-icons/bi";
import { useNavigate } from "react-router-dom";

export default function Error() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--color-bg)] px-4">

      {/* Background Glow */}
      <div
        className="absolute left-[-150px] top-[-150px] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background: "var(--color-primary)",
          opacity: 0.12,
        }}
      />

      <div
        className="absolute bottom-[-150px] right-[-150px] h-[420px] w-[420px] rounded-full blur-[120px]"
        style={{
          background: "var(--color-accent)",
          opacity: 0.12,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: .9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5 }}
        className="
          relative z-10
          w-full max-w-xl
          rounded-3xl
          border border-[var(--color-border)]
          bg-[var(--color-card)]
          p-10
          text-center
          shadow-[var(--shadow)]
        "
      >

        {/* Icon */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
          }}
          className="mx-auto w-fit text-8xl text-[var(--color-accent)]"
        >
          <BiSolidMessageAltError />
        </motion.div>

        {/* Title */}
        <h1 className="mt-6 text-5xl font-extrabold tracking-[6px] text-[var(--color-text)]">
          404
        </h1>

        <h2 className="mt-2 text-2xl font-bold text-[var(--color-text)]">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mx-auto mt-5 max-w-md leading-8 text-[var(--color-muted)]">
          Oops! The page you're looking for doesn't exist, has been moved,
          or the URL is incorrect.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: .95,
            }}
            onClick={() => navigate("/")}
            className="
              rounded-xl
              bg-[var(--color-primary)]
              px-8
              py-3
              font-semibold
              text-white
              transition-all
              hover:brightness-110
            "
          >
            Back Home
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: .95,
            }}
            onClick={() => navigate(-1)}
            className="
              rounded-xl
              border
              border-[var(--color-border)]
              bg-[var(--color-card)]
              px-8
              py-3
              font-semibold
              text-[var(--color-text)]
              transition-all
              hover:bg-[var(--color-bg)]
            "
          >
            Go Back
          </motion.button>

        </div>
      </motion.div>
    </div>
  );
}