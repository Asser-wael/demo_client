import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginUser } from "../features/auth/authSlice";
import { motion } from "framer-motion";
import { MdEmail, MdLockOutline } from "react-icons/md";
import { useState } from "react";
import ThemeToggle from "../components/common/ToggleButton";

export default function Login() {
    const navigate = useNavigate();
    const { register, handleSubmit, reset } = useForm();
    const dispatch = useDispatch();
    const { loadingLogin } = useSelector((state) => state.auth);
    const [errorMsg, setErrorMsg] = useState("");


    const onSubmit = async (formData) => {
        const res = await dispatch(loginUser(formData));

        if (res.payload?.accessToken) {
            reset();

            setTimeout(() => {
                navigate("/");
            }, 100);
        } else {
            setErrorMsg(res.payload?.message || "Server error");
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--color-bg)] text-[var(--color-text)]">

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="
            w-full max-w-md
            bg-[var(--color-card)]
            border border-[var(--color-border)]
            p-8 rounded-2xl shadow-2xl
            backdrop-blur-md
            flex flex-col gap-6
          "
                >
                    {/* Header */}
                    <div className="text-center mb-2">
                        <h2 className="text-3xl font-bold text-[var(--color-text)]">
                            Welcome Back
                        </h2>
                        <p className="text-[var(--color-muted)] mt-2">
                            Login to manage your account
                        </p>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm ml-1 text-[var(--color-muted)]">
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

                    {/* Password */}
                    <div className="flex flex-col gap-2">
                        <label className="text-sm ml-1 text-[var(--color-muted)]">
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

                    {/* Links */}
                    <div className="flex justify-between items-center px-1">
                        <Link
                            to="/register"
                            className="text-[var(--color-accent)] hover:opacity-80 text-sm font-medium transition"
                        >
                            Create a new account?
                        </Link>
                    </div>

                    {/* Error Message */}
                    {
                        errorMsg && (
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
                        )
                    }
                    {/* Button */}
                    <div className="flex flex-col justify-center items-center gap-3">
                        <button
                            disabled={loadingLogin}
                            className={`
                w-70 py-3 rounded-lg flex justify-center items-center gap-2
                bg-[var(--color-accent)]
                text-white font-medium
                hover:opacity-90 transition
                ${loadingLogin && "opacity-50"}
              `}
                        >
                            {loadingLogin ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    Loading...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                        <Link
                            to="/"
                            className="text-[var(--color-accent)] hover:opacity-80 text-sm font-medium transition"
                        >
                            Actually, I'm a customer I want to continue shopping.
                        </Link>

                    </div>
                </form>
            </motion.div>
        </div>
    );
}