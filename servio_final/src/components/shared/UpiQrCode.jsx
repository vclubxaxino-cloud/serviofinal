import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

// Renders a genuine scannable UPI QR (upi://pay?...) — any UPI app
// (GPay, PhonePe, Paytm, BHIM) can scan this directly. No payment
// gateway involved; this is just the standard UPI deep-link format.
export default function UpiQrCode({ upiId, payeeName, amount, note, size = 208 }) {
  const canvasRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!upiId || !canvasRef.current) return;
    const upiUri =
      `upi://pay?pa=${encodeURIComponent(upiId)}` +
      `&pn=${encodeURIComponent(payeeName || "Servio")}` +
      `&am=${encodeURIComponent(amount)}` +
      `&cu=INR` +
      (note ? `&tn=${encodeURIComponent(note)}` : "");

    QRCode.toCanvas(canvasRef.current, upiUri, { width: size, margin: 1 }, (err) => {
      if (err) setError(true);
    });
  }, [upiId, payeeName, amount, note, size]);

  if (error) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-black/5 rounded-2xl text-[11px] text-black/40 text-center px-4"
      >
        Couldn't generate QR — use the UPI ID below instead.
      </div>
    );
  }

  return <canvas ref={canvasRef} className="rounded-2xl" />;
}
