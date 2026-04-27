import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserMenuProps {
  onRequestLogin: () => void;
  setPage: (page: string) => void;
}

function initial(name: string) {
  return (name?.trim()?.[0] ?? "?").toUpperCase();
}

export function UserMenu({ onRequestLogin, setPage }: UserMenuProps) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Visitante: clique abre direto o popup de login
  if (!isAuthenticated) {
    return (
      <button
        onClick={onRequestLogin}
        className="w-[38px] h-[38px] bg-surface2 rounded-[10px] flex items-center justify-center text-[15px] text-muted-foreground hover:bg-blue-light hover:text-blue transition-colors"
        aria-label="Entrar"
      >
        👤
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center font-heading font-black text-sm bg-blue text-primary-foreground hover:bg-blue-dark transition-colors"
        aria-label="Menu do usuário"
      >
        {initial(user!.name)}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[230px] bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-[fade-up_0.18s_ease]">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-extrabold text-blue-dark truncate">{user!.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user!.email}</p>
            {isAdmin && (
              <span className="inline-block mt-1.5 text-[10px] font-extrabold tracking-wider uppercase text-blue bg-blue-light px-2 py-0.5 rounded">
                Administrador
              </span>
            )}
          </div>

          <ul className="py-1.5 text-sm">
            <MenuItem icon="👤" label="Minha conta" onClick={() => { setOpen(false); setPage("conta"); }} />
            {isAdmin ? (
              <MenuItem icon="🛠️" label="Painel do administrador" onClick={() => { setOpen(false); setPage("admin"); }} />
            ) : (
              <MenuItem icon="🎟️" label="Meus ingressos" onClick={() => { setOpen(false); setPage("meus-ingressos"); }} />
            )}
            <li className="border-t border-border my-1" />
            <MenuItem icon="↩" label="Sair" danger onClick={() => { setOpen(false); logout(); }} />
          </ul>
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 flex items-center gap-2.5 hover:bg-blue-light transition-colors ${
          danger ? "text-destructive" : "text-blue-dark"
        }`}
      >
        <span className="w-5 text-center">{icon}</span>
        <span className="font-bold">{label}</span>
      </button>
    </li>
  );
}
