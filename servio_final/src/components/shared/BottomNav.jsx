import { NavLink } from "react-router-dom";

export default function BottomNav({ tabs }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-ink)] border-t border-[var(--color-ink-line)] flex justify-around px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      {tabs.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10.5px] font-medium transition-all duration-150 ${
              isActive ? "text-[var(--color-gold)]" : "text-white/45 hover:text-white/70"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[var(--color-gold)]" />
              )}
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
