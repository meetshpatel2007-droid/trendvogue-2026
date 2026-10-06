"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/server/schemas/auth.schema";

export default function ForgotPasswordPage() {
  const [sent, setSent]       = useState(false);
  const [devUrl, setDevUrl]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues } =
    useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      setSent(true);
      if (json.data?.devResetUrl) setDevUrl(json.data.devResetUrl);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="card" style={{ padding: "2rem", textAlign: "center" }}>
        <div style={{
          width: "64px", height: "64px",
          borderRadius: "999px",
          background: "var(--success-bg)",
          border: "2px solid var(--success)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.25rem",
        }}>
          <CheckCircle2 size={28} color="var(--success)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Check your email</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          We sent a password reset link to <strong>{getValues("email")}</strong>
        </p>
        {devUrl && (
          <div style={{
            background: "var(--warning-bg)",
            border: "1px solid var(--amber)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem",
            fontSize: "0.75rem",
            marginBottom: "1.25rem",
            textAlign: "left",
            wordBreak: "break-all",
          }}>
            <strong>🛠️ Dev mode — Reset Link:</strong><br />
            <Link href={devUrl} style={{ color: "var(--accent)", fontSize: "0.7rem" }}>{devUrl}</Link>
          </div>
        )}
        <Link href="/login" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          Back to Login
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: "2rem" }}>
      <Link href="/login" style={{
        display: "inline-flex", alignItems: "center", gap: "0.375rem",
        color: "var(--text-muted)", fontSize: "0.8rem", textDecoration: "none",
        marginBottom: "1.25rem",
      }}>
        <ArrowLeft size={14} /> Back to login
      </Link>

      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Forgot password?
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Enter your email and we'll send you a reset link
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="fp-email" className="form-label">Email address</label>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
            <input id="fp-email" type="email" placeholder="you@example.com"
              style={{ paddingLeft: "2.5rem" }} {...register("email")} />
          </div>
          {errors.email && <span className="form-error">{errors.email.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-lg"
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Reset Link</>}
        </button>
      </form>
    </motion.div>
  );
}
