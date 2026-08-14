import { Clock, CheckCircle2, XCircle, HardHat, IndianRupee } from "lucide-react";
import { STATUS_LABEL } from "../../constants/bookingStatus.js";

const CFG = {
  pending_admin:    { color: "bg-amber-50 text-amber-700 border border-amber-200", Icon: Clock },
  assigned:         { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: HardHat },
  in_progress:      { color: "bg-emerald-50 text-emerald-700 border border-emerald-200", Icon: HardHat },
  awaiting_payment: { color: "bg-amber-50 text-amber-700 border border-amber-200", Icon: IndianRupee },
  completed:        { color: "bg-black/5 text-black/50 border border-black/10", Icon: CheckCircle2 },
  rejected:         { color: "bg-red-50 text-red-600 border border-red-200", Icon: XCircle },
};

export default function StatusBadge({ status }) {
  const { color, Icon } = CFG[status] || CFG.pending_admin;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-semibold shrink-0 ${color}`}>
      <Icon size={11} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}
