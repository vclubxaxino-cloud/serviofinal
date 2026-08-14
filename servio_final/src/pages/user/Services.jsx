import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ChevronRight, X } from "lucide-react";
import { api } from "../../api/client.js";

// Keyed by category slug (stable) rather than DB _id
const CAT_IMAGE = {
  video: "/images/cat-video.svg", medical: "/images/cat-medical.svg",
  yatra: "/images/cat-yatra.svg", nri: "/images/cat-nri.svg",
};

export default function Services() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(params.get("cat") || "all");

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, svcRes] = await Promise.all([
          api.get("/services/categories"),
          api.get("/services"),
        ]);
        setCategories(catRes.categories);
        setServices(svcRes.services);
      } catch (err) {
        setError(err.message || "Could not load services right now.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const grouped = useMemo(() => {
    const svcs = activeCat === "all" ? services : services.filter(s => s.category?._id === activeCat);
    const map = {};
    svcs.forEach(s => { if (!map[s.subCategory]) map[s.subCategory] = []; map[s.subCategory].push(s); });
    return map;
  }, [activeCat, services]);

  const searchResults = useMemo(() => {
    if (!query) return null;
    return services.filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.subCategory.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, services]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-8 text-center">
        <p className="font-semibold text-[15px]">Couldn't load services</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-28 page-enter">
      <div className="px-5 pt-6">
        <h1 className="font-display text-[24px] font-bold">Services</h1>
        <p className="text-black/40 text-[13px] mt-0.5">{services.length} services · {categories.length} categories</p>
        <div className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-4 py-3.5 mt-4 shadow-sm">
          <Search size={16} className="text-black/30 shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search services…"
            className="flex-1 text-[14px] outline-none placeholder:text-black/28 bg-transparent" />
          {query && <button onClick={() => setQuery("")} className="text-black/25 active:scale-90 transition-transform"><X size={15} /></button>}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto rail pb-1">
          <Chip label="All" active={activeCat === "all"} count={services.length} onClick={() => setActiveCat("all")} />
          {categories.map(c => (
            <Chip key={c._id} label={c.name} active={activeCat === c._id}
              count={services.filter(s => s.category?._id === c._id).length}
              onClick={() => { setActiveCat(c._id); setQuery(""); }} />
          ))}
        </div>
      </div>

      {searchResults !== null ? (
        <div className="px-5 mt-4">
          <p className="text-[12.5px] text-black/40 mb-3">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""} for "{query}"</p>
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[30px] mb-3">🔍</p>
              <p className="font-semibold text-[15px]">No matches</p>
              <p className="text-black/40 text-[13px] mt-1">Try different keywords or browse by category above.</p>
              <button onClick={() => setQuery("")} className="mt-4 text-[var(--color-gold-deep)] font-semibold text-[13px]">Clear search</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {searchResults.map(svc => <ServiceCard key={svc._id} svc={svc} onClick={() => navigate(`/user/services/${svc._id}`)} />)}
            </div>
          )}
        </div>
      ) : (
        Object.entries(grouped).map(([sub, svcs]) => (
          <div key={sub} className="mt-6">
            <div className="px-5 flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display font-bold text-[15px]">{sub}</h2>
                <p className="text-[11px] text-black/35 mt-0.5">{svcs.length} service{svcs.length > 1 ? "s" : ""}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5">
              {svcs.map(svc => <ServiceCard key={svc._id} svc={svc} onClick={() => navigate(`/user/services/${svc._id}`)} />)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ServiceCard({ svc, onClick }) {
  const img = CAT_IMAGE[svc.category?.slug] || CAT_IMAGE.video;
  return (
    <button onClick={onClick} className="bg-white border border-black/8 rounded-2xl overflow-hidden text-left active:scale-[0.96] transition-transform shadow-sm">
      <div className="h-[88px] relative flex items-start justify-end p-2.5 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
        {svc.isPackage && <span className="text-[8.5px] font-bold bg-[var(--color-gold)] text-[var(--color-ink)] px-1.5 py-0.5 rounded-full uppercase tracking-wide">Bundle</span>}
        {svc.isEnquiry && <span className="text-[8.5px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Custom</span>}
        <div className="absolute bottom-2.5 left-3">
          <p className="text-white/70 text-[9px] font-medium drop-shadow">{svc.subCategory}</p>
        </div>
      </div>
      <div className="p-3">
        <p className="text-[12.5px] font-semibold leading-tight line-clamp-2">{svc.title}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11.5px]">
            {svc.isEnquiry ? <span className="text-[var(--color-gold-deep)] font-semibold text-[11px]">Get quote →</span>
              : <><span className="text-black/30 text-[10px]">from </span><span className="text-[var(--color-gold-deep)] font-bold">₹{svc.startingPrice.toLocaleString("en-IN")}</span></>}
          </p>
          <div className="w-6 h-6 rounded-lg bg-[var(--color-ink)] flex items-center justify-center shrink-0">
            <ChevronRight size={12} className="text-white" />
          </div>
        </div>
      </div>
    </button>
  );
}

function Chip({ label, active, count, onClick }) {
  return (
    <button onClick={onClick}
      className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold border transition-all active:scale-95 ${active ? "bg-[var(--color-ink)] text-white border-[var(--color-ink)]" : "bg-white text-black/50 border-black/10"}`}>
      {label}
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/15 text-white" : "bg-black/5 text-black/35"}`}>{count}</span>
    </button>
  );
}
