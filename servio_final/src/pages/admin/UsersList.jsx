import { useState, useEffect } from "react";
import { Search, Phone, CalendarDays } from "lucide-react";
import { api } from "../../api/client.js";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    api.get("/admin/users")
      .then(({ users }) => setUsers(users))
      .catch((err) => setError(err.message || "Could not load users."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

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
        <p className="font-semibold text-[15px]">Couldn't load users</p>
        <p className="text-black/40 text-[13px] mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <h1 className="font-display text-[24px] font-bold">Users</h1>
      <p className="text-black/45 text-[13px] mt-1">{users.length} registered users</p>

      <div className="flex items-center gap-3 bg-white border border-black/10 rounded-2xl px-4 py-3 mt-5">
        <Search size={16} className="text-black/30" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email…"
          className="flex-1 text-[14px] outline-none placeholder:text-black/30 bg-transparent"
        />
      </div>

      <div className="flex flex-col gap-2.5 mt-4">
        {filtered.map(u => (
          <div key={u._id} className="bg-white border border-black/8 rounded-2xl px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/15 text-[var(--color-gold-deep)] flex items-center justify-center font-display font-bold text-[14px] shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-semibold">{u.name}</p>
                <p className="text-[11.5px] text-black/38">{u.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-black/5">
              <div className="flex items-center gap-1.5 text-[11.5px] text-black/38">
                <Phone size={11} /> {u.phone}
              </div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-black/38">
                <CalendarDays size={11} /> Joined {new Date(u.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-10 text-black/35 text-[13px]">
            {users.length === 0 ? "No users have signed up yet." : `No users match "${query}"`}
          </div>
        )}
      </div>
    </div>
  );
}
