import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { registerUser, googleAuth } from "../features/auth/authSlice";
import { motion } from "framer-motion";
import { MdEmail, MdLockOutline, MdPersonOutline } from "react-icons/md";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import { showToast } from "../utils/showToast.jsx";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit, reset } = useForm();
  const [errorMsg, setErrorMsg] = useState("");
  const { loadingRegister } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    setErrorMsg("");

    const res = await dispatch(registerUser(data))

    const status = res.payload?.type;

    if (status === "success") {
      reset();
      navigate("/login", {
        replace: true,
        state: { verifyEmail: true, email: data.email },
      });
    } else {
      setErrorMsg(res.payload?.message || "Server error");
    }

  }

  const handleGoogleSuccess = async (credential) => {
    const res = await dispatch(googleAuth(credential));
    if (res.payload?.accessToken) {
      navigate("/");
    }
  };



  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
        bg-[var(--color-card)]
        border border-[var(--color-border)]
        p-8 rounded-2xl shadow-2xl
        flex flex-col gap-5
      "
        >
          {/* Header */}
          <div className="text-center mb-2">
            <h2 className="text-3xl font-bold text-[var(--color-text)]">
              Create Account
            </h2>

            <p className="text-[var(--color-muted)] mt-2">
              Join us and start managing today
            </p>
          </div>

          {/* Name Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[var(--color-muted)] text-sm ml-1">
              Full Name
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--color-muted)] text-xl">
                <MdPersonOutline />
              </span>

              <input
                className="
              w-full
              bg-[var(--color-bg)]
              border border-[var(--color-border)]
              text-[var(--color-text)]
              p-3 pl-10 rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-[var(--color-accent)]/40
              focus:border-[var(--color-accent)]
              transition-all
              placeholder:text-[var(--color-muted)]
            "
                type="text"
                placeholder="Aser Dev"
                {...register("name", { required: true })}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[var(--color-muted)] text-sm ml-1">
              Email Address
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--color-muted)] text-xl">
                <MdEmail />
              </span>

              <input
                className="
              w-full
              bg-[var(--color-bg)]
              border border-[var(--color-border)]
              text-[var(--color-text)]
              p-3 pl-10 rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-[var(--color-accent)]/40
              focus:border-[var(--color-accent)]
              transition-all
              placeholder:text-[var(--color-muted)]
              
            "
                type="email"
                placeholder="name@company.com"
                {...register("email", { required: true })}
              />
            </div>
          </div>
          {/* Password Input */}
          <div className="flex flex-col gap-2">
            <label className="text-[var(--color-muted)] text-sm ml-1">
              Password
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--color-muted)] text-xl">
                <MdLockOutline />
              </span>

              <input
                className="
              w-full
              bg-[var(--color-bg)]
              border border-[var(--color-border)]
              text-[var(--color-text)]
              p-3 pl-10 rounded-xl
              focus:outline-none
              focus:ring-2 focus:ring-[var(--color-accent)]/40
              focus:border-[var(--color-accent)]
              transition-all
              placeholder:text-[var(--color-muted)]
            "
                type="password"
                placeholder="••••••••"
                {...register("password", { required: true })}
              />
            </div>

          </div>

          {/* Error Message */}
          {errorMsg && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="
            text-[var(--color-accent)]
            text-sm font-medium
            bg-[var(--color-accent)]/10
            p-3 rounded-lg
            border border-[var(--color-border)]
          "
            >
              {errorMsg}
            </motion.p>
          )}

          {/* Link */}
          <div className="flex justify-between items-center px-1">
            <Link
              to="/login"
              className="text-[var(--color-accent)] hover:opacity-80 text-sm font-medium transition"
            >
              Already have an account?
            </Link>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loadingRegister}
            className={`
          bg-[var(--color-accent)]
          text-white rounded-xl py-3 font-bold text-lg
          hover:opacity-90 active:scale-95
          transition-all duration-200
          shadow-lg
          ${loadingRegister ? "opacity-50 cursor-not-allowed" : ""}
        `}
          >
            {loadingRegister ? "Creating account..." : "Register"}
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-xs text-[var(--color-muted)]">OR</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={(msg) => showToast({ type: "error", message: msg })}
          />
        </form>
      </motion.div>
    </div>
  );
}