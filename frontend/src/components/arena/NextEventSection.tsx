import { useState } from "react";
import { CATEGORIES, type Evento } from "@/lib/constants";
import { getTicketStatus } from "@/lib/event-utils";
import { useCountdown } from "@/hooks/useCountdown";

interface NextEventSectionProps {
  eventos: Evento[];
  loading: boolean;
  onComprar: (evento: Evento) => void;
  onVotar: (evento: Evento) => void;
  enqueteVisivel: boolean;
  enqueteIds: number[];
}

const VOTO_STORAGE_KEY = "arena_enquete_voto";

export function NextEventSection({
  eventos,
  loading,
  onComprar,
  onVotar,
  enqueteVisivel,
  enqueteIds,
}: NextEventSectionProps) {
  // Lembra em qual evento este navegador já votou (1 voto por navegador).
  const [voted, setVoted] = useState<number | null>(() => {
    const raw = localStorage.getItem(VOTO_STORAGE_KEY);
    return raw ? Number(raw) : null;
  });

  const proximo =
    eventos.find((e) => !getTicketStatus(e.ingressosDisponiveis).esgotado) || eventos[0];

  const target = proximo?.data
    ? `${proximo.data}T20:00:00`
    : new Date(Date.now() + 86400000 * 3).toISOString();

  const cd = useCountdown(target);

  // Itens da enquete: apenas os selecionados pelo admin (ou skeleton se loading)
  const enqueteEventos: Evento[] = loading
    ? ([{ id: -1, nome: "Carregando..." }, { id: -2, nome: "..." }, { id: -3, nome: "..." }] as Evento[])
    : enqueteIds.length > 0
    ? eventos.filter((e) => enqueteIds.includes(e.id))
    : [];

  // Se a enquete estiver oculta ou sem itens, só exibe o countdown
  const mostrarEnquete = enqueteVisivel && (loading || enqueteEventos.length > 0);

  const jaVotou = voted !== null;
  const totalVotos = enqueteEventos.reduce((soma, e) => soma + (e.votos || 0), 0);

  const handleVote = (e: Evento) => {
    if (loading || jaVotou) return;
    onVotar(e);
    setVoted(e.id);
    localStorage.setItem(VOTO_STORAGE_KEY, String(e.id));
  };

  return (
    <section className="px-12 py-[72px] max-md:px-5 max-md:py-14">
      <div className="mb-9">
        <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-blue mb-2">Não perca</p>
        <h2 className="font-heading text-[clamp(22px,2.8vw,32px)] font-black tracking-tight text-blue-dark mb-1.5">
          Próximo Evento
        </h2>
        <p className="text-[15px] text-muted-foreground">
          {jaVotou ? "Obrigado por votar! Veja como está a enquete." : "Escolha o próximo evento que você deseja."}
        </p>
      </div>

      <div className={`grid gap-9 items-center max-md:grid-cols-1 ${mostrarEnquete ? "grid-cols-2" : "grid-cols-1 max-w-md"}`}>
        {/* Enquete — somente se visível */}
        {mostrarEnquete && (
          <div>
            <div className="flex flex-col gap-2.5">
              {enqueteEventos.map((e) => {
                const selecionado = voted === e.id;
                const pct = totalVotos > 0 ? Math.round(((e.votos || 0) / totalVotos) * 100) : 0;
                return (
                  <div
                    key={e.id}
                    onClick={() => handleVote(e)}
                    className={`relative overflow-hidden flex items-center gap-3.5 bg-card border-[1.5px] rounded-xl p-3.5 px-[18px] transition-all duration-200 shadow-sm ${
                      jaVotou ? "cursor-default" : "cursor-pointer"
                    } ${
                      selecionado
                        ? "border-blue bg-blue-light"
                        : `border-border ${!jaVotou && "hover:border-blue/30 hover:bg-blue-light"}`
                    }`}
                  >
                    {/* Barra de resultado — só após votar */}
                    {jaVotou && (
                      <div
                        className="absolute inset-y-0 left-0 bg-blue/10 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <div
                      className={`relative w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selecionado ? "border-blue" : "border-border"
                      }`}
                    >
                      {selecionado && <div className="w-2 h-2 rounded-full bg-blue" />}
                    </div>
                    <div className="relative flex-1">
                      <p className="font-bold text-sm text-blue-dark">{e.nome || "..."}</p>
                      {e.categoria && (
                        <p className="text-xs text-muted-foreground">
                          {CATEGORIES[e.categoria]?.emoji} {CATEGORIES[e.categoria]?.label}
                        </p>
                      )}
                    </div>
                    {jaVotou && (
                      <span className="relative text-sm font-extrabold text-blue-dark flex-shrink-0">{pct}%</span>
                    )}
                  </div>
                );
              })}
            </div>

            {!loading && (
              <div className="flex items-center gap-2 mt-3.5 text-[13px] text-muted-foreground">
                <div className="flex">
                  {["🧑", "👩", "👨", "🧒"].map((a, i) => (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-full bg-blue-light border-2 border-card flex items-center justify-center text-xs -ml-2 first:ml-0"
                    >
                      {a}
                    </div>
                  ))}
                </div>
                {totalVotos} {totalVotos === 1 ? "voto" : "votos"}
              </div>
            )}
          </div>
        )}

        {/* Countdown */}
        <div className="bg-card border border-border rounded-lg p-9 shadow-md text-center">
          <span className="inline-flex items-center gap-[7px] text-[11px] font-extrabold tracking-[2px] uppercase text-blue mb-4">
            <span className="w-[7px] h-[7px] rounded-full bg-destructive animate-[pulse-dot_1.4s_ease_infinite]" />
            Começa em
          </span>
          <div className="font-heading text-[clamp(32px,5vw,52px)] font-black tracking-tighter text-blue-dark">
            {cd.h}:{cd.m}:{cd.s}
          </div>
          {proximo && <p className="mt-2.5 text-sm text-muted-foreground">{proximo.nome}</p>}
          <button
            onClick={() => proximo && onComprar(proximo)}
            className="inline-flex items-center gap-2 justify-center w-full mt-5 bg-blue text-primary-foreground px-[26px] py-[13px] rounded-xl font-extrabold text-sm transition-all duration-200 shadow-[0_4px_14px_hsla(220,82%,34%,0.22)] hover:bg-blue-dark hover:-translate-y-0.5"
          >
            Garantir meu ingresso 🎟️
          </button>
        </div>
      </div>
    </section>
  );
}
