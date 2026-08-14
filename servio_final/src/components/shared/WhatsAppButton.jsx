// Fixed floating WhatsApp button — opens a direct chat with the business number.
// Replace WHATSAPP_NUMBER with the real business number (country code, no + or spaces).
const WHATSAPP_NUMBER = "919811000000";
const DEFAULT_MESSAGE = "Hi! I have a question about Servio.";

export default function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-24 right-4 z-40 w-14 h-14 rounded-full bg-[#25D366] shadow-lg shadow-black/25 flex items-center justify-center active:scale-90 transition-transform"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12.004 2C6.478 2 2 6.477 2 12c0 1.85.505 3.58 1.38 5.062L2 22l5.077-1.34A9.94 9.94 0 0012.004 22C17.53 22 22 17.523 22 12S17.53 2 12.004 2zm0 18.153a8.11 8.11 0 01-4.132-1.13l-.296-.176-3.014.796.805-2.94-.193-.302A8.116 8.116 0 013.85 12c0-4.502 3.653-8.153 8.154-8.153S20.15 7.498 20.15 12s-3.646 8.153-8.146 8.153z"/>
      </svg>
    </a>
  );
}
