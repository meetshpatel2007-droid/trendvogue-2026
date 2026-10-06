"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, Lock, MapPin, Plus, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { addressSchema, type AddressInput } from "@/server/schemas/address.schema";
import { toast } from "sonner";

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(6, "Current password required"),
  newPassword: z.string().min(8, "Min 8 chars with 1 uppercase & 1 number"),
});

export default function ProfilePage() {
  const { user, fetchMe } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);

  const {
    register: regProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm({ resolver: zodResolver(profileFormSchema) });

  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    reset: resetPwForm,
    formState: { errors: pwErrors },
  } = useForm({ resolver: zodResolver(passwordChangeSchema) });

  const {
    register: regAddr,
    handleSubmit: handleAddrSubmit,
    reset: resetAddrForm,
    formState: { errors: addrErrors },
  } = useForm<AddressInput>({ resolver: zodResolver(addressSchema) });

  const loadData = async () => {
    try {
      const [resUser, resAddr] = await Promise.all([
        fetch("/api/users/me", { credentials: "include" }),
        fetch("/api/users/me/addresses", { credentials: "include" }),
      ]);
      const jsonUser = await resUser.json();
      const jsonAddr = await resAddr.json();

      if (jsonUser.data?.user) {
        setProfile(jsonUser.data.user);
        setProfileValue("name", jsonUser.data.user.name);
        setProfileValue("phone", jsonUser.data.user.phone ?? "");
      }
      if (jsonAddr.data?.addresses) {
        setAddresses(jsonAddr.data.addresses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onUpdateProfile = async (data: any) => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Profile details updated");
        fetchMe();
      } else {
        toast.error(json.error ?? "Failed to update");
      }
    } catch {
      toast.error("Error updating profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data: any) => {
    setChangingPw(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        toast.success("Password changed successfully");
        resetPwForm();
      } else {
        toast.error(json.error ?? "Password change failed");
      }
    } catch {
      toast.error("Error updating password");
    } finally {
      setChangingPw(false);
    }
  };

  const onAddAddress = async (data: AddressInput) => {
    try {
      const res = await fetch("/api/users/me/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast.success("New address saved");
        resetAddrForm();
        setAddingAddress(false);
        loadData();
      } else {
        const json = await res.json();
        toast.error(json.error ?? "Failed to add address");
      }
    } catch {
      toast.error("Error saving address");
    }
  };

  const onDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/users/me/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        toast.success("Address removed");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      toast.error("Failed to delete address");
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: "3rem", maxWidth: "800px" }}>
        <div style={{ height: "400px", borderRadius: "var(--radius-lg)" }} className="skeleton" />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: "840px" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "0.25rem" }}>
        Account Settings
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.875rem" }}>
        Manage your profile, saved addresses, and security
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* Personal Details */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <User size={20} color="var(--accent)" /> Personal Information
          </h2>

          <form onSubmit={handleProfileSubmit(onUpdateProfile)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input {...regProfile("name")} />
                {profileErrors.name && <span className="form-error">{profileErrors.name.message as string}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input {...regProfile("phone")} placeholder="10-digit mobile" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.25rem" }}>
              <label className="form-label">Email Address (Read-Only)</label>
              <input type="email" value={profile?.email ?? ""} disabled style={{ opacity: 0.7 }} />
            </div>

            <button type="submit" disabled={savingProfile} className="btn btn-primary">
              {savingProfile ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Saved Addresses */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={20} color="var(--accent)" /> Saved Addresses
            </h2>
            {!addingAddress && (
              <button onClick={() => setAddingAddress(true)} className="btn btn-secondary btn-sm" style={{ gap: "0.35rem" }}>
                <Plus size={14} /> Add Address
              </button>
            )}
          </div>

          {addingAddress && (
            <form onSubmit={handleAddrSubmit(onAddAddress)} style={{ padding: "1.25rem", background: "var(--surface-2)", borderRadius: "var(--radius-md)", marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>New Address</h3>
              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="form-label">Phone Number *</label>
                <input {...regAddr("phone")} placeholder="10-digit phone" />
              </div>
              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="form-label">Address Line 1 *</label>
                <input {...regAddr("line1")} placeholder="House, Street, Building" />
              </div>
              <div className="form-group" style={{ marginBottom: "0.75rem" }}>
                <label className="form-label">Address Line 2 (Optional)</label>
                <input {...regAddr("line2")} placeholder="Landmark, Area" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input {...regAddr("city")} placeholder="City" />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input {...regAddr("state")} placeholder="State" />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input {...regAddr("pincode")} placeholder="6 digits" maxLength={6} />
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setAddingAddress(false)} className="btn btn-ghost btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Address
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No delivery addresses saved yet.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
              {addresses.map((a) => (
                <div key={a.id} style={{ padding: "1rem", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", position: "relative" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.35rem" }}>{a.isDefault ? "Default Address" : "Address"}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {a.line1}<br />
                    {a.line2 && <>{a.line2}<br /></>}
                    {a.city}, {a.state} – {a.pincode}<br />
                    📞 {a.phone}
                  </div>
                  <button
                    onClick={() => onDeleteAddress(a.id)}
                    style={{ position: "absolute", top: "0.75rem", right: "0.75rem", background: "none", border: "none", color: "var(--error)", cursor: "pointer", opacity: 0.7 }}
                    title="Delete address"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: "1.75rem" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Lock size={20} color="var(--accent)" /> Security & Password
          </h2>

          <form onSubmit={handlePwSubmit(onChangePassword)}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" {...regPw("currentPassword")} placeholder="••••••••" />
                {pwErrors.currentPassword && <span className="form-error">{pwErrors.currentPassword.message as string}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" {...regPw("newPassword")} placeholder="••••••••" />
                {pwErrors.newPassword && <span className="form-error">{pwErrors.newPassword.message as string}</span>}
              </div>
            </div>

            <button type="submit" disabled={changingPw} className="btn btn-secondary">
              {changingPw ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
