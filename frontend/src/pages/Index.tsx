import { useState, useEffect } from "react";
import { API_EVENTS, FALLBACK_EVENTOS, type EventResponseDTO, type Evento } from "@/lib/constants";
import { getTicketStatus, mapEvento } from "@/lib/event-utils";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Nav } from "@/components/arena/Nav";
import { Ticker } from "@/components/arena/Ticker";
import { HomePage } from "@/components/arena/HomePage";
import { EventsPage } from "@/components/arena/EventsPage";
import { Footer } from "@/components/arena/Footer";
import { Toast } from "@/components/arena/Toast";
import { LoginModal } from "@/components/arena/LoginModal";
import { RegisterPage } from "@/components/arena/RegisterPage";
import { AdminEventsPage } from "@/components/arena/AdminEventsPage";
import { AdminEventForm } from "@/components/arena/AdminEventForm";
import { EventDetailPage } from "@/components/arena/EventDetailPage";

function Shell() {
  const [page, setPage] = useState("home");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleComprar = (evento: Evento) => {
    if (getTicketStatus(evento.ingressosDisponiveis).esgotado) return;
    if (!isAuthenticated) {
      setLoginOpen(true);
      showToast("Faça login para comprar ingressos.");
      return;
    }
    showToast(`🎟️ Redirecionando para compra: ${evento.nome}`);
  };

  const handleSelectEvento = (evento: Evento) => {
    setEventoSelecionado(evento);
    setPage("evento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSalvarEvento = (evento: Evento) => {
    setEventos((prev) => {
      if (page === "admin-criar" || evento.id === 0) {
        const nextId = (prev.reduce((m, e) => Math.max(m, e.id), 0) || 0) + 1;
        return [...prev, { ...evento, id: nextId }];
      }
      return prev.map((e) => (e.id === evento.id ? evento : e));
    });
    showToast(page === "admin-criar" ? "Evento criado!" : "Alterações salvas!");
    setPage("admin");
    setEditandoEvento(null);
  };

  const handleExcluir = (evento: Evento) => {
    if (!confirm(`Excluir "${evento.nome}"?`)) return;
    setEventos((prev) => prev.filter((e) => e.id !== evento.id));
    showToast("Evento excluído.");
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
        <HomePage eventos={eventos} loading={loading} onComprar={handleComprar} onSelectEvento={handleSelectEvento} setPage={setPage} />
      )}
      {page === "eventos" && (
        <EventsPage eventos={eventos} loading={loading} onComprar={handleComprar} onSelectEvento={handleSelectEvento} />
      )}
      {page === "evento" && eventoSelecionado && (
        <EventDetailPage
          evento={eventoSelecionado}
          onVoltar={() => setPage("eventos")}
          onComprar={(ev, qtd) => {
            if (!isAuthenticated) {
              setLoginOpen(true);
              showToast("Faça login para comprar ingressos.");
              return;
            }
            showToast(`🎟️ ${qtd} ingresso(s) para ${ev.nome} reservado(s)!`);
          }}
        />
      )}
      {page === "registro" && (
        <RegisterPage
          onSuccess={(name) => { showToast(`Bem-vindo, ${name.split(" ")[0]}!`); setPage("home"); }}
          onCancel={() => setPage("home")}
        />
      )}
      {page === "ajuda" && <Placeholder title="Em breve" emoji="🚧" desc="Esta seção ainda está sendo desenvolvida." />}
      {page === "conta" && <Placeholder title="Minha conta" emoji="👤" desc="Em breve você poderá editar seus dados aqui." />}
      {page === "meus-ingressos" && <Placeholder title="Meus ingressos" emoji="🎟️" desc="Aqui ficarão os ingressos comprados." />}

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
            showToast("Evento cancelado.");
            setPage("admin");
          }}
          onDuplicar={(e) => {
            const nextId = (eventos.reduce((m, ev) => Math.max(m, ev.id), 0) || 0) + 1;
            const dup = { ...e, id: nextId, nome: `${e.nome} (cópia)` };
            setEventos((prev) => [...prev, dup]);
            showToast("Evento duplicado.");
            setEditandoEvento(dup);
          }}
        />
      )}
      {page.startsWith("admin") && !isAdmin && (
        <Placeholder title="Acesso restrito" emoji="🔒" desc="Esta área é exclusiva para administradores." />
      )}

      <Footer />
      {toast && <Toast message={toast} />}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onGoToRegister={() => setPage("registro")}
        onSuccess={(email) => showToast(`Bem-vindo, ${email}!`)}
      />
    </div>
  );
}

function Placeholder({ title, emoji, desc }: { title: string; emoji: string; desc: string }) {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <div className="text-5xl mb-4">{emoji}</div>
      <h3 className="font-heading text-xl font-extrabold text-blue-dark mb-2">{title}</h3>
      <p>{desc}</p>
    </div>
  );
}

const Index = () => (
  <AuthProvider>
    <Shell />
  </AuthProvider>
);

export default Index;
