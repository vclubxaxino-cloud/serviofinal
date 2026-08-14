import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin, ChevronRight, Info, Zap, Shield, Clock, Calendar, Navigation2, LogIn, UserPlus } from "lucide-react";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { PENDING_BOOKING_KEY } from "../../utils/pendingBooking.js";

const STEP_LABELS = ["Plan", "Details", "Confirm"];

export default function ServiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [service, setService] = useState(null);
  const [loadingService, setLoadingService] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showAuthGate, setShowAuthGate] = useState(false);

  const [step, setStep] = useState(1);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingService(true);
      setLoadError("");
      try {
        const { service: svc } = await api.get(`/services/${id}`);
        setService(svc);
        setSelectedPkg(svc.packages[0]);
        setStep(1);
      } catch (err) {
        setLoadError(err.message || "Could not load this service.");
      } finally {
        setLoadingService(false);
      }
    };
    load();
  }, [id]);

  if (loadingService) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError || !service) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load this service</p>
        <p className="text-black/40 text-[13px] mt-2">{loadError}</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-[var(--color-ink)] text-white font-semibold rounded-xl px-5 py-2.5 text-[13px]">Go back</button>
      </div>
    );
  }

  // ── Step 3: Success ──────────────────────────────────────────────────────────
  if (step === 3 && confirmedBooking) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)] flex flex-col items-center justify-center px-6 text-center page-enter">
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-[var(--color-ok)]/10 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-ok)]/20 flex items-center justify-center">
              <CheckCircle2 size={34} className="text-[var(--color-ok)]" strokeWidth={2} />
            </div>
          </div>
        </div>
        <h1 className="font-display text-[24px] font-bold">Booking requested!</h1>
        <p className="text-black/50 text-[14px] mt-2 leading-relaxed max-w-xs">
          <span className="font-medium text-[var(--color-ink)]">{service.title}</span> — we're
          reviewing your request and will assign a verified partner shortly.
        </p>
        <div className="mt-5 bg-white border border-black/8 rounded-2xl px-5 py-4 w-full max-w-sm text-left">
          <p className="text-[10.5px] text-black/38 font-semibold uppercase tracking-widest mb-3">Booking summary</p>
          <SRow label="Plan" value={`${selectedPkg.label} · ₹${selectedPkg.price.toLocaleString("en-IN")}`} />
          <SRow label="Date" value={date || "Flexible"} />
          <SRow label="Time" value={time || "To be confirmed"} />
          <SRow label="Address" value={address} last />
        </div>
        <div className="mt-4 w-full max-w-sm">
          <p className="text-[11px] text-[var(--color-gold-deep)] font-semibold uppercase tracking-widest mb-3 text-left">What happens next</p>
          {[
            { text: "Admin reviews your request", Icon: Shield },
            { text: "A verified partner is assigned to you", Icon: CheckCircle2 },
            { text: "Partner arrives at your address", Icon: Navigation2 },
            { text: "Pay via UPI QR after service", Icon: Zap },
          ].map(({ text, Icon }, i) => (
            <div key={i} className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center shrink-0">
                <Icon size={13} className="text-[var(--color-gold-deep)]" />
              </div>
              <p className="text-[12.5px] text-black/60">{text}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3 mt-4 w-full max-w-sm">
          <button onClick={() => navigate("/user/bookings")}
            className="w-full bg-[var(--color-ink)] text-white font-semibold rounded-xl py-4 text-[15px] active:scale-[0.98] transition-transform">
            Track my booking
          </button>
          <button onClick={() => navigate("/user")}
            className="w-full border border-black/10 text-black/55 font-medium rounded-xl py-3.5 text-[14px]">
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const saveDraftAndShowAuthGate = () => {
    const draft = {
      serviceId: service._id,
      packageId: selectedPkg.id,
      date, time, address, note,
      serviceTitle: service.title,
      packageLabel: selectedPkg.label,
      packagePrice: selectedPkg.price,
    };
    sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(draft));
    setShowAuthGate(true);
  };

  const goToDetails = () => setStep(2);

  const confirmBooking = async () => {
    const e = {};
    if (!address.trim()) e.address = "Please enter your service address";
    if (!agreedToTerms) e.terms = "Please agree to the Terms & Privacy Policy to continue";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});

    if (role !== "user") {
      saveDraftAndShowAuthGate();
      return;
    }

    setLoading(true);
    try {
      const { booking } = await api.post("/bookings", {
        serviceId: service._id,
        packageId: selectedPkg.id,
        date, time, address, note,
      });
      setConfirmedBooking(booking);
      setStep(3);
    } catch (err) {
      setErrors({ submit: err.message || "Could not create booking. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => step > 1 ? setStep(step - 1) : navigate(-1);

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-36">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-[var(--color-ink)] px-5 pt-12 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack}
            className="w-9 h-9 rounded-full bg-white/12 flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform">
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-[11px] font-medium uppercase tracking-widest">{service.subCategory}</p>
            <p className="text-white font-display font-bold text-[15px] leading-tight truncate">{service.title}</p>
          </div>
        </div>
        {/* Progress */}
        <div className="flex items-center gap-1.5">
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            return (
              <div key={label} className="flex flex-col items-center gap-1 flex-1">
                <div className={`h-1 w-full rounded-full transition-all duration-300 ${step > n ? "bg-[var(--color-gold)]" : step === n ? "bg-[var(--color-gold)]/60" : "bg-white/15"}`} />
                <span className={`text-[9.5px] font-medium ${step === n ? "text-[var(--color-gold)]" : step > n ? "text-white/60" : "text-white/25"}`}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* STEP 1: Package */}
        {step === 1 && selectedPkg && (
          <div className="page-enter">
            <h2 className="font-display font-bold text-[18px] mb-1">Choose your plan</h2>
            <p className="text-black/45 text-[13px] mb-4">{service.description}</p>
            <div className="flex flex-col gap-3">
              {service.packages.map((p, idx) => {
                const isSelected = selectedPkg?.id === p.id;
                const isPopular = idx === 1 && service.packages.length >= 3;
                return (
                  <button key={p.id} onClick={() => setSelectedPkg(p)}
                    className={`rounded-2xl border-2 p-4 text-left transition-all active:scale-[0.98] relative overflow-hidden ${isSelected ? "border-[var(--color-ink)] bg-white shadow-md shadow-black/8" : "border-black/8 bg-white"}`}>
                    {isPopular && <span className="absolute top-3 right-3 text-[9px] font-bold bg-[var(--color-gold)] text-[var(--color-ink)] px-2 py-0.5 rounded-full uppercase tracking-wide">Popular</span>}
                    <div className="flex items-start justify-between pr-14">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? "border-[var(--color-ink)] bg-[var(--color-ink)]" : "border-black/20"}`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <span className="font-bold text-[15px]">{p.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[18px] text-[var(--color-gold-deep)]">{p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}</span>
                        {p.originalPrice && <p className="text-[11px] text-black/30 line-through">₹{p.originalPrice.toLocaleString("en-IN")}</p>}
                      </div>
                    </div>
                    <p className="text-[12.5px] text-black/50 mt-2 ml-7">{p.desc}</p>
                    {p.includes && (
                      <div className="mt-3 ml-7 flex flex-col gap-1.5">
                        {p.includes.map(inc => (
                          <div key={inc} className="flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-[var(--color-ok)] shrink-0" />
                            <span className="text-[12px] text-black/60">{inc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex items-start gap-2.5 bg-[var(--color-gold)]/8 rounded-xl px-4 py-3 border border-[var(--color-gold)]/20">
              <Info size={14} className="text-[var(--color-gold-deep)] mt-0.5 shrink-0" />
              <p className="text-[12px] text-black/60 leading-relaxed">Payment is UPI-only — you'll scan a QR code after the job is done. Partners never accept cash.</p>
            </div>
          </div>
        )}

        {/* STEP 2: Details + Confirm */}
        {step === 2 && (
          <div className="page-enter">
            <h2 className="font-display font-bold text-[18px] mb-4">Your details</h2>

            {/* Plan summary */}
            <div className="bg-[var(--color-ink)] rounded-2xl p-4 mb-4">
              <p className="text-white/40 text-[10.5px] font-semibold uppercase tracking-widest mb-3">Booking Summary</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold)] shrink-0"><Zap size={18} /></div>
                <div>
                  <p className="text-white font-semibold text-[14px]">{service.title}</p>
                  <p className="text-[var(--color-gold)] text-[12px]">{selectedPkg.label} · ₹{selectedPkg.price.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="border-t border-white/10 mt-3 pt-3 flex items-start gap-2">
                <Shield size={13} className="text-white/40 mt-0.5 shrink-0" />
                <p className="text-white/45 text-[11px] leading-relaxed">A verified partner will be assigned to your booking by our admin team after you confirm.</p>
              </div>
            </div>

            {/* Address */}
            <div className="mb-3">
              <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5">Service address <span className="text-[var(--color-danger)]">*</span></label>
              <textarea value={address} onChange={e => { setAddress(e.target.value); setErrors({}); }}
                placeholder="Flat / house no., street, area, city…" rows={2}
                className={`w-full rounded-xl border bg-white px-4 py-3.5 text-[14px] outline-none resize-none transition-colors ${errors.address ? "border-[var(--color-danger)] bg-red-50" : "border-black/10 focus:border-[var(--color-gold)]"}`} />
              {errors.address && <p className="text-[11.5px] text-[var(--color-danger)] mt-1">{errors.address}</p>}
            </div>

            {/* Pincode (helps admin pick a nearby partner) */}
            <div className="mb-3">
              <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5"><MapPin size={11} className="inline mr-1" />Pincode</label>
              <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="490001" maxLength={6} inputMode="numeric"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[14px] outline-none focus:border-[var(--color-gold)] font-mono tracking-wider" />
              <p className="text-[11px] text-black/35 mt-1">Helps us assign a partner near you.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5"><Calendar size={11} className="inline mr-1" />Preferred date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-3.5 text-[13.5px] outline-none focus:border-[var(--color-gold)]" />
              </div>
              <div>
                <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5"><Clock size={11} className="inline mr-1" />Preferred time</label>
                <input type="time" value={time} onChange={e => setTime(e.target.value)}
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-3.5 text-[13.5px] outline-none focus:border-[var(--color-gold)]" />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[12.5px] font-semibold text-black/55 block mb-1.5">Special instructions (optional)</label>
              <input value={note} onChange={e => setNote(e.target.value)} placeholder="Any details for the partner…"
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[14px] outline-none focus:border-[var(--color-gold)]" />
            </div>

            {/* T&C checkbox */}
            <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
              <input type="checkbox" checked={agreedToTerms}
                onChange={e => { setAgreedToTerms(e.target.checked); setErrors({}); }}
                className="mt-0.5 w-4 h-4 accent-[var(--color-ink)] shrink-0" />
              <span className="text-[12.5px] text-black/60 leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Terms &amp; Conditions</Link>
                {" "}and{" "}
                <Link to="/terms" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-[11.5px] text-[var(--color-danger)] -mt-3 mb-3">{errors.terms}</p>}

            {errors.submit && (
              <div className="flex items-center gap-2 text-[var(--color-danger)] text-[13px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">
                <Info size={14} className="shrink-0" />
                {errors.submit}
              </div>
            )}
            <div className="flex items-start gap-2.5 bg-[var(--color-gold)]/8 rounded-xl px-4 py-3 border border-[var(--color-gold)]/20">
              <Info size={14} className="text-[var(--color-gold-deep)] mt-0.5 shrink-0" />
              <p className="text-[12px] text-black/55 leading-relaxed">Pay by scanning the UPI QR after the job is done. Cash is not accepted — a UPI reference is required to complete your booking.</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/97 backdrop-blur-sm border-t border-black/8 px-5 py-4 safe-bottom">
        {step > 1 && selectedPkg && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-6 h-6 rounded-lg bg-[var(--color-gold)]/15 flex items-center justify-center text-[var(--color-gold-deep)] shrink-0"><Zap size={12} /></div>
            <p className="text-[12px] text-black/50 flex-1 truncate">
              {service.title} · <span className="font-semibold text-[var(--color-ink)]">₹{selectedPkg.price.toLocaleString("en-IN")}</span>
            </p>
          </div>
        )}
        {step === 1 && selectedPkg && (
          <button onClick={goToDetails}
            className="w-full bg-[var(--color-ink)] text-white font-bold rounded-xl py-4 text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-[var(--color-ink)]/20">
            Continue with {selectedPkg.label}
            <span className="bg-[var(--color-gold)] text-[var(--color-ink)] text-[13px] font-bold px-2.5 py-0.5 rounded-lg">₹{selectedPkg.price.toLocaleString("en-IN")}</span>
          </button>
        )}
        {step === 2 && (
          <button onClick={confirmBooking} disabled={loading}
            className="w-full bg-[var(--color-ok)] text-white font-bold rounded-xl py-4 text-[15px] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60 shadow-lg shadow-[var(--color-ok)]/25">
            {loading ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending request…</> : <><CheckCircle2 size={18} /> Confirm booking request</>}
          </button>
        )}
      </div>

      {/* Auth gate — shown when a guest tries to confirm a booking */}
      {showAuthGate && (
        <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={() => setShowAuthGate(false)}>
          <div className="bg-white rounded-t-3xl w-full px-6 pt-5 pb-10 safe-bottom" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-black/12 rounded-full mx-auto mb-5" />
            <h2 className="font-display font-bold text-[18px] text-center">Almost there!</h2>
            <p className="text-black/45 text-[13px] mt-2 mb-6 text-center leading-relaxed">
              Log in or create a free account to confirm your booking — we've saved your selections.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => navigate("/login/user")}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3.5 text-[14px] active:scale-[0.98] transition-transform">
                <LogIn size={16} /> Log in
              </button>
              <button onClick={() => navigate("/signup/user")}
                className="w-full flex items-center justify-center gap-2 border border-black/10 text-black/70 font-semibold rounded-xl py-3.5 text-[14px] active:scale-[0.98] transition-transform">
                <UserPlus size={16} /> Create an account
              </button>
            </div>
            <button onClick={() => setShowAuthGate(false)} className="mt-4 w-full text-center text-[12.5px] text-black/35 font-medium">
              Keep browsing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SRow({ label, value, last }) {
  return (
    <div className={`flex justify-between py-2.5 ${!last ? "border-b border-black/5" : ""}`}>
      <span className="text-[12px] text-black/38">{label}</span>
      <span className="text-[12.5px] font-semibold text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
}
