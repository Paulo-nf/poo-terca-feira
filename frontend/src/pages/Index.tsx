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
import { PaymentPage } from "@/components/arena/PaymentPage";
import { MyTicketsPage } from "@/components/arena/MyTicketsPage";
import { type TicketDTO } from "@/lib/tickets-api";

function Shell() {
    const [page, setPage] = useState("home");
    const [eventos, setEventos] = useState<Evento[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [loginOpen, setLoginOpen] = useState(false);
    const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
    const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
    const [ingressoCompra, setIngressoCompra] = useState<{ evento: Evento; quantidade: number } | null>(null);
    const { isAuthenticated, isAdmin, token } = useAuth();

    // ─── Estado global da enquete ───
    const [enqueteVisivel, setEnqueteVisivel] = useState(true);
    const [enqueteIds, setEnqueteIds] = useState<number[]>([]);

    useEffect(() => {
        fetch(API_EVENTS)
            .then((r) => r.json())
            .then((d: EventResponseDTO[]) => {
                const mapped = Array.isArray(d) ? d.map(mapEvento) : [];
                setEventos(mapped);
                // Inicializa enquete com os 3 primeiros eventos por padrão
                setEnqueteIds(mapped.slice(0, 3).map((e) => e.id));
                setLoading(false);
            })
            .catch(() => {
                setEventos(FALLBACK_EVENTOS);
                setEnqueteIds(FALLBACK_EVENTOS.slice(0, 3).map((e) => e.id));
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

    const handleSalvarEvento = async (evento: Evento) => {
        // Certifique-se de que extraiu o 'token' do useAuth() no início do componente:
        // const { isAuthenticated, isAdmin, token } = useAuth();

        if (!token) {
            showToast("Erro: Você não está autenticado.");
            return;
        }

        const isCriando = page === "admin-criar" || evento.id === 0;
        const url = isCriando ? API_EVENTS : `${API_EVENTS}/${evento.id}`;
        const method = isCriando ? "POST" : "PUT";

        // Formata a data para incluir o horário exigido pelo backend (ex: "2026-04-15T20:00:00")
        // New code (Removed the final :00 for the seconds)
        const dataFormatada = evento.data.includes("T")
            ? evento.data
            : `${evento.data}T20:00`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                // 🔥 TRADUÇÃO: Mapeando os campos do React (PT) para o Spring Boot (EN)
                body: JSON.stringify({
                    name: evento.nome,
                    description: evento.descricao || "",
                    imageUrl: evento.imagemUrl || "",
                    price: evento.preco,
                    availableTickets: evento.ingressosDisponiveis,
                    status: "ATIVO",         // Campo obrigatório no DTO
                    location: "Arena PE",    // Campo obrigatório no DTO
                    eventDate: dataFormatada // Formato completo (Data + Hora)
                }),
            });

            if (!response.ok) {
                // Lê o JSON de erro do Spring Boot para sabermos exatamente o que falhou
                const errorData = await response.json().catch(() => null);
                console.error("Erros de validação do backend:", errorData);

                if (response.status === 403) throw new Error("Acesso negado. Token inválido/expirado.");

                const serverMessage = errorData?.message || errorData?.details || `Erro ${response.status}`;
                throw new Error(serverMessage);
            }

            // 1. Pega o JSON completo da resposta
            const responseBody = await response.json();

            // 2. Extrai o evento de dentro do wrapper "dados" (se ele existir)
            // Se o backend retornar direto o objeto, ele usa o responseBody.
            const eventoSalvo = responseBody.dados ? responseBody.dados : responseBody;

            // Atualiza a tela usando a função mapEvento, preservando a categoria escolhida no form
            const eventoMapeado = { ...mapEvento(eventoSalvo), categoria: evento.categoria };
            setEventos((prev) => {
                if (isCriando) return [...prev, eventoMapeado];
                return prev.map((e) => (e.id === eventoSalvo.id ? eventoMapeado : e));
            });

            showToast(isCriando ? "Evento criado no banco de dados!" : "Alterações salvas no banco!");
            setPage("admin");
            setEditandoEvento(null);

        } catch (error) {
            console.error("Erro ao salvar:", error);
            showToast(`Erro ao salvar: ${error instanceof Error ? error.message : 'Falha desconhecida'}`);
        }
    };

    const handleExcluir = async (evento: Evento) => {
        // 1. Confirmação do usuário
        if (!confirm(`Tem certeza que deseja excluir o evento "${evento.nome}"?`)) return;

        // 2. Verifica se o token existe (garante que é o admin logado)
        if (!token) {
            showToast("Erro: Você não está autenticado.");
            return;
        }

        try {
            // 3. Envia a requisição DELETE para o Spring Boot
            const response = await fetch(`${API_EVENTS}/${evento.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            // 4. Verifica se o backend aceitou a exclusão
            if (!response.ok) {
                if (response.status === 403) throw new Error("Acesso negado. Token inválido/expirado.");
                throw new Error(`Erro no servidor: ${response.status}`);
            }

            // 5. Se o backend deletou com sucesso, removemos da tela (React state)
            setEventos((prev) => prev.filter((e) => e.id !== evento.id));
            setEnqueteIds((prev) => prev.filter((id) => id !== evento.id));

            showToast("Evento excluído do banco de dados com sucesso!");

        } catch (error) {
            console.error("Erro ao excluir:", error);
            showToast(`Erro ao excluir: ${error instanceof Error ? error.message : 'Falha desconhecida'}`);
        }
    };

    return (
        <div>
            <Nav page={page} setPage={setPage} onRequestLogin={() => setLoginOpen(true)} />
            {!page.startsWith("admin") && <Ticker eventos={eventos} />}

            {page === "home" && (
                <HomePage
                    eventos={eventos}
                    loading={loading}
                    onComprar={handleComprar}
                    onSelectEvento={handleSelectEvento}
                    setPage={setPage}
                    enqueteVisivel={enqueteVisivel}
                    enqueteIds={enqueteIds}
                />
            )}
            {page === "eventos" && (
                <EventsPage eventos={eventos} loading={loading} onSelectEvento={handleSelectEvento} />
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
                        setIngressoCompra({ evento: ev, quantidade: qtd });
                        setPage("pagamento");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            )}
            {page === "pagamento" && ingressoCompra && isAuthenticated && (
                <PaymentPage
                    evento={ingressoCompra.evento}
                    quantidade={ingressoCompra.quantidade}
                    onVoltar={() => {
                        setEventoSelecionado(ingressoCompra.evento);
                        setPage("evento");
                    }}
                    onSucesso={(ticket: TicketDTO) => {
                        setEventos((prev) =>
                            prev.map((e) =>
                                e.id === ticket.eventId
                                    ? { ...e, ingressosDisponiveis: Math.max(0, e.ingressosDisponiveis - ticket.quantity) }
                                    : e
                            )
                        );
                        setIngressoCompra(null);
                        setPage("meus-ingressos");
                        showToast(`Ingressos para "${ticket.eventName}" confirmados!`);
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
            {page === "meus-ingressos" && isAuthenticated && (
                <MyTicketsPage
                    onVerEvento={(eventoId) => {
                        const ev = eventos.find((e) => e.id === eventoId);
                        if (ev) { setEventoSelecionado(ev); setPage("evento"); }
                    }}
                />
            )}
            {page === "meus-ingressos" && !isAuthenticated && (
                <Placeholder title="Acesso restrito" emoji="🔒" desc="Faça login para ver seus ingressos." />
            )}

            {page === "admin" && isAdmin && (
                <AdminEventsPage
                    eventos={eventos}
                    onCriar={() => { setEditandoEvento(null); setPage("admin-criar"); }}
                    onEditar={(e) => { setEditandoEvento(e); setPage("admin-editar"); }}
                    onExcluir={handleExcluir}
                    enqueteVisivel={enqueteVisivel}
                    enqueteIds={enqueteIds}
                    onToggleEnquete={(v) => {
                        setEnqueteVisivel(v);
                        showToast(v ? "Enquete agora visível para os usuários." : "Enquete ocultada dos usuários.");
                    }}
                    onSalvarEnquete={(ids) => {
                        setEnqueteIds(ids);
                    }}
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
