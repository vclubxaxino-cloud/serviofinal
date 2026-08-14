import { useState, useEffect } from "react";
import { Check, X, MapPin, Phone, CreditCard, FileText, Eye } from "lucide-react";
import { api } from "../../api/client.js";
import { pincodeAreas } from "../../api/mockData.js";

export default function WorkerApprovals() {
  const [pending, setPending] = useState([]);
  const [decided, setDecided] = useState([]);
  const [viewDoc, setViewDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { workers } = await api.get("/workers/pending");
        setPending(workers);
      } catch (err) {
        setError(err.message || "Could not load worker applications.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const decide = async (worker, approve) => {
    setActingId(worker._id);
    try {
      const { worker: updated } = await api.patch(`/workers/${worker._id}/${approve ? "approve" : "reject"}`);
      setPending((list) => list.filter((w) => w._id !== worker._id));
      setDecided((list) => [{ ...updated, approved: approve }, ...list]);
    } catch (err) {
      setError(err.message || "Could not update this application. Please try again.");
    } finally {
      setActingId(null);
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
      <h1 className="font-display text-[24px] font-bold">Worker KYC Reviews</h1>
      <p className="text-black/45 text-[13px] mt-1">
        {pending.length > 0 ? `${pending.length} application${pending.length > 1 ? "s" : ""} awaiting your review` : "All caught up"}
      </p>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-100 text-[var(--color-danger)] text-[12.5px] rounded-xl px-3 py-2.5">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-5">
        {pending.map((w) => (
          <div key={w._id} className="bg-white border border-black/10 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-black/5">
              <div className="w-11 h-11 rounded-full bg-[var(--color-ink)] flex items-center justify-center text-[var(--color-gold)] font-display font-bold shrink-0 text-[16px]">
                {w.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[15px]">{w.name}</p>
                <div className="flex items-center gap-1 text-black/40 text-[11.5px] mt-0.5">
                  <Phone size={11} /> {w.phone}
                </div>
              </div>
              <span className="text-[10.5px] font-semibold bg-[var(--color-warn)]/15 text-[var(--color-gold-deep)] px-2.5 py-1 rounded-full">
                Pending
              </span>
            </div>

            {/* Details */}
            <div className="px-4 py-3 space-y-2.5">
              <InfoRow icon={<CreditCard size={13} />} label="Aadhaar" value={w.aadhaarNumber} />
              <InfoRow icon={<FileText size={13} />} label="KYC Docs" value={w.kycDocType} />
              <InfoRow
                icon={<MapPin size={13} />}
                label="Service areas"
                value={(w.serviceAreas || []).map(p => pincodeAreas[p] || p).join(", ") || "—"}
              />
            </div>

            {/* Skills */}
            <div className="px-4 pb-3 flex flex-wrap gap-1.5">
              {w.skills.map((s) => (
                <span key={s} className="text-[10.5px] bg-black/5 text-black/60 px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>

            {/* KYC doc preview button */}
            <div className="px-4 pb-3">
              <button
                onClick={() => setViewDoc(w)}
                className="w-full flex items-center justify-center gap-1.5 border border-black/10 text-black/55 font-medium rounded-xl py-2.5 text-[12.5px]"
              >
                <Eye size={13} /> View uploaded documents
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 px-4 pb-4">
              <button
                onClick={() => decide(w, false)}
                disabled={actingId === w._id}
                className="flex-1 flex items-center justify-center gap-1.5 border border-[var(--color-danger)]/30 text-[var(--color-danger)] font-semibold rounded-xl py-3 text-[13px] active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                <X size={15} /> Reject
              </button>
              <button
                onClick={() => decide(w, true)}
                disabled={actingId === w._id}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-ink)] text-white font-semibold rounded-xl py-3 text-[13px] active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                <Check size={15} /> Approve
              </button>
            </div>

            <p className="text-[10.5px] text-black/30 text-center pb-3">Applied {new Date(w.createdAt).toLocaleDateString("en-IN")}</p>
          </div>
        ))}

        {pending.length === 0 && (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-[var(--color-ok)]/15 flex items-center justify-center mx-auto mb-3">
              <Check size={22} className="text-[var(--color-ok)]" />
            </div>
            <p className="font-semibold text-[15px]">All reviewed</p>
            <p className="text-black/40 text-[13px] mt-1">No pending worker applications.</p>
          </div>
        )}
      </div>

      {decided.length > 0 && (
        <div className="mt-7">
          <h2 className="font-display font-bold text-[14px] mb-3 text-black/50">Recently reviewed</h2>
          <div className="flex flex-col gap-2">
            {decided.map((w) => (
              <div key={w._id} className="flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3">
                <div>
                  <p className="text-[13.5px] font-medium">{w.name}</p>
                  <p className="text-[11px] text-black/40">{w.skills.join(", ")}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  w.approved ? "bg-[var(--color-ok)]/15 text-[var(--color-ok)]" : "bg-[var(--color-danger)]/10 text-[var(--color-danger)]"
                }`}>
                  {w.approved ? "Approved" : "Rejected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Doc preview modal */}
      {viewDoc && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end" onClick={() => setViewDoc(null)}>
          <div className="bg-white rounded-t-3xl w-full px-6 pt-6 pb-10 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-black/15 rounded-full mx-auto mb-5" />
            <h2 className="font-display font-bold text-[17px]">{viewDoc.name}'s Documents</h2>
            <p className="text-black/45 text-[12.5px] mt-0.5 mb-5">Uploaded during signup</p>
            <div className="flex flex-col gap-4">
              <DocPreview
                label="Aadhaar Card"
                sub={viewDoc.aadhaarNumber ? `No. ${viewDoc.aadhaarNumber}` : "Uploaded at signup"}
                url={viewDoc.kycDocuments?.aadhaarFileUrl}
              />
              <DocPreview
                label={DOC_TYPE_LABEL[viewDoc.kycDocType] || "Second ID document"}
                sub="Secondary identity document"
                url={viewDoc.kycDocuments?.secondaryFileUrl}
              />
            </div>
            <button onClick={() => setViewDoc(null)} className="mt-5 w-full border border-black/10 rounded-xl py-3 text-[14px] font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const DOC_TYPE_LABEL = {
  aadhaar_pan: "PAN Card",
  voter_id: "Voter ID",
  driving_licence: "Driving Licence",
  passport: "Passport",
};

function DocPreview({ label, sub, url }) {
  // Cloudinary returns a full URL (https://res.cloudinary.com/...) — use it as-is.
  const fullUrl = url || null;
  const isPdf = url?.toLowerCase().includes(".pdf") || url?.toLowerCase().includes("/raw/");

  return (
    <div className="border border-black/10 rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-paper)]">
        <FileText size={16} className="text-[var(--color-gold-deep)] shrink-0" />
        <div>
          <p className="text-[13.5px] font-medium">{label}</p>
          <p className="text-[11px] text-black/40">{sub}</p>
        </div>
      </div>
      {fullUrl ? (
        isPdf ? (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer"
            className="block px-4 py-4 text-center text-[13px] text-[var(--color-gold-deep)] font-semibold border-t border-black/8">
            Open PDF document →
          </a>
        ) : (
          <a href={fullUrl} target="_blank" rel="noopener noreferrer">
            <img src={fullUrl} alt={label} className="w-full max-h-64 object-contain bg-black/5 border-t border-black/8" />
          </a>
        )
      ) : (
        <p className="px-4 py-4 text-center text-[12px] text-black/35 border-t border-black/8">No file uploaded</p>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-black/35 mt-0.5 shrink-0">{icon}</span>
      <div>
        <span className="text-[10.5px] text-black/35 block">{label}</span>
        <span className="text-[13px] font-medium">{value || "—"}</span>
      </div>
    </div>
  );
}
