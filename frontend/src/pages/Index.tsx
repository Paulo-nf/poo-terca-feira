import { useState, useEffect } from "react";
import {
  API_EVENTS, FALLBACK_EVENTOS,
  type EventResponseDTO, type Evento,
  type IngressoComprado, type PollVisibility,
} from "@/lib/constants";
import { getTicketStatus, mapEvento } from "@/lib/event-utils";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Nav } from "@/components/arena/Nav";
import { Ticker } from "@/components/arena/Ticker";
import { HomePage } from "@/components/arena/HomePage";
import { EventsPage } from "@/components/arena/EventsPage";
import { Footer } from "@/components/arena/Footer";
import { Toast, type ToastVariant } from "@/components/arena/Toast";
import { LoginModal } from "@/components/arena/LoginModal";
import { RegisterPage } from "@/components/arena/RegisterPage";
import { AdminEventsPage } from "@/components/arena/AdminEventsPage";
import { AdminEventForm } from "@/components/arena/AdminEventForm";
import { EventDetailPage } from "@/components/arena/EventDetailPage";
import { PurchaseModal } from "@/components/arena/PurchaseModal";
import { MyTicketsPage } from "@/components/arena/MyTicketsPage";

// ─── Estado do toast padronizado ────────────────────────────────────────────
interface ToastState {
  message: string;
  variant: ToastVariant;
}

// ─── Estado de compra pendente ───────────────────────────────────────────────
interface PendingPurchase {
  evento: Evento;
  quantidade: number;
}

