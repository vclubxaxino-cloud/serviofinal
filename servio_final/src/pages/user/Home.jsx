import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, ShieldCheck, Clock, Zap, Navigation, Video, HeartPulse, MapPin, Users,
  ChevronRight, ArrowRight, Star, TrendingUp, Users2, ListChecks, Building2,
  ClipboardCheck, Sparkles, PartyPopper, HeadphonesIcon, ShieldCheck as ShieldIcon,
  Wallet, Send,
} from "lucide-react";
import TopHeader from "../../components/shared/TopHeader.jsx";
import HeroBanner from "../../components/user/HeroBanner.jsx";
import { api } from "../../api/client.js";
import { useAuth } from "../../context/AuthContext.jsx";

const CAT_ICONS = { video: Video, "heart-pulse": HeartPulse, "map-pin": MapPin, users: Users };
const CAT_COLORS = {
  video: { light: "bg-[var(--color-gold)]/10" },
  medical: { light: "bg-emerald-50" },
  yatra: { light: "bg-amber-50" },
  nri: { light: "bg-blue-50" },
};
const CAT_IMAGE = {
  video: "/images/cat-video.svg", medical: "/images/cat-medical.svg",
  yatra: "/images/cat-yatra.svg", nri: "/images/cat-nri.svg",
};
const TRUST = [
  { Icon: ShieldCheck, label: "Verified Partners", sub: "KYC checked" },
  { Icon: Clock, label: "Background Verified", sub: "Every partner" },
  { Icon: TrendingUp, label: "Best Price", sub: "No hidden costs" },
  { Icon: Zap, label: "Easy Booking", sub: "In 3 taps" },
  { Icon: HeadphonesIcon, label: "24×7 Support", sub: "Always here" },
];
const HOW_IT_WORKS = [
  { n: "1", title: "Choose Service", Icon: ListChecks },
  { n: "2", title: "Book Easily", Icon: ClipboardCheck },
  { n: "3", title: "We Do The Work", Icon: Sparkles },
  { n: "4", title: "You Relax & Enjoy", Icon: PartyPopper },
];
const TESTIMONIALS = [
  { name: "Rohit Sharma", text: "Amazing experience! The team was very professional and delivered beyond expectations." },
  { name: "Ankita Verma", text: "Booking took two minutes and a verified partner showed up right on time. Would book again." },
  { name: "Suresh Patel", text: "Great support throughout — admin kept me updated on every step of my booking." },
];
const WHY_US = [
  { Icon: ShieldIcon, label: "100% Secure" },
  { Icon: HeadphonesIcon, label: "24/7 Support" },
  { Icon: Wallet, label: "No Hidden Charges" },
  { Icon: Star, label: "Trusted by Thousands" },
];

