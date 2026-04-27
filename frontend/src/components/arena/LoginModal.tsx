import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onGoToRegister: () => void;
  onSuccess?: (name: string) => void;
}

export function LoginModal({ open, onClose, onGoToRegister, onSuccess }: LoginModalProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setEmail(""); setPassword(""); setError(null); setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await login(email.trim(), password);
      onSuccess?.(email);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-card w-full max-w-[420px] rounded-2xl shadow-2xl p-7 relative animate-[fade-up_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-8 h-8 rounded-full text-muted-foreground hover:bg-surface2 transition-colors"
        >
          ✕
        </button>

        <div className="mb-5">
          <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-blue mb-1">Bem-vindo</p>
          <h2 className="font-heading text-2xl font-black tracking-tight text-blue-dark">Entrar na Arena</h2>
          <p className="text-sm text-muted-foreground mt-1">Acesse sua conta para comprar ingressos.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">E-mail</span>
            <input
              type="email" required autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
              placeholder="voce@exemplo.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Senha</span>
            <input
              type="password" required minLength={4}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <div className="text-[13px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="mt-2 bg-blue text-primary-foreground py-3 rounded-xl font-extrabold text-sm tracking-wide hover:bg-blue-dark transition-colors disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-[13px] text-muted-foreground text-center mt-4">
          Não tem conta?{" "}
          <button
            onClick={() => { onClose(); onGoToRegister(); }}
            className="font-bold text-blue hover:underline"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  );
}
