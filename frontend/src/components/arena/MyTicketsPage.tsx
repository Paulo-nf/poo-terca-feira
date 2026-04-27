import { type IngressoComprado } from "@/lib/constants";
import { CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/event-utils";

interface MyTicketsPageProps {
  ingressos: IngressoComprado[];
  onVerEvento: (eventoId: number) => void;
}

export function MyTicketsPage({ ingressos, onVerEvento }: MyTicketsPageProps) {
  if (ingressos.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">
        <div className="text-[72px] mb-4">🎟️</div>
        <h2 className="font-heading text-2xl font-black text-blue-dark mb-2">Nenhum ingresso ainda</h2>
        <p className="text-muted-foreground text-sm max-w-xs">
          Quando você comprar ingressos, eles aparecerão aqui com seu código de confirmação.
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-[860px] mx-auto px-12 py-10 max-md:px-5">
      <div className="mb-8">
        <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-blue mb-1">Minha conta</p>
        <h1 className="font-heading text-3xl font-black text-blue-dark tracking-tight">Meus Ingressos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {ingressos.length} compra{ingressos.length > 1 ? "s" : ""} realizada{ingressos.length > 1 ? "s" : ""}.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {ingressos
          .slice()
          .sort((a, b) => new Date(b.dataCompra).getTime() - new Date(a.dataCompra).getTime())
          .map((ing) => (
            <TicketCard key={ing.id} ingresso={ing} onVerEvento={onVerEvento} />
          ))}
      </div>
    </main>
  );
}

function TicketCard({ ingresso, onVerEvento }: { ingresso: IngressoComprado; onVerEvento: (id: number) => void }) {
  const cat = CATEGORIES[ingresso.eventoCategoria] || CATEGORIES.CULTURAL;
  const { day, month, year } = formatDate(ingresso.eventoData);
  const dataCompra = new Date(ingresso.dataCompra);
  const hoje = new Date().toISOString().slice(0, 10);
  const passado = ingresso.eventoData < hoje;

  return (
    <div
      className={`bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col sm:flex-row transition-all ${
        passado ? "opacity-60" : "hover:border-blue/30 hover:shadow-md"
      }`}
    >
      {/* Faixa lateral colorida */}
      <div
        className="sm:w-2 w-full h-2 sm:h-auto flex-shrink-0 rounded-t-xl sm:rounded-l-xl sm:rounded-t-none"
        style={{ background: cat.color }}
      />

      {/* Imagem / Emoji */}
      <div
        className="sm:w-[120px] w-full h-[80px] sm:h-auto flex-shrink-0 flex items-center justify-center text-[44px] bg-gradient-to-br from-blue-light to-surface2"
      >
        {ingresso.imagemUrl ? (
          <img src={ingresso.imagemUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          cat.emoji
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-5 py-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase border"
              style={{ color: cat.color, background: cat.light, borderColor: cat.border }}
            >
              {cat.emoji} {cat.label}
            </span>
            {passado && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                Evento encerrado
              </span>
            )}
          </div>
          <h3 className="font-heading font-extrabold text-blue-dark text-base leading-tight mb-1 truncate">
            {ingresso.eventoNome}
          </h3>
          <p className="text-[12px] text-muted-foreground">
            {day} {month} {year} · Comprado em{" "}
            {dataCompra.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>

        {/* Detalhes + código */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Qtd.</p>
              <p className="font-heading font-black text-blue-dark text-base">{ingresso.quantidade}×</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="font-heading font-black text-blue-dark text-base">{formatPrice(ingresso.total)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[12px] font-extrabold text-blue bg-blue-light px-3 py-1 rounded-full border border-blue/20">
              {ingresso.codigoConfirmacao}
            </span>
            {!passado && (
              <button
                onClick={() => onVerEvento(ingresso.eventoId)}
                className="text-[12px] font-bold text-blue-dark hover:text-blue transition-colors px-3 py-1 rounded-lg border border-border hover:border-blue/30 hover:bg-blue-light"
              >
                Ver evento →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
