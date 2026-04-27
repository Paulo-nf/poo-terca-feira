import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface RegisterPageProps {
  onSuccess: (name: string) => void;
  onCancel: () => void;
}

export function RegisterPage({ onSuccess, onCancel }: RegisterPageProps) {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    if (password.length < 6) { setError("A senha precisa ter no mínimo 6 caracteres."); return; }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      onSuccess(name.trim());
    } catch (err: any) {
      setError(err?.message || "Não foi possível criar a conta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-12 py-12 min-h-[80vh] flex items-start justify-center max-md:px-5">
      <div className="w-full max-w-[480px] bg-card border border-border rounded-2xl shadow-md p-8">
        <div className="mb-6">
          <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-blue mb-1">Cadastro</p>
          <h1 className="font-heading text-3xl font-black tracking-tight text-blue-dark">Criar conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Em segundos você está pronto pra garantir seu ingresso.</p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Nome completo</span>
            <input
              required minLength={2}
              value={name} onChange={(e) => setName(e.target.value)}
              className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
              placeholder="Seu nome"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">E-mail</span>
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
              placeholder="voce@exemplo.com"
            />
          </label>

          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Senha</span>
              <input
                type="password" required minLength={6}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
                placeholder="••••••••"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Confirmar</span>
              <input
                type="password" required minLength={6}
                value={confirm} onChange={(e) => setConfirm(e.target.value)}
                className="bg-surface2 border-[1.5px] border-border rounded-[10px] px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue transition-colors"
                placeholder="••••••••"
              />
            </label>
          </div>

          {error && (
            <div className="text-[13px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 mt-2">
            <button
              type="button" onClick={onCancel}
              className="px-5 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:bg-surface2 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 bg-blue text-primary-foreground py-3 rounded-xl font-extrabold text-sm tracking-wide hover:bg-blue-dark transition-colors disabled:opacity-60"
            >
              {loading ? "Criando..." : "Criar conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
