import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bell, ShieldQuestion, HeadphonesIcon, LogOut, ChevronRight, Star, Check, Trash2, Plus, X, UserRound, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api/client.js";

export default function Profile() {
  const { actor, role, ready, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const completed = bookings.filter(b => b.status === "completed").length;

  useEffect(() => {
    if (role !== "user") return;
    api.get("/bookings/my").then(({ bookings }) => setBookings(bookings)).catch(() => {});
  }, [role]);

  const [showSupport, setShowSupport] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const MENU = [
    { label: "Saved Addresses", desc: "Manage your service addresses", Icon: MapPin, onClick: () => setShowAddresses(true) },
    { label: "Notification Settings", desc: "Job alerts & offers", Icon: Bell, onClick: () => setShowNotifications(true) },
    { label: "Help & Support", desc: "Get help with a booking", Icon: HeadphonesIcon, onClick: () => setShowSupport(true) },
    { label: "Terms & Privacy", desc: "Read our policies", Icon: ShieldQuestion, onClick: () => navigate("/terms") },
  ];

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (role !== "user") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)]/10 flex items-center justify-center mb-4">
          <UserRound size={24} className="text-[var(--color-gold-deep)]" />
        </div>
        <h2 className="font-display font-bold text-[20px]">You're browsing as a guest</h2>
        <p className="text-black/40 text-[13.5px] mt-2 leading-relaxed max-w-xs">
          Log in or create an account to save your profile, addresses, and booking history.
        </p>
        <button onClick={() => navigate("/login/user")}
          className="mt-6 flex items-center gap-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-7 py-3.5 text-[14px] active:scale-95 transition-transform">
          <LogIn size={16} /> Log in
        </button>
        <button onClick={() => navigate("/signup/user")} className="mt-3 text-[13px] text-[var(--color-gold-deep)] font-semibold">
          New here? Create an account
        </button>

        <button onClick={() => setShowSupport(true)}
          className="mt-8 flex items-center gap-2 text-black/40 text-[12.5px] font-medium">
          <HeadphonesIcon size={14} /> Help &amp; Support
        </button>

        {showSupport && <SupportSheet onClose={() => setShowSupport(false)} />}
      </div>
    );
  }

  const memberSince = actor?.createdAt
    ? new Date(actor.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="px-5 pt-6 pb-24 page-enter">
      {/* Avatar card */}
      <div className="relative bg-[var(--color-ink)] rounded-3xl p-5 overflow-hidden">
        <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-[var(--color-gold)]/10" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-gold)] flex items-center justify-center font-display font-bold text-[var(--color-ink)] text-2xl shrink-0">
            {(actor?.name || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-white font-display font-bold text-[17px]">{actor?.name || "Guest User"}</p>
            <p className="text-white/45 text-[12.5px] mt-0.5">{actor?.email}</p>
            <div className="flex items-center gap-1 mt-1">
              <Star size={10} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />
              <span className="text-[var(--color-gold)] text-[11px] font-semibold">Verified User</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 mt-5 pt-4 border-t border-white/10">
          <Stat label="Bookings" value={bookings.length} />
          <div className="w-px bg-white/10" />
          <Stat label="Completed" value={completed} />
          <div className="w-px bg-white/10" />
          <Stat label="Member since" value={memberSince} />
        </div>
      </div>

      {/* Menu */}
      <div className="flex flex-col gap-2.5 mt-6">
        {MENU.map(({ label, desc, Icon, onClick }) => (
          <button key={label} onClick={onClick}
            className="flex items-center gap-3.5 bg-white border border-black/8 rounded-2xl px-4 py-3.5 text-left active:bg-black/2 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-gold)]/12 flex items-center justify-center text-[var(--color-gold-deep)] shrink-0">
              <Icon size={16} />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-medium">{label}</p>
              <p className="text-[11.5px] text-black/38">{desc}</p>
            </div>
            <ChevronRight size={15} className="text-black/20" />
          </button>
        ))}
      </div>

      <button onClick={() => { logout(); navigate("/"); }}
        className="w-full flex items-center justify-center gap-2 mt-5 border border-[var(--color-danger)]/25 text-[var(--color-danger)] font-semibold rounded-2xl py-3.5 text-[14px] active:bg-red-50 transition-colors">
        <LogOut size={16} /> Log out
      </button>

      {showSupport && <SupportSheet onClose={() => setShowSupport(false)} />}
      {showAddresses && <AddressesSheet onClose={() => setShowAddresses(false)} />}
      {showNotifications && <NotificationSheet onClose={() => setShowNotifications(false)} />}
    </div>
  );
}

function SupportSheet({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom text-left" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Help & Support</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">We're here to help — reach us anytime.</p>
        <div className="flex flex-col gap-3">
          <a href="tel:+919992094134" className="flex items-center gap-3 bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/25 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)] flex items-center justify-center shrink-0">
              <HeadphonesIcon size={18} className="text-[var(--color-ink)]" />
            </div>
            <div>
              <p className="font-semibold text-[14px]">Call us</p>
              <p className="text-[12px] text-black/45">+91 99920 94134 · Mon–Sat, 9am–8pm</p>
            </div>
          </a>
          <a href="https://wa.me/919992094134" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-4">
            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shrink-0 text-white font-bold">W</div>
            <div>
              <p className="font-semibold text-[14px]">WhatsApp</p>
              <p className="text-[12px] text-black/45">Quick response on WhatsApp</p>
            </div>
          </a>
        </div>
        <button onClick={onClose} className="mt-5 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Close</button>
      </div>
    </div>
  );
}

function AddressesSheet({ onClose }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", address: "", pincode: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => {
    api.get("/user/addresses")
      .then(({ addresses }) => setAddresses(addresses))
      .catch((err) => setError(err.message || "Could not load addresses."))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async () => {
    if (!form.label.trim() || !form.address.trim()) {
      setError("Please enter a label and address.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const { addresses: updated } = await api.post("/user/addresses", form);
      setAddresses(updated);
      setForm({ label: "", address: "", pincode: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Could not save this address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    setDeletingId(addressId);
    try {
      const { addresses: updated } = await api.del(`/user/addresses/${addressId}`);
      setAddresses(updated);
    } catch (err) {
      setError(err.message || "Could not remove this address.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const { addresses: updated } = await api.patch(`/user/addresses/${addressId}`, { isDefault: true });
      setAddresses(updated);
    } catch (err) {
      setError(err.message || "Could not update this address.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Saved Addresses</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">Your service locations</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {addresses.length === 0 && !showForm && (
              <p className="text-center text-[13px] text-black/35 py-4">No saved addresses yet.</p>
            )}
            {addresses.map((addr) => (
              <div key={addr._id} className="flex items-center gap-3 bg-[var(--color-paper-dim)] border border-black/8 rounded-xl px-4 py-3.5">
                <MapPin size={16} className="text-[var(--color-gold-deep)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold">{addr.label}{addr.isDefault && <span className="ml-2 text-[10px] font-medium text-[var(--color-ok)]">Default</span>}</p>
                  <p className="text-[12px] text-black/50 truncate">{addr.address}{addr.pincode ? `, ${addr.pincode}` : ""}</p>
                </div>
                {!addr.isDefault && (
                  <button onClick={() => handleSetDefault(addr._id)} className="text-[10.5px] text-[var(--color-gold-deep)] font-semibold shrink-0">
                    Set default
                  </button>
                )}
                <button onClick={() => handleDelete(addr._id)} disabled={deletingId === addr._id}
                  className="text-black/30 shrink-0 disabled:opacity-40">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {showForm ? (
              <div className="border border-black/10 rounded-xl p-3.5 flex flex-col gap-2.5">
                <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                  placeholder="Label (e.g. Home, Office)"
                  className="rounded-lg border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-gold)]" />
                <textarea value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Full address" rows={2}
                  className="rounded-lg border border-black/10 px-3 py-2.5 text-[13px] outline-none resize-none focus:border-[var(--color-gold)]" />
                <input value={form.pincode} onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  placeholder="Pincode" inputMode="numeric"
                  className="rounded-lg border border-black/10 px-3 py-2.5 text-[13px] outline-none focus:border-[var(--color-gold)]" />
                <div className="flex gap-2 mt-1">
                  <button onClick={() => { setShowForm(false); setError(""); }} className="flex-1 border border-black/10 rounded-lg py-2.5 text-[12.5px] font-medium text-black/55">Cancel</button>
                  <button onClick={handleAdd} disabled={saving} className="flex-1 bg-[var(--color-ink)] text-white rounded-lg py-2.5 text-[12.5px] font-semibold disabled:opacity-60">
                    {saving ? "Saving…" : "Save address"}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowForm(true)}
                className="flex items-center justify-center gap-2 border-2 border-dashed border-black/10 rounded-xl py-3.5 text-[13px] font-semibold text-black/35">
                <Plus size={14} /> Add new address
              </button>
            )}

            {error && (
              <div className="flex items-center gap-2 text-[var(--color-danger)] text-[12.5px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                <AlertCircle size={13} className="shrink-0" /> {error}
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="mt-5 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Done</button>
      </div>
    </div>
  );
}

function NotificationSheet({ onClose }) {
  const [prefs, setPrefs] = useState({ bookingUpdates: true, offers: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/user/notification-prefs")
      .then(({ notificationPrefs }) => setPrefs(notificationPrefs || { bookingUpdates: true, offers: true }))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSaving(true);
    try {
      await api.patch("/user/notification-prefs", updated);
    } catch {
      setPrefs(prefs); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
        <h2 className="font-display font-bold text-[18px]">Notification Settings</h2>
        <p className="text-black/40 text-[13px] mt-1 mb-5">Choose what you'd like to hear about.</p>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="w-6 h-6 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ToggleRow
              label="Booking updates"
              desc="Status changes on your bookings"
              checked={prefs.bookingUpdates}
              onToggle={() => toggle("bookingUpdates")}
              disabled={saving}
            />
            <ToggleRow
              label="Offers & updates"
              desc="Occasional promotions from Servio"
              checked={prefs.offers}
              onToggle={() => toggle("offers")}
              disabled={saving}
            />
          </div>
        )}

        <button onClick={onClose} className="mt-6 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium text-black/55">Done</button>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onToggle, disabled }) {
  return (
    <div className="flex items-center justify-between bg-[var(--color-paper-dim)] border border-black/8 rounded-xl px-4 py-3.5">
      <div>
        <p className="text-[13.5px] font-medium">{label}</p>
        <p className="text-[11.5px] text-black/40">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`w-11 h-6 rounded-full relative transition-colors shrink-0 disabled:opacity-50 overflow-hidden ${checked ? "bg-[var(--color-ok)]" : "bg-black/15"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center flex-1">
      <p className="font-display font-bold text-white text-[18px]">{value}</p>
      <p className="text-white/35 text-[10.5px] mt-0.5">{label}</p>
    </div>
  );
}
