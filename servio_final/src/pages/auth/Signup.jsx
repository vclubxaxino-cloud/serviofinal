import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { resumePendingBooking } from "../../utils/pendingBooking.js";

const SKILL_OPTIONS = [
  "Video Services", "Wedding Reels", "Product Promotion",
  "Video Editing", "Medical Saathi", "Yatra Saathi", "NRI Parent Care",
];

export default function Signup() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const isWorker = role === "worker";

  const [step, setStep] = useState(1); // workers: step 1 = basic info, step 2 = KYC
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "",
    skills: [],
    serviceAreas: "",
    aadhaarNumber: "",
    kycDocType: "aadhaar_pan",
  });
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [kycFile, setKycFile] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleSkill = (skill) => {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill) ? f.skills.filter(s => s !== skill) : [...f.skills, skill],
    }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit phone required";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    if (isWorker && form.skills.length === 0) e.skills = "Select at least one skill";
    if (!isWorker && !agreedToTerms) e.terms = "Please agree to the Terms & Privacy Policy to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.aadhaarNumber.trim() || form.aadhaarNumber.replace(/\D/g, "").length < 12) e.aadhaarNumber = "Valid 12-digit Aadhaar number required";
    if (!aadhaarFile) e.aadhaarFile = "Upload your Aadhaar card";
    if (!kycFile) e.kycFile = "Upload the second ID document";
    if (!form.serviceAreas.trim()) e.serviceAreas = "Enter at least one pincode where you can work";
    if (!agreedToTerms) e.terms = "Please agree to the Terms & Privacy Policy to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    if (isWorker) {
      if (!validateStep2()) return;
    } else if (!validateStep1()) {
      return;
    }
    setLoading(true);
    setErrors((e) => ({ ...e, submit: "" }));
    try {
      const payload = isWorker
        ? (() => {
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("email", form.email);
            fd.append("phone", form.phone);
            fd.append("password", form.password);
            fd.append("skills", form.skills.join(","));
            fd.append("serviceAreas", form.serviceAreas);
            fd.append("aadhaarNumber", form.aadhaarNumber);
            fd.append("kycDocType", form.kycDocType);
            if (aadhaarFile) fd.append("aadhaarFile", aadhaarFile);
            if (kycFile) fd.append("kycFile", kycFile);
            return fd;
          })()
        : { name: form.name, email: form.email, phone: form.phone, password: form.password };

      await register(role, payload);
      if (isWorker) {
        navigate("/worker/pending");
      } else {
        const booked = await resumePendingBooking(role);
        navigate(booked ? "/user/bookings" : "/user");
      }
    } catch (err) {
      setErrors((e) => ({ ...e, submit: err.message || "Could not create account. Please try again." }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)] flex flex-col px-6 pt-14 pb-10">
      <button
        onClick={() => (isWorker && step === 2 ? setStep(1) : navigate(`/login/${role}`))}
        className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center mb-8"
      >
        <ArrowLeft size={16} />
      </button>

      {/* Header */}
      <div className="mb-7">
        {isWorker && (
          <div className="flex gap-2 mb-4">
            {[1, 2].map(n => (
              <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= n ? "bg-[var(--color-ink)]" : "bg-black/10"}`} />
            ))}
          </div>
        )}
        <h1 className="font-display text-[28px] font-bold">
          {isWorker ? (step === 1 ? "Join as a partner" : "Verify your identity") : "Create your account"}
        </h1>
        <p className="text-black/50 text-[14px] mt-1.5">
          {isWorker
            ? (step === 1 ? "Tell us about yourself and your skills" : "Aadhaar verification keeps our platform safe")
            : "Book trusted help in a few clicks"}
        </p>
      </div>

      {/* ── Step 1: Basic info ──────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <Field label="Full name" value={form.name} onChange={set("name")} placeholder="As on Aadhaar" error={errors.name} />
          <Field label="Email" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" error={errors.email} />
          <Field label="Mobile number" value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} placeholder="98765 43210" error={errors.phone} />
          <Field label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" error={errors.password} />

          {isWorker && (
            <div>
              <p className="text-[12.5px] font-medium text-black/60 mb-2">Skills you offer *</p>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${
                      form.skills.includes(s)
                        ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]"
                        : "bg-white text-black/55 border-black/10"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {errors.skills && <p className="text-[11.5px] text-[var(--color-danger)] mt-1.5">{errors.skills}</p>}
            </div>
          )}

          {!isWorker && (
            <>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms}
                  onChange={e => { setAgreedToTerms(e.target.checked); setErrors((er) => ({ ...er, terms: "" })); }}
                  className="mt-0.5 w-4 h-4 accent-[var(--color-ink)] shrink-0" />
                <span className="text-[12.5px] text-black/60 leading-relaxed">
                  I agree to the{" "}
                  <Link to="/terms" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Terms &amp; Conditions</Link>
                  {" "}and{" "}
                  <Link to="/terms" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Privacy Policy</Link>
                </span>
              </label>
              {errors.terms && <p className="text-[11.5px] text-[var(--color-danger)] -mt-2">{errors.terms}</p>}
            </>
          )}

          {errors.submit && (
            <div className="flex items-center gap-2 text-[var(--color-danger)] text-[13px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" />
              {errors.submit}
            </div>
          )}

          <button
            type="button"
            onClick={isWorker ? goToStep2 : handleSubmit}
            disabled={loading}
            className="mt-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3.5 text-[15px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? "Creating…" : isWorker ? "Next — Upload KYC" : "Create account"}
          </button>
        </div>
      )}

      {/* ── Step 2: KYC (workers only) ──────────────────────────────────────── */}
      {step === 2 && isWorker && (
        <div className="flex flex-col gap-4">
          <Field
            label="Aadhaar number *"
            value={form.aadhaarNumber}
            onChange={(e) => setForm(f => ({ ...f, aadhaarNumber: e.target.value.replace(/\D/g, "").slice(0, 12) }))}
            placeholder="12-digit Aadhaar number"
            error={errors.aadhaarNumber}
            type="tel"
            maxLength={12}
          />

          <FileUpload
            label="Upload Aadhaar card *"
            hint="Front + back as a single image or PDF"
            file={aadhaarFile}
            onChange={setAadhaarFile}
            error={errors.aadhaarFile}
          />

          <div>
            <label className="flex flex-col gap-1.5 mb-2">
              <span className="text-[12.5px] font-medium text-black/60">Second ID document *</span>
              <select
                value={form.kycDocType}
                onChange={set("kycDocType")}
                className="rounded-xl border border-black/10 bg-white px-4 py-3.5 text-[14px] outline-none"
              >
                <option value="aadhaar_pan">PAN Card</option>
                <option value="voter_id">Voter ID</option>
                <option value="driving_licence">Driving Licence</option>
                <option value="passport">Passport</option>
              </select>
            </label>
            <FileUpload
              label={`Upload second document *`}
              hint="Clear photo or scanned copy"
              file={kycFile}
              onChange={setKycFile}
              error={errors.kycFile}
            />
          </div>

          <Field
            label="Pincodes you can serve *"
            value={form.serviceAreas}
            onChange={set("serviceAreas")}
            placeholder="490001, 491001, 492001"
            hint="Comma-separated pincodes within 20 km of where you work"
            error={errors.serviceAreas}
          />

          <div className="bg-[var(--color-gold)]/10 border border-[var(--color-gold)]/30 rounded-2xl px-4 py-4">
            <p className="text-[12px] font-semibold text-[var(--color-gold-deep)] mb-1">What happens after you submit?</p>
            <p className="text-[12px] text-black/60 leading-relaxed">
              Our team manually reviews your Aadhaar and KYC documents — usually within 24 hours. You'll be notified once approved and can start taking jobs.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input type="checkbox" checked={agreedToTerms}
              onChange={e => { setAgreedToTerms(e.target.checked); setErrors((er) => ({ ...er, terms: "" })); }}
              className="mt-0.5 w-4 h-4 accent-[var(--color-ink)] shrink-0" />
            <span className="text-[12.5px] text-black/60 leading-relaxed">
              I agree to the Servio Partner{" "}
              <Link to="/terms?for=worker" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Terms &amp; Conditions</Link>
              {" "}and{" "}
              <Link to="/terms?for=worker" target="_blank" className="text-[var(--color-gold-deep)] font-semibold underline">Privacy Policy</Link>
            </span>
          </label>
          {errors.terms && <p className="text-[11.5px] text-[var(--color-danger)] -mt-2">{errors.terms}</p>}

          {errors.submit && (
            <div className="flex items-center gap-2 text-[var(--color-danger)] text-[13px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="shrink-0" />
              {errors.submit}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3.5 text-[15px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? "Submitting…" : "Submit for review"}
          </button>

          <p className="text-[11.5px] text-black/40 text-center">
            Your documents are only used for identity verification and are kept private.
          </p>
        </div>
      )}

      <p className="text-[13px] text-black/40 mt-6 text-center">
        Already have an account?{" "}
        <Link to={`/login/${role}`} className="text-[var(--color-gold-deep)] font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function Field({ label, hint, error, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-black/60">{label}</span>
      <input
        {...props}
        className={`rounded-xl border bg-white px-4 py-3.5 text-[15px] outline-none transition-colors ${
          error ? "border-[var(--color-danger)]" : "border-black/10 focus:border-[var(--color-gold)]"
        }`}
      />
      {hint && !error && <p className="text-[11px] text-black/35">{hint}</p>}
      {error && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-danger)]">
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </label>
  );
}

function FileUpload({ label, hint, file, onChange, error }) {
  return (
    <div>
      <p className="text-[12.5px] font-medium text-black/60 mb-1.5">{label}</p>
      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-5 cursor-pointer transition-colors ${
        error ? "border-[var(--color-danger)]/50 bg-[var(--color-danger)]/5" :
        file ? "border-[var(--color-ok)]/50 bg-[var(--color-ok)]/5" :
        "border-black/15 bg-white hover:border-[var(--color-gold)]"
      }`}>
        {file ? (
          <>
            <CheckCircle2 size={22} className="text-[var(--color-ok)]" />
            <p className="text-[12.5px] text-[var(--color-ok)] font-medium">{file.name}</p>
            <p className="text-[11px] text-black/35">Tap to replace</p>
          </>
        ) : (
          <>
            <Upload size={22} className="text-black/30" />
            <p className="text-[13px] font-medium text-black/50">Tap to upload</p>
            {hint && <p className="text-[11px] text-black/35">{hint}</p>}
          </>
        )}
        <input
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
      </label>
      {error && (
        <div className="flex items-center gap-1.5 text-[11.5px] text-[var(--color-danger)] mt-1.5">
          <AlertCircle size={11} /> {error}
        </div>
      )}
    </div>
  );
}
