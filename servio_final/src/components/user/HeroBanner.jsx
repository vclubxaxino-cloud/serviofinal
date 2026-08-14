import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  {
    title: "Book Trusted",
    highlight: "Local Services",
    sub: "in just a few clicks",
    tag: "Video Services",
    bg: "linear-gradient(135deg,#12142B,#252860)",
  },
  {
    title: "Medical visits,",
    highlight: "handled with care",
    sub: "trained companions for every appointment",
    tag: "Medical Saathi",
    bg: "linear-gradient(135deg,#1a2f2a,#2a4a42)",
  },
  {
    title: "Travel with",
    highlight: "a trusted Saathi",
    sub: "temple visits & pilgrimages made easy",
    tag: "Yatra Saathi",
    bg: "linear-gradient(135deg,#2d1f0e,#4a3520)",
  },
  {
    title: "Peace of mind for",
    highlight: "your parents back home",
    sub: "regular visits & emergency support",
    tag: "NRI Parent Care",
    bg: "linear-gradient(135deg,#1a1f40,#2d3360)",
  },
];

export default function HeroBanner({ onBook }) {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (i) => {
    setActive(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((n) => (n + 1) % SLIDES.length), 4000);
  };

  const slide = SLIDES[active];

  return (
    <div className="px-5 mt-2">
      <div
        className="relative rounded-3xl overflow-hidden px-5 py-7 min-h-[168px] flex flex-col justify-between transition-all duration-500"
        style={{ background: slide.bg }}
      >
        <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[var(--color-gold)]/10" />
        <div className="relative">
          <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-white/10 text-[var(--color-gold)] px-2.5 py-1 rounded-full mb-3">
            {slide.tag}
          </span>
          <h2 className="font-display font-bold text-white text-[22px] leading-[1.15]">
            {slide.title}<br />
            <span className="text-[var(--color-gold)]">{slide.highlight}</span>
          </h2>
          <p className="text-white/50 text-[12.5px] mt-1.5">{slide.sub}</p>
        </div>
        <button
          onClick={onBook}
          className="relative self-start mt-4 flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-ink)] font-semibold rounded-xl px-4 py-2.5 text-[13px] active:scale-95 transition-transform"
        >
          Book Now <ArrowRight size={14} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === active ? "w-5 bg-[var(--color-gold-deep)]" : "w-1.5 bg-black/15"}`}
          />
        ))}
      </div>
    </div>
  );
}
