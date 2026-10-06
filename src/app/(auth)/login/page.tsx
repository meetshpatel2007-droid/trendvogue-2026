"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { useState, Suspense } from "react";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/server/schemas/auth.schema";
import { useAuthStore } from "@/store/auth.store";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get("redirect") ?? "/";
  const fetchMe      = useAuthStore((s) => s.fetchMe);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Login failed");
        return;
      }

      await fetchMe();
      toast.success(`Welcome back, ${json.data.user.name}! 👋`);
      router.push(json.data.user.role === "ADMIN" ? "/admin" : redirect);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ padding: "2rem" }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Welcome back
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Sign in to continue shopping
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email address</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                style={{ paddingLeft: "2.5rem" }}
                autoComplete="email"
                {...register("email")}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label htmlFor="login-password" className="form-label">Password</label>
              <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)", padding: "0.25rem" }}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Signing in...</>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Create one
        </Link>
      </div>

      {/* Demo credentials */}
      <div style={{
        marginTop: "1.5rem",
        padding: "0.875rem",
        background: "var(--accent-subtle)",
        border: "1px solid rgba(33,98,161,0.2)",
        borderRadius: "var(--radius-md)",
        fontSize: "0.75rem",
        color: "var(--text-muted)",
      }}>
        <strong style={{ color: "var(--accent)" }}>Seeded Accounts (or Register Any Email)</strong>
        <br />
        🔑 <strong>Admin:</strong> Meet2026@gmail.com / Meet@@2026 <em>(Redirects to /admin)</em>
        <br />
        👤 <strong>Customer:</strong> user@trendvogue.com / User@12345 <em>(Redirects to /)</em>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
