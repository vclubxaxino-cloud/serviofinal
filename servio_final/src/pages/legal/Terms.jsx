import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CUSTOMER_TERMS, WORKER_TERMS } from "../../content/terms.js";

export default function Terms() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState(params.get("for") === "worker" ? "worker" : "customer");

  const sections = tab === "worker" ? WORKER_TERMS : CUSTOMER_TERMS;

  return (
    <div className="min-h-screen bg-[var(--color-paper)] pb-16">
      <div className="sticky top-0 z-20 bg-white border-b border-black/8 px-5 pt-12 pb-4">
        <button onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-black/5 flex items-center justify-center mb-4 active:scale-90 transition-transform">
          <ArrowLeft size={16} />
        </button>
        <h1 className="font-display text-[22px] font-bold">Terms &amp; Privacy Policy</h1>
        <p className="text-black/40 text-[12.5px] mt-1">Last updated August 2026</p>

        <div className="flex gap-2 mt-4">
          <button onClick={() => setTab("customer")}
            className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-all ${tab === "customer" ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "bg-white text-black/50 border-black/10"}`}>
            For Customers
          </button>
          <button onClick={() => setTab("worker")}
            className={`px-4 py-2 rounded-full text-[12.5px] font-semibold border transition-all ${tab === "worker" ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "bg-white text-black/50 border-black/10"}`}>
            For Partners
          </button>
        </div>
      </div>

      <div className="px-5 mt-5 flex flex-col gap-5">
        {sections.map((s) => (
          <div key={s.heading}>
            <h2 className="font-display font-bold text-[15px]">{s.heading}</h2>
            <p className="text-black/55 text-[13px] mt-1.5 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="mt-2 pt-5 border-t border-black/8">
          <p className="text-black/40 text-[12px] leading-relaxed">
            Questions about these terms? Reach us anytime at{" "}
            <a href="tel:+919992094134" className="text-[var(--color-gold-deep)] font-semibold">+91 99920 94134</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
