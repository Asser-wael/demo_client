import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { MdEmail, MdLockOutline } from "react-icons/md";
import { FiArrowLeft, FiLoader, FiShield } from "react-icons/fi";

import {
  loginUser,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyOtp,
  googleAuth,
} from "../features/auth/authSlice";
import ThemeToggle from "../components/common/ToggleButton";
import GoogleSignInButton from "../components/common/GoogleSignInButton";
import { showToast } from "../utils/showToast.jsx";

/* =========================================================
   Field — shared input styling across every view on this page
========================================================= */

function Field({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[var(--color-muted)] text-xl">
        {icon}
      </span>
      <input
        {...props}
        className="
          w-full bg-[var(--color-bg)] border border-[var(--color-border)]
          text-[var(--color-text)] p-3 pl-10 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40
          focus:border-[var(--color-accent)] transition-all
          placeholder:text-[var(--color-muted)]
        "
      />
    </div>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      disabled={loading}
      className={`w-full py-3 rounded-xl flex justify-center items-center gap-2
        bg-[var(--color-accent)] text-white font-medium
        hover:opacity-90 transition disabled:cursor-not-allowed
        ${loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <>
          <FiLoader className="animate-spin" /> Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* =========================================================
   LOGIN
========================================================= */

function LoginView({ onForgotPassword, onNeedsVerification }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();
  const { loading } = useSelector((state) => state.auth);

  const onSubmit = async (formData) => {
    const res = await dispatch(loginUser(formData));

    if (res.payload?.accessToken) {
      reset();
      navigate("/");
      return;
    }

    if (res.payload?.code === "NOT_VERIFIED") {
      onNeedsVerification(res.payload.email || formData.email);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    const res = await dispatch(googleAuth(credential));
    if (res.payload?.accessToken) {
      navigate("/");
    }
  };

  return (
    <>
      <div className="text-center mb-2">
        <h2 className="text-3xl font-bold text-[var(--color-text)]">Welcome Back</h2>
        <p className="text-[var(--color-muted)] mt-2">Login to manage your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm ml-1 text-[var(--color-muted)]">Email Address</label>
          <Field
            icon={<MdEmail />}
            type="email"
            placeholder="name@company.com"
            {...register("email", { required: true })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-sm ml-1 text-[var(--color-muted)]">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-[var(--color-accent)] hover:opacity-80 font-medium"
            >
              Forgot password?
            </button>
          </div>
          <Field
            icon={<MdLockOutline />}
            type="password"
            placeholder="••••••••"
            {...register("password", { required: true })}
          />
        </div>

        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>

      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-muted)]">OR</span>
        <div className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <GoogleSignInButton
        onSuccess={handleGoogleSuccess}
        onError={(msg) => showToast({ type: "error", message: msg })}
      />

      <div className="flex flex-col items-center gap-3 mt-2">
        <Link to="/register" className="text-[var(--color-accent)] hover:opacity-80 text-sm font-medium transition">
          Create a new account?
        </Link>
        <Link to="/" className="text-[var(--color-muted)] hover:opacity-80 text-xs transition">
          Continue shopping as a guest
        </Link>
      </div>
    </>
  );
}

/* =========================================================
   FORGOT PASSWORD — step 1: request a code
========================================================= */

function ForgotPasswordView({ onBack, onCodeSent }) {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    setLoading(true);
    const res = await dispatch(forgotPassword({ email }));
    setLoading(false);

    // Always proceed to the code-entry step — the backend deliberately
    // gives the same response whether or not the email exists, so the UI
    // shouldn't reveal that difference either.
    if (forgotPassword.fulfilled.match(res)) {
      onCodeSent(email);
    }
  };

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-2 w-fit"
      >
        <FiArrowLeft /> Back to login
      </button>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Reset Password</h2>
        <p className="text-[var(--color-muted)] mt-2 text-sm">
          Enter your email and we'll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field
          icon={<MdEmail />}
          type="email"
          placeholder="name@company.com"
          {...register("email", { required: true })}
        />

        <SubmitButton loading={loading}>Send Reset Code</SubmitButton>
      </form>
    </>
  );
}

/* =========================================================
   FORGOT PASSWORD — step 2: enter code + new password
========================================================= */

function ResetPasswordView({ email, onBack, onSuccess }) {
  const dispatch = useDispatch();
  const { register, handleSubmit, watch } = useForm();
  const [loading, setLoading] = useState(false);
  const newPassword = watch("newPassword");

  const onSubmit = async ({ otp, newPassword, confirmPassword }) => {
    if (newPassword !== confirmPassword) {
      showToast({ type: "error", message: "Passwords do not match" });
      return;
    }

    setLoading(true);
    const res = await dispatch(resetPassword({ email, otp, newPassword }));
    setLoading(false);

    if (resetPassword.fulfilled.match(res)) {
      onSuccess();
    }
  };

  const handleResend = () => dispatch(resendOtp({ email }));

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-2 w-fit"
      >
        <FiArrowLeft /> Back
      </button>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Enter Reset Code</h2>
        <p className="text-[var(--color-muted)] mt-2 text-sm">
          We sent a code to <span className="text-[var(--color-text)]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field
          icon={<FiShield />}
          type="text"
          maxLength={6}
          placeholder="6-digit code"
          {...register("otp", { required: true })}
        />
        <Field
          icon={<MdLockOutline />}
          type="password"
          placeholder="New password"
          {...register("newPassword", { required: true, minLength: 6 })}
        />
        <Field
          icon={<MdLockOutline />}
          type="password"
          placeholder="Confirm new password"
          {...register("confirmPassword", { required: true })}
        />

        <SubmitButton loading={loading}>Reset Password</SubmitButton>
      </form>

      <button
        onClick={handleResend}
        className="text-xs text-[var(--color-accent)] hover:opacity-80 font-medium w-fit mx-auto"
      >
        Resend code
      </button>
    </>
  );
}

/* =========================================================
   VERIFY EMAIL — for accounts that registered but never verified
========================================================= */

function VerifyEmailView({ email, onBack }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ otp }) => {
    setLoading(true);
    const res = await dispatch(verifyOtp({ email, otp }));
    setLoading(false);

    if (res.payload?.accessToken) {
      navigate("/");
    }
  };

  const handleResend = () => dispatch(resendOtp({ email }));

  return (
    <>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] mb-2 w-fit"
      >
        <FiArrowLeft /> Back to login
      </button>

      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Verify Your Email</h2>
        <p className="text-[var(--color-muted)] mt-2 text-sm">
          Enter the code we sent to <span className="text-[var(--color-text)]">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <Field
          icon={<FiShield />}
          type="text"
          maxLength={6}
          placeholder="6-digit code"
          {...register("otp", { required: true })}
        />

        <SubmitButton loading={loading}>Verify & Continue</SubmitButton>
      </form>

      <button
        onClick={handleResend}
        className="text-xs text-[var(--color-accent)] hover:opacity-80 font-medium w-fit mx-auto"
      >
        Resend code
      </button>
    </>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Login() {
  const location = useLocation();

  // "login" | "forgot" | "reset" | "verify"
  const [view, setView] = useState(
    location.state?.verifyEmail ? "verify" : "login"
  );
  const [pendingEmail, setPendingEmail] = useState(location.state?.email || "");

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--color-bg)] text-[var(--color-text)] relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div
          className="
            w-full bg-[var(--color-card)] border border-[var(--color-border)]
            p-8 rounded-2xl shadow-2xl backdrop-blur-md
            flex flex-col gap-6
          "
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-6"
            >
              {view === "login" && (
                <LoginView
                  onForgotPassword={() => setView("forgot")}
                  onNeedsVerification={(email) => {
                    setPendingEmail(email);
                    setView("verify");
                  }}
                />
              )}

              {view === "forgot" && (
                <ForgotPasswordView
                  onBack={() => setView("login")}
                  onCodeSent={(email) => {
                    setPendingEmail(email);
                    setView("reset");
                  }}
                />
              )}

              {view === "reset" && (
                <ResetPasswordView
                  email={pendingEmail}
                  onBack={() => setView("forgot")}
                  onSuccess={() => setView("login")}
                />
              )}

              {view === "verify" && (
                <VerifyEmailView email={pendingEmail} onBack={() => setView("login")} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
