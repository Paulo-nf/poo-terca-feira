export type ToastVariant = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  variant?: ToastVariant;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "bg-emerald-700 text-white",
  error:   "bg-destructive text-white",
  warning: "bg-amber-600 text-white",
  info:    "bg-blue-dark text-primary-foreground",
};

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✅",
  error:   "❌",
  warning: "⚠️",
  info:    "ℹ️",
};

export function Toast({ message, variant = "info" }: ToastProps) {
  return (
    <div
      className={`fixed bottom-7 right-7 rounded-lg px-5 py-3.5 flex items-center gap-2.5 text-sm font-bold shadow-lg z-[999] animate-[fade-up_0.3s_ease] max-w-[360px] ${VARIANT_STYLES[variant]}`}
    >
      <span>{VARIANT_ICONS[variant]}</span>
      <span>{message}</span>
    </div>
  );
}
