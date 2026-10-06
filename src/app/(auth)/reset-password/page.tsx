"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "@/server/schemas/auth.schema";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Invalid reset link. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setCompleted(true);
        toast.success("Password reset successfully! 🔐");
      } else {
        toast.error(json.error ?? "Failed to reset password");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ padding: "2.5rem", textAlign: "center" }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "999px",
            background: "var(--success-bg)",
            color: "var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.25rem",
          }}
        >
          <CheckCircle2 size={32} />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
          Password Reset Complete
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
          Your security credentials have been updated. You can now log into your account.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
          Proceed to Login <ArrowRight size={16} />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ padding: "2rem" }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Set new password
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Please enter a strong password for your Trend Vogue account
      </p>

      {!token && (
        <div
          style={{
            background: "var(--error-bg)",
            color: "var(--error)",
            padding: "0.75rem",
            borderRadius: "var(--radius-md)",
            fontSize: "0.8rem",
            marginBottom: "1.25rem",
          }}
        >
          ⚠️ Missing reset token. Please use the link provided in your email or console.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("token")} value={token} />

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-faint)",
                }}
              />
              <input
                type={showPw ? "text" : "password"}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-faint)",
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: "relative" }}>
              <Lock
                size={16}
                style={{
                  position: "absolute",
                  left: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-faint)",
                }}
              />
              <input
                type={showCPw ? "text" : "password"}
                placeholder="Repeat new password"
                style={{ paddingLeft: "2.5rem", paddingRight: "3rem" }}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowCPw(!showCPw)}
                style={{
                  position: "absolute",
                  right: "0.875rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--text-faint)",
                }}
              >
                {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="form-error">{errors.confirmPassword.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.5rem" }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
