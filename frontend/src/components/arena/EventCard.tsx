import { CATEGORIES, type Evento } from "@/lib/constants";
import { formatDate, formatPrice, getTicketStatus } from "@/lib/event-utils";

interface EventCardProps {
  evento: Evento;
  onComprar: (evento: Evento) => void;
  onSelect?: (evento: Evento) => void;
  animationDelay?: number;
}

export function EventCard({ evento, onComprar, onSelect, animationDelay = 0 }: EventCardProps) {
  const cat = CATEGORIES[evento.categoria] || CATEGORIES.CULTURAL;
  const { day, month } = formatDate(evento.data);
  const status = getTicketStatus(evento.ingressosDisponiveis);

  return (
    <div
      onClick={() => onSelect?.(evento)}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={(e) => {
        if (onSelect && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(evento);
        }
      }}
      className="bg-card border border-border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-blue/20"
      style={{ animation: `fade-up 0.5s ${animationDelay}s ease both` }}
    >
      {evento.imagemUrl ? (
        <img
          src={evento.imagemUrl}
          alt={evento.nome}
          className="w-full aspect-video object-cover block bg-surface2"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-blue-light to-surface2 flex items-center justify-center text-[52px]">
          {cat.emoji}
        </div>
      )}

      <div className="p-5 pt-[18px]">
        <div className="flex justify-between items-start mb-2.5">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase border"
            style={{ color: cat.color, background: cat.light, borderColor: cat.border }}
          >
            {cat.emoji} {cat.label}
          </span>
          <div className="text-center bg-blue-light rounded-[10px] py-1.5 px-2.5 min-w-[46px]">
            <div className="font-heading text-[19px] font-black leading-none text-blue-dark">{day}</div>
            <div className="text-[10px] font-extrabold tracking-wider text-blue">{month}</div>
          </div>
        </div>

        <h3 className="font-heading text-base font-extrabold tracking-tight mb-1.5 leading-tight text-blue-dark">
          {evento.nome}
        </h3>
        <p className="text-[13px] text-muted-foreground mb-4 leading-relaxed line-clamp-2">
          {evento.descricao}
        </p>

        <div className="flex items-center justify-between pt-3.5 border-t border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] text-muted-foreground font-bold tracking-wide uppercase">Ingressos</span>
            <span className="text-[13px] font-bold" style={{ color: status.color }}>{status.label}</span>
            <span className="text-[12px] text-muted-foreground font-semibold mt-0.5">{formatPrice(evento.preco)}</span>
          </div>
          <button
            disabled={status.esgotado}
            onClick={(e) => { e.stopPropagation(); onComprar(evento); }}
            className="px-[18px] py-2 rounded-[10px] text-[13px] font-extrabold bg-blue text-primary-foreground transition-all duration-200 tracking-wide hover:bg-blue-dark hover:scale-[1.04] disabled:bg-surface2 disabled:text-muted-foreground disabled:cursor-not-allowed disabled:transform-none"
          >
            {status.esgotado ? "Esgotado" : "Comprar"}
          </button>
        </div>
      </div>
    </div>
  );
}
