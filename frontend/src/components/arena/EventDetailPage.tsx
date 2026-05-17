import { useMemo, useState } from "react";
import { CATEGORIES, type Evento } from "@/lib/constants";
import { formatDate, formatPrice, formatTime, getTicketStatus } from "@/lib/event-utils";

interface EventDetailPageProps {
  evento: Evento;
  onVoltar: () => void;
  onComprar: (evento: Evento, quantidade: number) => void;
}

export function EventDetailPage({ evento, onVoltar, onComprar }: EventDetailPageProps) {
  const cat = CATEGORIES[evento.categoria] || CATEGORIES.CULTURAL;
  const { day, month, year } = formatDate(evento.data);
  const status = getTicketStatus(evento.ingressosDisponiveis);
  const isPast = evento.data.slice(0, 10) < new Date().toISOString().slice(0, 10);
  const [quantidade, setQuantidade] = useState(0);

  const max = Math.min(evento.ingressosDisponiveis, 10);

  const total = useMemo(() => evento.preco * quantidade, [evento.preco, quantidade]);

  const dec = () => setQuantidade((q) => Math.max(0, q - 1));
  const inc = () => setQuantidade((q) => Math.min(max, q + 1));

  return (
    <div className="min-h-[80vh]">
      {/* Header com título + imagem */}
      <div className="bg-surface2 px-12 py-10 max-md:px-5 max-md:py-6">
        <button
          onClick={onVoltar}
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-blue-dark hover:text-blue transition-colors"
        >
          ← Voltar para eventos
        </button>

        <div className="grid grid-cols-[1fr_minmax(280px,420px)] gap-8 items-start max-md:grid-cols-1">
          <div className="pt-2">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase border mb-4"
              style={{ color: cat.color, background: cat.light, borderColor: cat.border }}
            >
              {cat.emoji} {cat.label}
            </span>
            <h1 className="font-heading text-[34px] font-black tracking-tight text-blue-dark leading-tight mb-3 max-md:text-[26px]">
              {evento.nome}
            </h1>
            <p className="text-[14px] text-muted-foreground font-semibold">
              {day} {month.toLowerCase()} - {year} às {formatTime(evento.data)}
            </p>
          </div>

          <div className="rounded-[16px] overflow-hidden bg-muted aspect-[16/10] shadow-md">
            {evento.imagemUrl ? (
              <img
                src={evento.imagemUrl}
                alt={evento.nome}
                className="w-full h-full object-cover block"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-light to-surface2 flex items-center justify-center text-[88px]">
                {cat.emoji}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-card px-12 py-10 max-md:px-5 max-md:py-6">
        <div className="grid grid-cols-[1fr_minmax(280px,380px)] gap-10 max-md:grid-cols-1">
          {/* Coluna esquerda: descrição + política */}
          <div>
            <h2 className="font-heading text-[22px] font-extrabold text-blue-dark mb-4">
              Descrição do evento
            </h2>
            <div className="text-[14px] text-foreground/80 leading-relaxed whitespace-pre-line mb-10">
              {evento.descricao || "Sem descrição disponível para este evento."}
            </div>

          </div>

          {/* Coluna direita: seleção de ingresso */}
          <aside className="lg:sticky lg:top-6 self-start">
            <p className="text-[12.5px] font-bold tracking-wide uppercase text-muted-foreground mb-3">
              Escolha uma opção
            </p>

            <div className="bg-card border-[1.5px] border-border rounded-[14px] p-5 shadow-sm mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-heading text-[16px] font-extrabold text-blue-dark mb-1">
                    Ingresso Inteiro
                  </h3>
                  <p className="font-heading text-[18px] font-black text-blue-dark mb-2">
                    {formatPrice(evento.preco)}
                  </p>
                  {evento.preco > 0 && (
                    <span className="inline-block bg-blue-light text-blue-dark text-[11px] font-extrabold tracking-wide px-2.5 py-1 rounded-full">
                      em até 12x
                    </span>
                  )}
                  <p
                    className="text-[11.5px] font-semibold mt-2"
                    style={{ color: status.color }}
                  >
                    {status.label}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={dec}
                    disabled={quantidade === 0 || status.esgotado || isPast}
                    aria-label="Diminuir quantidade"
                    className="w-8 h-8 rounded-[8px] border-[1.5px] border-border bg-card text-blue-dark font-extrabold text-base flex items-center justify-center hover:border-blue hover:text-blue transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    −
                  </button>
                  <span className="font-heading text-[15px] font-extrabold text-blue-dark w-5 text-center">
                    {quantidade}
                  </span>
                  <button
                    onClick={inc}
                    disabled={quantidade >= max || status.esgotado || isPast}
                    aria-label="Aumentar quantidade"
                    className="w-8 h-8 rounded-[8px] border-[1.5px] border-blue bg-blue text-primary-foreground font-extrabold text-base flex items-center justify-center hover:bg-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-[13px] font-bold text-foreground">Total</span>
              <span className="font-heading text-[20px] font-black text-blue-dark">
                {total > 0 ? formatPrice(total) : "R$ 0,00"}
              </span>
            </div>

            <button
              disabled={quantidade === 0 || status.esgotado || isPast}
              onClick={() => onComprar(evento, quantidade)}
              className="w-full py-3 rounded-[12px] text-[14px] font-extrabold bg-blue text-primary-foreground tracking-wide hover:bg-blue-dark hover:scale-[1.01] transition-all duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isPast ? "Evento encerrado" : status.esgotado ? "Esgotado" : "Comprar ingressos"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
