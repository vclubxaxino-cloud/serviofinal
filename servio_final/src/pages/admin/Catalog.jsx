import { useState, useEffect } from "react";
import { Plus, X, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { api } from "../../api/client.js";

const emptyPackage = () => ({ id: "", label: "", price: "", originalPrice: "", desc: "" });

export default function Catalog() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const loadCatalog = async () => {
    try {
      const [catRes, svcRes] = await Promise.all([
        api.get("/services/categories"),
        api.get("/services"),
      ]);
      setCategories(catRes.categories);
      setServices(svcRes.services);
    } catch (err) {
      setError(err.message || "Could not load the catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCatalog(); }, []);

  const handleToggle = async (svc) => {
    setTogglingId(svc._id);
    try {
      const { service: updated } = await api.patch(`/services/${svc._id}/toggle`);
      setServices((list) => list.map((s) => (s._id === updated._id ? { ...s, isActive: updated.isActive } : s)));
    } catch (err) {
      setError(err.message || "Could not update this service.");
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-black/10 border-t-[var(--color-gold)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[24px] font-bold">Catalog</h1>
          <p className="text-black/45 text-[13px] mt-1">{services.length} services live</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="w-10 h-10 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center active:scale-95 transition-transform"
          title="Add service"
        >
          <Plus size={18} />
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 text-[var(--color-danger)] text-[12.5px] rounded-xl px-3 py-2.5 flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" /> {error}
        </div>
      )}

      {categories.map((cat) => {
        const items = services.filter((s) => s.category?._id === cat._id);
        if (!items.length) return null;
        return (
          <div key={cat._id} className="mt-6">
            <h2 className="font-display font-bold text-[14px] text-black/60">{cat.name}</h2>
            <div className="flex flex-col gap-2 mt-2.5">
              {items.map((svc) => (
                <div key={svc._id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-medium truncate">{svc.title}</p>
                    <p className="text-[11px] text-black/38 mt-0.5">{svc.subCategory}{!svc.isActive ? " · Hidden" : ""}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-[12.5px] font-semibold text-[var(--color-gold-deep)]">
                      {svc.isEnquiry ? "Quote" : `₹${svc.startingPrice.toLocaleString("en-IN")}`}
                    </p>
                    <button
                      onClick={() => handleToggle(svc)}
                      disabled={togglingId === svc._id}
                      title={svc.isActive ? "Hide from catalog" : "Show in catalog"}
                      className="w-8 h-8 rounded-lg bg-black/5 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                    >
                      {svc.isActive ? <Eye size={14} className="text-black/60" /> : <EyeOff size={14} className="text-black/30" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {services.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-black/40 text-[13px]">No services yet — add your first one.</p>
        </div>
      )}

      {showForm && (
        <AddServiceForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onCreated={(svc) => {
            setServices((list) => [...list, svc]);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function AddServiceForm({ categories, onClose, onCreated }) {
  const [form, setForm] = useState({
    category: categories[0]?._id || "",
    subCategory: "",
    title: "",
    description: "",
    startingPrice: "",
    isPackage: false,
    isEnquiry: false,
  });
  const [packages, setPackages] = useState([emptyPackage()]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const setPkg = (idx, key) => (e) => {
    const val = e.target.value;
    setPackages((list) => list.map((p, i) => (i === idx ? { ...p, [key]: val } : p)));
  };

  const addPackageRow = () => setPackages((list) => [...list, emptyPackage()]);
  const removePackageRow = (idx) => setPackages((list) => list.filter((_, i) => i !== idx));

  const validate = () => {
    if (!form.category) return "Please select a category.";
    if (!form.subCategory.trim()) return "Sub-category is required.";
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.isEnquiry && (!form.startingPrice || Number(form.startingPrice) < 0)) return "Starting price is required.";
    if (packages.length === 0) return "Add at least one package.";
    for (const p of packages) {
      if (!p.id.trim() || !p.label.trim() || !p.desc.trim() || p.price === "") {
        return "Every package needs an id, label, description, and price.";
      }
    }
    return "";
  };

  const handleSubmit = async () => {
    const v = validate();
    if (v) { setError(v); return; }
    setError("");
    setLoading(true);
    try {
      const payload = {
        ...form,
        startingPrice: form.isEnquiry ? 0 : Number(form.startingPrice),
        packages: packages.map((p) => ({
          id: p.id.trim(),
          label: p.label.trim(),
          price: Number(p.price),
          ...(p.originalPrice ? { originalPrice: Number(p.originalPrice) } : {}),
          desc: p.desc.trim(),
        })),
      };
      const { service } = await api.post("/services", payload);
      onCreated({ ...service, category: categories.find((c) => c._id === form.category) });
    } catch (err) {
      setError(err.message || "Could not create this service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full px-5 pt-5 pb-10 max-h-[88vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-[18px]">Add a service</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-black/5 flex items-center justify-center">
            <X size={15} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="Category">
            <select value={form.category} onChange={set("category")}
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[13.5px] outline-none focus:border-[var(--color-gold)]">
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </Field>

          <Field label="Sub-category">
            <input value={form.subCategory} onChange={set("subCategory")} placeholder="e.g. Car Delivery"
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[13.5px] outline-none focus:border-[var(--color-gold)]" />
          </Field>

          <Field label="Title">
            <input value={form.title} onChange={set("title")} placeholder="e.g. New Home Arrivals Reel"
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[13.5px] outline-none focus:border-[var(--color-gold)]" />
          </Field>

          <Field label="Description">
            <textarea value={form.description} onChange={set("description")} rows={2} placeholder="Short description shown to customers"
              className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[13.5px] outline-none resize-none focus:border-[var(--color-gold)]" />
          </Field>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[12.5px] text-black/60">
              <input type="checkbox" checked={form.isPackage} onChange={set("isPackage")} className="w-4 h-4 accent-[var(--color-ink)]" />
              Bundle / package
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-black/60">
              <input type="checkbox" checked={form.isEnquiry} onChange={set("isEnquiry")} className="w-4 h-4 accent-[var(--color-ink)]" />
              Enquiry-only (no fixed price)
            </label>
          </div>

          {!form.isEnquiry && (
            <Field label="Starting price (₹)">
              <input type="number" min="0" value={form.startingPrice} onChange={set("startingPrice")} placeholder="1999"
                className="w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-[13.5px] outline-none focus:border-[var(--color-gold)]" />
            </Field>
          )}

          <div className="mt-2">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12.5px] font-semibold text-black/55">Packages</p>
              <button onClick={addPackageRow} className="text-[12px] text-[var(--color-gold-deep)] font-semibold">+ Add package</button>
            </div>
            <div className="flex flex-col gap-3">
              {packages.map((p, idx) => (
                <div key={idx} className="border border-black/10 rounded-xl p-3 relative">
                  {packages.length > 1 && (
                    <button onClick={() => removePackageRow(idx)} className="absolute top-2 right-2 text-black/30">
                      <Trash2 size={13} />
                    </button>
                  )}
                  <div className="grid grid-cols-2 gap-2">
                    <input value={p.id} onChange={setPkg(idx, "id")} placeholder="id (e.g. basic)"
                      className="rounded-lg border border-black/10 px-2.5 py-2 text-[12.5px] outline-none focus:border-[var(--color-gold)]" />
                    <input value={p.label} onChange={setPkg(idx, "label")} placeholder="Label (e.g. Basic)"
                      className="rounded-lg border border-black/10 px-2.5 py-2 text-[12.5px] outline-none focus:border-[var(--color-gold)]" />
                    <input type="number" min="0" value={p.price} onChange={setPkg(idx, "price")} placeholder="Price"
                      className="rounded-lg border border-black/10 px-2.5 py-2 text-[12.5px] outline-none focus:border-[var(--color-gold)]" />
                    <input type="number" min="0" value={p.originalPrice} onChange={setPkg(idx, "originalPrice")} placeholder="Original price (optional)"
                      className="rounded-lg border border-black/10 px-2.5 py-2 text-[12.5px] outline-none focus:border-[var(--color-gold)]" />
                  </div>
                  <textarea value={p.desc} onChange={setPkg(idx, "desc")} rows={1} placeholder="What's included"
                    className="w-full mt-2 rounded-lg border border-black/10 px-2.5 py-2 text-[12.5px] outline-none resize-none focus:border-[var(--color-gold)]" />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-[var(--color-danger)] text-[12.5px] bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-2 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3.5 text-[14.5px] active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create service"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[12px] font-semibold text-black/55 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
