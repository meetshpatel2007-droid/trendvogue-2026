"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/server/schemas/auth.schema";
import { useAuthStore } from "@/store/auth.store";

export default function RegisterPage() {
  const router   = useRouter();
  const fetchMe  = useAuthStore((s) => s.fetchMe);
  const [showPw, setShowPw]     = useState(false);
  const [showCPw, setShowCPw]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Registration failed"); return; }
      await fetchMe();
      toast.success("Account created! Welcome to Trend Vogue 🎉");
      router.push("/");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    id, label, type = "text", placeholder, icon: Icon, error, registration,
    rightElement,
  }: {
    id: string; label: string; type?: string; placeholder: string;
    icon: React.ElementType; error?: string;
    registration: ReturnType<typeof register>;
    rightElement?: React.ReactNode;
  }) => (
    <div className="form-group">
      <label htmlFor={id} className="form-label">{label}</label>
      <div style={{ position: "relative" }}>
        <Icon size={16} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }} />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          style={{ paddingLeft: "2.5rem", paddingRight: rightElement ? "3rem" : "1rem" }}
          {...registration}
        />
        {rightElement && (
          <div style={{ position: "absolute", right: "0.875rem", top: "50%", transform: "translateY(-50%)" }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && <span className="form-error">{error}</span>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card"
      style={{ padding: "2rem" }}
    >
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.25rem" }}>
        Create account
      </h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: "1.75rem" }}>
        Join Trend Vogue and discover premium fashion
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <Field id="reg-name" label="Full Name" placeholder="Rahul Sharma"
            icon={User} error={errors.name?.message} registration={register("name")} />

          <Field id="reg-email" label="Email address" type="email" placeholder="you@example.com"
            icon={Mail} error={errors.email?.message} registration={register("email")} />

          <Field id="reg-phone" label="Mobile Number (optional)" placeholder="9876543210"
            icon={Phone} error={errors.phone?.message} registration={register("phone")} />

          <Field
            id="reg-password"
            label="Password"
            type={showPw ? "text" : "password"}
            placeholder="Min 8 chars, 1 uppercase, 1 number"
            icon={Lock}
            error={errors.password?.message}
            registration={register("password")}
            rightElement={
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <Field
            id="reg-confirm"
            label="Confirm Password"
            type={showCPw ? "text" : "password"}
            placeholder="Repeat your password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            registration={register("confirmPassword")}
            rightElement={
              <button type="button" onClick={() => setShowCPw(!showCPw)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-faint)" }}
                aria-label={showCPw ? "Hide password" : "Show password"}>
                {showCPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <button
            id="register-submit-btn"
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center", marginTop: "0.25rem" }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Creating account...</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </div>
      </form>

      <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "var(--accent)", fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