export default function Home() {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchQ, setSearchQ] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [testiIdx, setTestiIdx] = useState(0);
  const testiRef = useRef(null);
  const [subscribed, setSubscribed] = useState(false);
  const [waNumber, setWaNumber] = useState("");

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

  useEffect(() => {
    if (role !== "user") { setMyBookings([]); return; }
    api.get("/bookings/my").then(({ bookings }) => setMyBookings(bookings)).catch(() => {});
  }, [role]);

  const searchResults = searchQ.length > 1
    ? services.filter(s =>
        s.title.toLowerCase().includes(searchQ.toLowerCase()) ||
        s.subCategory.toLowerCase().includes(searchQ.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleTestiScroll = () => {
    const el = testiRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setTestiIdx(idx);
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!waNumber.trim()) return;
    setSubscribed(true);
  };

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
        <p className="font-semibold text-[15px]">Couldn't load the homepage</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-4 page-enter">
      {/* 1. Branding + notifications */}
      <TopHeader bookings={myBookings} />

      {/* 2. Auto-sliding hero banner */}
      <HeroBanner onBook={() => navigate("/user/services")} />

      {/* 3. Trust strip */}
      <div className="px-5 mt-4">
        <div className="flex gap-3 overflow-x-auto rail">
          {TRUST.map(({ Icon, label, sub }) => (
            <div key={label} className="shrink-0 flex items-center gap-2 bg-white border border-black/8 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--color-ink)] flex items-center justify-center shrink-0">
                <Icon size={13} className="text-[var(--color-gold)]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[11.5px] font-semibold leading-none">{label}</p>
                <p className="text-[10px] text-black/38 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Search / Book a Service */}
      <div className="px-5 mt-5">
        <div className="relative">
          <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 shadow-sm transition-all ${searchFocused ? "border-[var(--color-gold)] shadow-[0_0_0_3px_rgba(232,163,61,0.12)]" : "border-black/10"}`}>
            <Search size={17} className="text-black/35 shrink-0" />
            <input
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              placeholder="Search for a service…"
              className="flex-1 text-[14px] outline-none placeholder:text-black/30 bg-transparent"
            />
            {searchQ && <button onClick={() => setSearchQ("")} className="text-black/30 text-lg leading-none">✕</button>}
          </div>
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-black/10 rounded-2xl shadow-xl z-20 overflow-hidden">
              {searchResults.map(svc => (
                <button key={svc._id} onMouseDown={() => { navigate(`/user/services/${svc._id}`); setSearchQ(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3 border-b border-black/5 last:border-0 text-left active:bg-black/3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center shrink-0">
                    <Search size={13} className="text-[var(--color-gold-deep)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-medium truncate">{svc.title}</p>
                    <p className="text-[11px] text-black/38">{svc.subCategory} · from ₹{svc.startingPrice.toLocaleString("en-IN")}</p>
                  </div>
                  <ChevronRight size={14} className="text-black/20 shrink-0" />
                </button>
              ))}
              <button onMouseDown={() => { navigate("/user/services"); setSearchQ(""); }}
                className="w-full px-4 py-3 text-[12.5px] text-[var(--color-gold-deep)] font-semibold text-center bg-[var(--color-gold)]/5">
                View all results →
              </button>
            </div>
          )}
        </div>
        <button onClick={() => navigate("/user/services")}
          className="w-full mt-3 bg-[var(--color-ink)] text-white rounded-2xl px-5 py-4 flex items-center justify-between active:scale-[0.98] transition-transform shadow-lg shadow-[var(--color-ink)]/20">
          <div className="text-left">
            <p className="font-display font-bold text-[16px]">Book a service now</p>
            <p className="text-white/50 text-[12px] mt-0.5">{services.length}+ services · verified partners</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[var(--color-gold)] flex items-center justify-center shrink-0">
            <ArrowRight size={18} className="text-[var(--color-ink)]" />
          </div>
        </button>
      </div>

      {/* 5. Browse by category */}
      <div className="px-5 mt-7">
        <SectionHeader title="Browse by category" onView={() => navigate("/user/services")} />
        <div className="grid grid-cols-4 gap-2.5 mt-3">
          {categories.map(cat => {
            const Icon = CAT_ICONS[cat.icon] || Video;
            const col = CAT_COLORS[cat.slug] || CAT_COLORS.video;
            const count = services.filter(s => s.category?._id === cat._id).length;
            return (
              <button key={cat._id} onClick={() => navigate(`/user/services?cat=${cat._id}`)}
                className="flex flex-col items-center gap-2 bg-white border border-black/8 rounded-2xl py-3.5 active:scale-[0.96] transition-transform">
                <div className={`w-10 h-10 rounded-xl ${col.light} flex items-center justify-center`}>
                  <Icon size={18} className="text-[var(--color-gold-deep)]" strokeWidth={1.8} />
                </div>
                <span className="text-[10.5px] font-semibold text-center leading-tight px-1">{cat.name}</span>
                <span className="text-[9.5px] text-black/35">{count} svcs</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Service type sections (Video / Yatra / Medical / NRI) */}
      {categories.map(cat => {
        const items = services.filter(s => s.category?._id === cat._id).slice(0, 5);
        if (!items.length) return null;
        const img = CAT_IMAGE[cat.slug] || CAT_IMAGE.video;
        return (
          <div key={cat._id} className="mt-7">
            <div className="px-5">
              <SectionHeader title={cat.name} onView={() => navigate(`/user/services?cat=${cat._id}`)} />
            </div>
            <div className="flex gap-3 mt-3 px-5 overflow-x-auto rail pb-1">
              {items.map(svc => (
                <button key={svc._id} onClick={() => navigate(`/user/services/${svc._id}`)}
                  className="shrink-0 w-[158px] bg-white border border-black/8 rounded-2xl overflow-hidden text-left active:scale-[0.97] transition-transform shadow-sm">
                  <div className="h-[88px] relative flex items-end p-3 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }}>
                    <div className="absolute top-2.5 right-2.5">
                      {svc.isPackage && <span className="text-[8.5px] font-bold bg-[var(--color-gold)] text-[var(--color-ink)] px-1.5 py-0.5 rounded-full uppercase tracking-wide">Bundle</span>}
                      {svc.isEnquiry && <span className="text-[8.5px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide">Custom</span>}
                    </div>
                    <p className="text-white/70 text-[9.5px] font-medium drop-shadow">{svc.subCategory}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-[12.5px] font-semibold leading-tight line-clamp-2">{svc.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[11.5px]">
                        {svc.isEnquiry ? <span className="text-[var(--color-gold-deep)] font-semibold">Get quote</span>
                          : <><span className="text-black/35 text-[10px]">from </span><span className="text-[var(--color-gold-deep)] font-bold">₹{svc.startingPrice.toLocaleString("en-IN")}</span></>}
                      </p>
                      <div className="w-6 h-6 rounded-lg bg-[var(--color-ink)] flex items-center justify-center shrink-0">
                        <ArrowRight size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              <button onClick={() => navigate(`/user/services?cat=${cat._id}`)}
                className="shrink-0 w-[100px] border-2 border-dashed border-black/10 rounded-2xl flex flex-col items-center justify-center gap-2 text-black/35 active:scale-[0.97] transition-transform">
                <TrendingUp size={18} />
                <span className="text-[11px] font-medium text-center leading-tight">See all {services.filter(s => s.category?._id === cat._id).length}</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* 7. How It Works */}
      <div className="px-5 mt-8">
        <h2 className="font-display font-bold text-[18px]">How It Works?</h2>
        <div className="relative flex justify-between mt-5">
          <div className="absolute top-6 left-[12%] right-[12%] h-px border-t border-dashed border-black/15" />
          {HOW_IT_WORKS.map(({ n, title, Icon }) => (
            <div key={n} className="relative flex flex-col items-center gap-2 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-gold)]/12 flex items-center justify-center text-[var(--color-gold-deep)] z-10 bg-[var(--color-paper)]">
                <Icon size={20} strokeWidth={1.8} />
              </div>
              <span className="w-5 h-5 rounded-full bg-[var(--color-ink)] text-white text-[10px] font-bold flex items-center justify-center -mt-1">{n}</span>
              <p className="text-[10.5px] font-semibold text-center leading-tight px-1 max-w-[70px]">{title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 8. Why Choose Us */}
      <div className="px-5 mt-8">
        <h2 className="font-display font-bold text-[18px] mb-4">Why Choose Us</h2>
        <div className="grid grid-cols-4 gap-2.5">
          {WHY_US.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-11 h-11 rounded-full bg-white border border-black/8 flex items-center justify-center text-[var(--color-gold-deep)]">
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <p className="text-[10px] font-medium leading-tight text-black/55">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 9. Happy Customers stats */}
      <div className="px-5 mt-8">
        <div className="grid grid-cols-4 gap-2.5">
          <StatBox Icon={Users2} value="5000+" label="Happy Customers" />
          <StatBox Icon={ListChecks} value={`${services.length}+`} label="Services" />
          <StatBox Icon={Building2} value="50+" label="Cities" />
          <StatBox Icon={Star} value="4.8★" label="Customer Rating" />
        </div>
      </div>

      {/* 10. Our Recent Work */}
      <div className="px-5 mt-8">
        <SectionHeader title="Our Recent Work" onView={() => navigate("/user/services")} />
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {categories.slice(0, 4).map(cat => {
            const img = CAT_IMAGE[cat.slug] || CAT_IMAGE.video;
            return (
              <div key={cat._id} className="h-[110px] rounded-2xl overflow-hidden bg-cover bg-center relative" style={{ backgroundImage: `url(${img})` }}>
                <p className="absolute bottom-2 left-2.5 text-white/80 text-[10px] font-medium drop-shadow">{cat.name}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 11. Customer Reviews */}
      <div className="mt-8">
        <div className="px-5 flex items-center justify-between">
          <h2 className="font-display font-bold text-[18px]">What Our Customers Say</h2>
        </div>
        <div
          ref={testiRef}
          onScroll={handleTestiScroll}
          className="flex gap-3 mt-3 px-5 overflow-x-auto snap-x snap-mandatory rail pb-1"
        >
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="shrink-0 w-[calc(100%-40px)] snap-center bg-white border border-black/8 rounded-2xl p-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--color-ink)] flex items-center justify-center font-display font-bold text-[var(--color-gold)] text-[14px] shrink-0">
                  {t.name[0]}
                </div>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => <Star key={n} size={12} className="text-[var(--color-gold)] fill-[var(--color-gold)]" />)}
                </div>
              </div>
              <p className="text-[13px] text-black/65 leading-relaxed mt-3">{t.text}</p>
              <p className="text-[12px] font-semibold mt-2">— {t.name}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {TESTIMONIALS.map((_, i) => (
            <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === testiIdx ? "bg-[var(--color-gold-deep)]" : "bg-black/15"}`} />
          ))}
        </div>
      </div>

      {/* 12. Earn With Us */}
      <div className="px-5 mt-8">
        <div className="relative bg-[var(--color-ink)] rounded-3xl p-5 overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-[var(--color-gold)]/10" />
          <p className="text-[var(--color-gold)] text-[11px] font-semibold uppercase tracking-wide">Earn With Us</p>
          <p className="font-display font-bold text-white text-[21px] mt-1 leading-tight max-w-[220px]">
            Become a Servio Partner
          </p>
          <p className="text-white/45 text-[12.5px] mt-2 leading-relaxed max-w-[230px]">
            Join our network of verified professionals and grow your business.
          </p>
          <button onClick={() => navigate("/signup/worker")}
            className="mt-4 flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold rounded-xl px-4 py-2.5 text-[13px] active:scale-95 transition-transform">
            Join Now <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 13. Trust badges strip */}
      <div className="px-5 mt-8">
        <div className="bg-white border border-black/8 rounded-2xl px-4 py-4 flex items-center justify-around">
          {[
            { Icon: ShieldIcon, label: "100% Secure" },
            { Icon: Wallet, label: "No Hidden Charges" },
            { Icon: Star, label: "Trusted by Thousands" },
          ].map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <Icon size={16} className="text-[var(--color-gold-deep)]" strokeWidth={1.8} />
              <p className="text-[9.5px] font-medium text-black/50 leading-tight max-w-[64px]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-9 bg-[var(--color-ink)] pt-8 pb-6 px-5 rounded-t-[28px]">
        <p className="text-white font-display font-bold text-[15px]">Stay Updated</p>
        <p className="text-white/40 text-[12px] mt-1">Get our latest updates &amp; offers</p>
        {subscribed ? (
          <p className="mt-3 text-[var(--color-gold)] text-[12.5px] font-medium">Thanks! We'll reach out on WhatsApp soon.</p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex items-center gap-2 mt-3">
            <input
              value={waNumber}
              onChange={(e) => setWaNumber(e.target.value)}
              placeholder="Enter your WhatsApp number"
              className="flex-1 bg-white/8 border border-white/15 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[var(--color-gold)]"
            />
            <button type="submit" className="w-10 h-10 rounded-xl bg-[var(--color-gold)] flex items-center justify-center shrink-0">
              <Send size={16} className="text-[var(--color-ink)]" />
            </button>
          </form>
        )}

        <div className="mt-6">
          <p className="text-white/50 text-[11px] font-semibold uppercase tracking-wide">Connect with us</p>
          <div className="flex items-center gap-2.5 mt-2.5">
            <a href="https://wa.me/919992094134" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/70">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.478 2 2 6.477 2 12c0 1.85.505 3.58 1.38 5.062L2 22l5.077-1.34A9.94 9.94 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2z"/></svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/70">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.79.218-2.427.465a4.9 4.9 0 00-1.771 1.153A4.9 4.9 0 002.525 5.45c-.247.637-.416 1.363-.465 2.427C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.79.465 2.427a4.9 4.9 0 001.153 1.771 4.9 4.9 0 001.771 1.153c.637.247 1.363.416 2.427.465C8.944 21.988 9.284 22 12 22s3.056-.012 4.123-.06c1.064-.049 1.79-.218 2.427-.465a4.9 4.9 0 001.771-1.153 4.9 4.9 0 001.153-1.771c.247-.637.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.79-.465-2.427a4.9 4.9 0 00-1.153-1.771A4.9 4.9 0 0018.55 2.525c-.637-.247-1.363-.416-2.427-.465C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.987.01 4.042.059.976.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.857.048 1.055.059 1.373.059 4.042s-.01 2.987-.059 4.042c-.045.976-.207 1.505-.344 1.858a3.1 3.1 0 01-.748 1.15 3.1 3.1 0 01-1.15.748c-.353.137-.882.3-1.858.344-1.054.048-1.371.059-4.042.059s-2.987-.01-4.042-.059c-.976-.045-1.505-.207-1.857-.344a3.1 3.1 0 01-1.15-.748 3.1 3.1 0 01-.748-1.15c-.137-.353-.3-.882-.344-1.858-.048-1.054-.059-1.371-.059-4.042s.01-2.987.059-4.042c.045-.975.207-1.504.344-1.857.182-.467.399-.8.748-1.15a3.1 3.1 0 011.15-.748c.352-.137.881-.3 1.857-.344C9.013 3.812 9.33 3.802 12 3.802zm0 3.064a5.135 5.135 0 100 10.269 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.671a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/>
              </svg>
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center text-white/70">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-7">
          <div>
            <p className="text-white text-[12px] font-semibold">Quick Links</p>
            <div className="flex flex-col gap-2 mt-2.5">
              <span className="text-white/40 text-[11px] leading-tight">About Us</span>
              <a href="tel:+919992094134" className="text-white/40 text-[11px] leading-tight">Contact Us</a>
              <button onClick={() => navigate("/terms")} className="text-white/40 text-[11px] text-left leading-tight">FAQs</button>
            </div>
          </div>
          <FooterCol
            title="Popular Services"
            items={categories.map(c => c.name)}
            onItemClick={(idx) => navigate(`/user/services?cat=${categories[idx]._id}`)}
          />
          <div>
            <p className="text-white text-[12px] font-semibold">Support</p>
            <div className="flex flex-col gap-2 mt-2.5">
              <a href="tel:+919992094134" className="text-white/40 text-[11px] text-left leading-tight">Call Support</a>
              <button onClick={() => navigate("/terms")} className="text-white/40 text-[11px] text-left leading-tight">Terms &amp; Conditions</button>
              <button onClick={() => navigate("/terms")} className="text-white/40 text-[11px] text-left leading-tight">Privacy Policy</button>
              <button onClick={() => navigate("/signup/worker")} className="text-white/40 text-[11px] text-left leading-tight">Partner with Us</button>
            </div>
          </div>
        </div>

        <p className="text-white/25 text-[10.5px] text-center mt-8">© 2026 Servio. All Rights Reserved.</p>
      </div>
    </div>
  );
}

function StatBox({ Icon, value, label }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl py-3.5 flex flex-col items-center gap-1.5">
      <Icon size={16} className="text-[var(--color-gold-deep)]" strokeWidth={1.8} />
      <p className="font-display font-bold text-[15px] leading-none">{value}</p>
      <p className="text-[9px] text-black/40 text-center leading-tight px-1">{label}</p>
    </div>
  );
}

function SectionHeader({ title, onView }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-display font-bold text-[16px]">{title}</h2>
      <button onClick={onView} className="flex items-center gap-0.5 text-[12.5px] font-medium text-[var(--color-gold-deep)] active:opacity-60">
        View all <ChevronRight size={14} />
      </button>
    </div>
  );
}

function FooterCol({ title, items, onItemClick }) {
  return (
    <div>
      <p className="text-white text-[12px] font-semibold">{title}</p>
      <div className="flex flex-col gap-2 mt-2.5">
        {items.map((item, idx) => (
          <button
            key={item}
            onClick={onItemClick ? () => onItemClick(idx) : undefined}
            className="text-white/40 text-[11px] text-left leading-tight"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