function Shell() {
  const [page, setPage] = useState("home");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [pendingPurchase, setPendingPurchase] = useState<PendingPurchase | null>(null);
  const [ingressos, setIngressos] = useState<IngressoComprado[]>([]);
  const [pollVisibility, setPollVisibility] = useState<PollVisibility>("visible");

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetch(API_EVENTS)
      .then((r) => r.json())
      .then((d: EventResponseDTO[]) => {
        setEventos(Array.isArray(d) ? d.map(mapEvento) : []);
        setLoading(false);
      })
      .catch(() => {
        setEventos(FALLBACK_EVENTOS);
        setLoading(false);
      });
  }, []);

  // ─── Toast padronizado ─────────────────────────────────────────────────────
  const showToast = (message: string, variant: ToastVariant = "info") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3500);
  };

  // ─── Compra ────────────────────────────────────────────────────────────────
  const handleComprar = (evento: Evento, quantidade = 1) => {
    if (getTicketStatus(evento.ingressosDisponiveis).esgotado) return;
    if (!isAuthenticated) {
      setLoginOpen(true);
      showToast("Faça login para comprar ingressos.", "warning");
      return;
    }
    setPendingPurchase({ evento, quantidade });
  };

  const handleCompraConfirmada = (ingresso: IngressoComprado) => {
    // Atualiza ingressos disponíveis
    setEventos((prev) =>
      prev.map((e) =>
        e.id === ingresso.eventoId
          ? { ...e, ingressosDisponiveis: Math.max(0, e.ingressosDisponiveis - ingresso.quantidade) }
          : e
      )
    );
    setIngressos((prev) => [ingresso, ...prev]);
    showToast(`🎟️ Compra confirmada! Código: ${ingresso.codigoConfirmacao}`, "success");
    // Após fechar o modal, redireciona para meus ingressos
    setPendingPurchase(null);
    setPage("meus-ingressos");
  };

  // ─── Navegação de eventos ──────────────────────────────────────────────────
  const handleSelectEvento = (evento: Evento) => {
    setEventoSelecionado(evento);
    setPage("evento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleVerEventoById = (id: number) => {
    const ev = eventos.find((e) => e.id === id);
    if (ev) handleSelectEvento(ev);
  };

  // ─── Admin ─────────────────────────────────────────────────────────────────
  const handleSalvarEvento = (evento: Evento) => {
    setEventos((prev) => {
      if (page === "admin-criar" || evento.id === 0) {
        const nextId = (prev.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1;
        return [...prev, { ...evento, id: nextId }];
      }
      return prev.map((e) => (e.id === evento.id ? evento : e));
    });
    showToast(page === "admin-criar" ? "Evento criado com sucesso!" : "Alterações salvas com sucesso!", "success");
    setPage("admin");
    setEditandoEvento(null);
  };

  const handleExcluir = (evento: Evento) => {
    if (!confirm(`Excluir "${evento.nome}"? Esta ação não pode ser desfeita.`)) return;
    setEventos((prev) => prev.filter((e) => e.id !== evento.id));
    showToast("Evento excluído.", "warning");
  };

  const handleTogglePoll = () => {
    const next: PollVisibility = pollVisibility === "visible" ? "hidden" : "visible";
    setPollVisibility(next);
    showToast(
      next === "visible" ? "Enquete ativada e visível para o público." : "Enquete ocultada do público.",
      next === "visible" ? "success" : "warning"
    );
  };

  return (
    <div>
      <Nav
        page={page}
        setPage={setPage}
        onRequestLogin={() => setLoginOpen(true)}
      />
      {!page.startsWith("admin") && <Ticker eventos={eventos} />}

      {page === "home" && (
        <HomePage
          eventos={eventos}
          loading={loading}
          onComprar={handleComprar}
          onSelectEvento={handleSelectEvento}
          setPage={setPage}
          pollVisibility={pollVisibility}
          onTogglePoll={isAdmin ? handleTogglePoll : undefined}
          isAdmin={isAdmin}
        />
      )}
      {page === "eventos" && (
        <EventsPage
          eventos={eventos}
          loading={loading}
          onComprar={handleComprar}
          onSelectEvento={handleSelectEvento}
        />
      )}
      {page === "evento" && eventoSelecionado && (
        <EventDetailPage
          evento={eventoSelecionado}
          onVoltar={() => setPage("eventos")}
          onComprar={(ev, qtd) => {
            if (!isAuthenticated) {
              setLoginOpen(true);
              showToast("Faça login para comprar ingressos.", "warning");
              return;
            }
            setPendingPurchase({ evento: ev, quantidade: qtd });
          }}
        />
      )}
      {page === "registro" && (
        <RegisterPage
          onSuccess={(name) => {
            showToast(`Bem-vindo(a), ${name.split(" ")[0]}! Conta criada com sucesso.`, "success");
            setPage("home");
          }}
          onCancel={() => setPage("home")}
        />
      )}
      {page === "ajuda" && (
        <Placeholder title="Central de Ajuda" emoji="🛟" desc="Esta seção está sendo desenvolvida. Em breve você encontrará respostas para as suas dúvidas aqui." />
      )}
      {page === "conta" && (
        <Placeholder title="Minha Conta" emoji="👤" desc="Em breve você poderá editar seus dados e preferências aqui." />
      )}
      {page === "meus-ingressos" && (
        <MyTicketsPage ingressos={ingressos} onVerEvento={handleVerEventoById} />
      )}

      {page === "admin" && isAdmin && (
        <AdminEventsPage
          eventos={eventos}
          onCriar={() => { setEditandoEvento(null); setPage("admin-criar"); }}
          onEditar={(e) => { setEditandoEvento(e); setPage("admin-editar"); }}
          onExcluir={handleExcluir}
        />
      )}
      {page === "admin-criar" && isAdmin && (
        <AdminEventForm
          mode="criar"
          onVoltar={() => setPage("admin")}
          onSalvar={handleSalvarEvento}
        />
      )}
      {page === "admin-editar" && isAdmin && editandoEvento && (
        <AdminEventForm
          mode="editar"
          evento={editandoEvento}
          onVoltar={() => setPage("admin")}
          onSalvar={handleSalvarEvento}
          onCancelarEvento={(e) => {
            setEventos((prev) => prev.map((x) => x.id === e.id ? { ...x, ingressosDisponiveis: 0 } : x));
            showToast("Evento cancelado. Ingressos marcados como esgotados.", "warning");
            setPage("admin");
          }}
          onDuplicar={(e) => {
            const nextId = (eventos.reduce((m, ev) => Math.max(m, ev.id), 0) || 0) + 1;
            const dup = { ...e, id: nextId, nome: `${e.nome} (cópia)` };
            setEventos((prev) => [...prev, dup]);
            showToast("Evento duplicado com sucesso!", "success");
            setEditandoEvento(dup);
          }}
        />
      )}
      {page.startsWith("admin") && !isAdmin && (
        <Placeholder title="Acesso Restrito" emoji="🔒" desc="Esta área é exclusiva para administradores. Faça login com uma conta de administrador para continuar." />
      )}

      <Footer />

      {toast && <Toast message={toast.message} variant={toast.variant} />}

      {/* Modal de compra */}
      {pendingPurchase && (
        <PurchaseModal
          evento={pendingPurchase.evento}
          quantidade={pendingPurchase.quantidade}
          onClose={() => setPendingPurchase(null)}
          onSuccess={handleCompraConfirmada}
        />
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onGoToRegister={() => setPage("registro")}
        onSuccess={(name) => showToast(`Bem-vindo(a) de volta, ${name}!`, "success")}
      />
    </div>
  );
}

function Placeholder({ title, emoji, desc }: { title: string; emoji: string; desc: string }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-heading text-xl font-extrabold text-blue-dark mb-2">{title}</h3>
      <p className="max-w-xs mx-auto text-sm">{desc}</p>
    </div>
  );
}

const Index = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);

export default Index;
