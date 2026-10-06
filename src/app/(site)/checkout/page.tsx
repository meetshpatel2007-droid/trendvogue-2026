"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, ArrowLeft, Loader2, ShieldCheck, MapPin } from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { formatCurrency } from "@/lib/utils";
import { calculateDeliveryEstimate } from "@/server/lib/delivery-estimate";
import { toast } from "sonner";

const addressFormSchema = z.object({
  name:    z.string().min(2),
  phone:   z.string().min(10).max(10),
  line1:   z.string().min(5),
  line2:   z.string().optional(),
  city:    z.string().min(2),
  state:   z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

type AddressForm = z.infer<typeof addressFormSchema>;

const PAYMENT_METHODS = [
  { id: "COD",    label: "Cash on Delivery",   desc: "Pay when you receive",      icon: "💵" },
  { id: "ONLINE", label: "Online Payment",      desc: "Credit/Debit/UPI (mocked)", icon: "💳" },
];

export default function CheckoutPage() {
  const router  = useRouter();
  const user    = useAuthStore((s) => s.user);
  const { items, getSubtotal, clearCart } = useCartStore();
  const [step, setStep]                   = useState<1 | 2 | 3>(1);
  const [paymentMethod, setPayment]       = useState("COD");
  const [savedAddresses, setSaved]        = useState<any[]>([]);
  const [selectedAddrId, setSelectedAddr] = useState<string | null>(null);
  const [delivery, setDelivery]           = useState<any>(null);
  const [placing, setPlacing]             = useState(false);
  const [placedOrder, setPlacedOrder]     = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressFormSchema) });

  const pincode = watch("pincode");

  useEffect(() => {
    if (pincode?.length === 6) {
      const est = calculateDeliveryEstimate(pincode);
      setDelivery(est);
    } else {
      setDelivery(null);
    }
  }, [pincode]);

  useEffect(() => {
    if (user) {
      fetch("/api/users/me/addresses", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => {
          const addrs = d.data?.addresses ?? [];
          setSaved(addrs);
          if (addrs.length > 0) {
            const def = addrs.find((a: any) => a.isDefault) ?? addrs[0];
            setSelectedAddr(def.id);
          }
        });
    }
  }, [user]);

  const subtotal = getSubtotal();
  const isFreeShipping = subtotal >= 999;

  if (!user) {
    return (
      <div className="container empty-state" style={{ paddingTop: "4rem" }}>
        <p style={{ fontWeight: 600 }}>Please login to checkout</p>
        <Link href="/login?redirect=/checkout" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="container empty-state" style={{ paddingTop: "4rem" }}>
        <p style={{ fontWeight: 600 }}>Your cart is empty</p>
        <Link href="/shop" className="btn btn-primary">Shop Now</Link>
      </div>
    );
  }

  // ── Step 3: Order Confirmation ──────────────────────────────────────
  if (placedOrder) {
    return (
      <div className="container" style={{ paddingTop: "3rem", paddingBottom: "4rem", maxWidth: "560px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ padding: "2.5rem", textAlign: "center" }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.1 }}
            style={{
              width: "80px", height: "80px",
              borderRadius: "999px",
              background: "var(--gradient-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
            }}
          >
            <Check size={36} color="white" />
          </motion.div>

          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "0.5rem" }}>
            Order Placed! 🎉
          </h1>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
            Your order has been confirmed. We'll notify you once it's shipped.
          </p>

          {placedOrder.delivery && (
            <div style={{
              background: "var(--accent-subtle)",
              border: "1px solid rgba(33,98,161,0.2)",
              borderRadius: "var(--radius-lg)",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "0.25rem" }}>
                Expected Delivery
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem" }}>
                {placedOrder.delivery.label}
              </div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                {placedOrder.delivery.tier === "metro" ? "⚡ Express" : "🚚 Standard"} · {placedOrder.delivery.minDays}–{placedOrder.delivery.maxDays} days
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <Link href={`/orders/${placedOrder.order.id}`} className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Track Order
            </Link>
            <Link href="/shop" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const onSubmitAddress = async (data: AddressForm) => {
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const body: Record<string, unknown> = { paymentMethod };

      if (selectedAddrId) {
        body.addressId = selectedAddrId;
      } else {
        // Will use form values
        const formVals = (document.querySelector("form") as HTMLFormElement | null);
        const formData: Record<string, string> = {};
        if (formVals) {
          for (const el of Array.from(formVals.elements) as HTMLInputElement[]) {
            if (el.name) formData[el.name] = el.value;
          }
        }
        body.newAddress = formData;
      }

      const res = await fetch("/api/orders", {
        method:      "POST",
        headers:     { "Content-Type": "application/json" },
        credentials: "include",
        body:        JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) { toast.error(json.error ?? "Failed to place order"); return; }

      clearCart();
      setPlacedOrder(json.data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      {/* Steps indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", justifyContent: "center" }}>
        {[
          { n: 1, label: "Address" },
          { n: 2, label: "Payment" },
          { n: 3, label: "Confirm" },
        ].map(({ n, label }) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{
              width: "28px", height: "28px",
              borderRadius: "999px",
              background: step >= n ? "var(--accent)" : "var(--surface-2)",
              border: `2px solid ${step >= n ? "var(--accent)" : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: step >= n ? "white" : "var(--text-faint)",
              transition: "all 0.3s",
            }}>
              {step > n ? <Check size={14} /> : n}
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: step === n ? 700 : 400, color: step === n ? "var(--text-primary)" : "var(--text-muted)" }}>
              {label}
            </span>
            {n < 3 && <div style={{ width: "32px", height: "1.5px", background: step > n ? "var(--accent)" : "var(--border)", transition: "background 0.3s" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "2rem", alignItems: "start" }}>
        <div>
          {/* STEP 1: Address */}
          {step === 1 && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={20} color="var(--accent)" /> Delivery Address
              </h2>

              {/* Saved addresses */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>SAVED ADDRESSES</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {savedAddresses.map((addr) => (
                      <label key={addr.id} style={{ display: "flex", gap: "0.75rem", padding: "0.875rem", border: `2px solid ${selectedAddrId === addr.id ? "var(--accent)" : "var(--border)"}`, borderRadius: "var(--radius-lg)", cursor: "pointer", transition: "border-color 0.2s" }}>
                        <input type="radio" name="savedAddr" value={addr.id} checked={selectedAddrId === addr.id} onChange={() => setSelectedAddr(addr.id)} style={{ marginTop: "3px" }} />
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.7 }}>
                          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{addr.name}</div>
                          {addr.line1}, {addr.city}, {addr.state} – {addr.pincode}
                          <br />📞 {addr.phone}
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => setSelectedAddr(null)}
                    className="btn btn-ghost btn-sm"
                    style={{ marginTop: "0.75rem" }}
                  >
                    + Add New Address
                  </button>
                </div>
              )}

              {/* New address form */}
              {!selectedAddrId && (
                <form id="address-form" onSubmit={handleSubmit(onSubmitAddress)}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Full Name *</label>
                      <input {...register("name")} placeholder="Rahul Sharma" />
                      {errors.name && <span className="form-error">{errors.name.message}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Phone *</label>
                      <input {...register("phone")} placeholder="10-digit mobile number" />
                      {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Address Line 1 *</label>
                      <input {...register("line1")} placeholder="House No., Building, Street" />
                      {errors.line1 && <span className="form-error">{errors.line1.message}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Address Line 2</label>
                      <input {...register("line2")} placeholder="Area, Landmark (optional)" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">City *</label>
                      <input {...register("city")} placeholder="Mumbai" />
                      {errors.city && <span className="form-error">{errors.city.message}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">State *</label>
                      <input {...register("state")} placeholder="Maharashtra" />
                      {errors.state && <span className="form-error">{errors.state.message}</span>}
                    </div>
                    <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <label className="form-label">Pincode *</label>
                      <input {...register("pincode")} placeholder="6-digit pincode" maxLength={6} />
                      {errors.pincode && <span className="form-error">{errors.pincode.message}</span>}
                      {delivery && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--success)", fontWeight: 600 }}>
                          ✓ {delivery.label} ({delivery.tier === "metro" ? "Express" : "Standard"} delivery)
                        </div>
                      )}
                    </div>
                  </div>
                </form>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem" }}>
                <button
                  form={selectedAddrId ? undefined : "address-form"}
                  type={selectedAddrId ? "button" : "submit"}
                  onClick={selectedAddrId ? () => setStep(2) : undefined}
                  className="btn btn-primary btn-lg"
                >
                  Continue to Payment →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment */}
          {step === 2 && (
            <div className="card" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={20} color="var(--accent)" /> Payment Method
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {PAYMENT_METHODS.map((pm) => (
                  <label key={pm.id} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.875rem",
                    padding: "1rem",
                    border: `2px solid ${paymentMethod === pm.id ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: "var(--radius-lg)",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                    background: paymentMethod === pm.id ? "var(--accent-subtle)" : "transparent",
                  }}>
                    <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPayment(pm.id)} />
                    <div style={{ fontSize: "1.5rem" }}>{pm.icon}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{pm.label}</div>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                <button onClick={() => setStep(1)} className="btn btn-ghost">
                  <ArrowLeft size={16} /> Back
                </button>
                <button onClick={handlePlaceOrder} disabled={placing} className="btn btn-primary btn-lg">
                  {placing ? (
                    <><Loader2 size={18} className="animate-spin" /> Placing Order...</>
                  ) : (
                    <><ShieldCheck size={18} /> Place Order ({formatCurrency(subtotal)})</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary (sidebar) */}
        <div style={{ width: "340px", position: "sticky", top: "80px" }}>
          <div className="card" style={{ padding: "1.25rem" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "1rem", fontFamily: "var(--font-display)" }}>Order Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "280px", overflowY: "auto", marginBottom: "1rem" }}>
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} style={{ display: "flex", gap: "0.625rem" }}>
                  <div style={{ width: "48px", height: "60px", borderRadius: "var(--radius-sm)", overflow: "hidden", position: "relative", flexShrink: 0, background: "var(--surface-2)" }}>
                    {item.image && <Image src={item.image} alt={item.name} fill sizes="48px" style={{ objectFit: "cover" }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Size: {item.size} · Qty: {item.quantity}</div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem" }}>
                <span style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>Delivery</span>
                <span style={{ color: "var(--success)", fontWeight: 600 }}>
                  {isFreeShipping ? "Free" : "₹99"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                <span style={{ fontWeight: 800, fontFamily: "var(--font-display)" }}>Total</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem" }}>
                  {formatCurrency(subtotal + (isFreeShipping ? 0 : 99))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
