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

function Shell() {
  const [page, setPage] = useState("home");
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
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

  return (
    <div>
      <Nav
        page={page}
        setPage={setPage}
        onRequestLogin={() => setLoginOpen(true)}
      />
      <Ticker eventos={eventos} />

      {page === "home" && (
        <HomePage eventos={eventos} loading={loading} onComprar={handleComprar} setPage={setPage} />
      )}
      {page === "eventos" && (
        <EventsPage eventos={eventos} loading={loading} onComprar={handleComprar} />
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
      {page === "admin" && isAdmin && <Placeholder title="Painel do administrador" emoji="🛠️" desc="Gestão de eventos em breve." />}

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
