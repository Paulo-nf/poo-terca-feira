import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchMyTickets, type TicketDTO } from "@/lib/tickets-api";
import { formatDate, formatPrice, formatTime } from "@/lib/event-utils";

interface MyTicketsPageProps {
  onVerEvento?: (eventoId: number) => void;
}

export function MyTicketsPage({ onVerEvento }: MyTicketsPageProps) {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<TicketDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchMyTickets(token)
      .then(setTickets)
      .catch((e: Error) => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <LoadingState />;
  if (erro) return <ErrorState message={erro} />;

  const now = new Date();
  const futuros = tickets
    .filter((t) => new Date(t.eventDate) > now)
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const passados = tickets
    .filter((t) => new Date(t.eventDate) <= now)
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  return (
    <div className="min-h-[80vh] px-12 py-10 max-md:px-5">
      <h1 className="font-heading text-[28px] font-black text-blue-dark mb-1">Meus ingressos</h1>
      <p className="text-[13.5px] text-muted-foreground mb-10">
        {tickets.length === 0
          ? "Você ainda não comprou nenhum ingresso."
          : `${tickets.length} ingresso(s) no total`}
      </p>

      {tickets.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎟️</div>
          <p className="font-heading text-[17px] font-extrabold text-blue-dark mb-2">
            Nenhum ingresso ainda
          </p>
          <p className="text-[13.5px] text-muted-foreground">
            Explore os eventos disponíveis e garanta o seu lugar!
          </p>
        </div>
      )}

      {futuros.length > 0 && (
        <TicketSection
          title="Próximos eventos"
          tickets={futuros}
          future
          onVerEvento={onVerEvento}
        />
      )}

      {passados.length > 0 && (
        <TicketSection
          title="Eventos passados"
          tickets={passados}
          future={false}
          onVerEvento={onVerEvento}
        />
      )}
    </div>
  );
}

function TicketSection({
  title,
  tickets,
  future,
  onVerEvento,
}: {
  title: string;
  tickets: TicketDTO[];
  future: boolean;
  onVerEvento?: (id: number) => void;
}) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="font-heading text-[15px] font-extrabold text-blue-dark uppercase tracking-wide">
          {title}
        </h2>
        <span className="text-[11px] font-extrabold bg-surface2 text-muted-foreground px-2 py-0.5 rounded-full">
          {tickets.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            future={future}
            onVerEvento={onVerEvento}
          />
        ))}
      </div>
    </div>
  );
}

function TicketCard({
  ticket,
  future,
  onVerEvento,
}: {
  ticket: TicketDTO;
  future: boolean;
  onVerEvento?: (id: number) => void;
}) {
  const { day, month, year } = formatDate(ticket.eventDate);
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-card border rounded-[16px] p-5 shadow-sm flex flex-col gap-4 transition-opacity ${
        future ? "border-blue/20" : "border-border opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-heading text-[15px] font-extrabold text-blue-dark leading-snug truncate">
            {ticket.eventName}
          </p>
          <p className="text-[12px] text-muted-foreground mt-0.5 truncate">
            {ticket.eventLocation}
          </p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-1 rounded-full ${
            future
              ? "bg-blue-light text-blue-dark"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {future ? "Confirmado" : "Passado"}
        </span>
      </div>

      {/* Date badge */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-[10px] bg-surface2 shrink-0">
          <span className="font-heading text-[18px] font-black text-blue-dark leading-none">
            {day}
          </span>
          <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wide">
            {month}
          </span>
        </div>
        <div className="text-[12.5px] text-muted-foreground">
          <p className="font-semibold">{year}</p>
          <p>às {formatTime(ticket.eventDate)}</p>
        </div>
      </div>

      {/* Ticket count + total */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="text-[12.5px] text-muted-foreground">
          {ticket.quantity} ingresso(s)
        </span>
        <span className="font-heading text-[16px] font-black text-blue-dark">
          {ticket.totalPrice === 0 ? "Gratuito" : formatPrice(ticket.totalPrice)}
        </span>
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-[11.5px] font-bold text-blue hover:text-blue-dark transition-colors text-left"
      >
        {expanded ? "Ocultar detalhes ▲" : "Ver detalhes ▼"}
      </button>

      {expanded && (
        <div className="border-t border-border pt-3 space-y-1.5 text-[12px]">
          <DetailRow label="Comprador" value={ticket.buyerName} />
          <DetailRow label="E-mail" value={ticket.buyerEmail} />
          <DetailRow label="Pedido nº" value={String(ticket.id)} />
          <DetailRow
            label="Comprado em"
            value={formatDate(ticket.purchaseDate).day + " " +
              formatDate(ticket.purchaseDate).month + " " +
              formatDate(ticket.purchaseDate).year}
          />
          <DetailRow label="Status" value={future ? "Confirmado" : "Passado"} />
          <QRCodePlaceholder ticketId={ticket.id} eventName={ticket.eventName} />
        </div>
      )}

      {onVerEvento && future && (
        <button
          onClick={() => onVerEvento(ticket.eventId)}
          className="text-[12px] font-extrabold text-center py-2 rounded-[10px] border border-blue/30 text-blue hover:bg-blue-light transition-colors"
        >
          Ver evento
        </button>
      )}
    </div>
  );
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function QRCodePlaceholder({ ticketId, eventName }: { ticketId: number; eventName: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const SIZE = 21;
  const CELL = 7;
  const PAD = 6;
  const dim = SIZE * CELL + PAD * 2;

  function finderCell(dr: number, dc: number): boolean | null {
    if (dr < 0 || dr >= 7 || dc < 0 || dc >= 7) return null;
    if (dr === 0 || dr === 6 || dc === 0 || dc === 6) return true;
    if (dr === 1 || dr === 5 || dc === 1 || dc === 5) return false;
    return true;
  }

  const rand = seededRandom(ticketId);
  const cells = Array.from({ length: SIZE * SIZE }, (_, i) => {
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const x = PAD + c * CELL;
    const y = PAD + r * CELL;

    const tl = finderCell(r, c);
    if (tl !== null) return tl ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;
    const tr = finderCell(r, c - (SIZE - 7));
    if (tr !== null) return tr ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;
    const bl = finderCell(r - (SIZE - 7), c);
    if (bl !== null) return bl ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;

    if ((r <= 7 && c <= 7) || (r <= 7 && c >= SIZE - 8) || (r >= SIZE - 8 && c <= 7)) return null;

    if (r === 6 && c >= 8 && c <= SIZE - 9) return c % 2 === 0 ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;
    if (c === 6 && r >= 8 && r <= SIZE - 9) return r % 2 === 0 ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;

    return rand() > 0.45 ? <rect key={i} x={x} y={y} width={CELL} height={CELL} fill="#1a2a4a" /> : null;
  });

  function handleDownload() {
    const svg = svgRef.current;
    if (!svg) return;
    const svgStr = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ingresso-${eventName.replace(/\s+/g, "-").toLowerCase()}-${ticketId}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-center gap-2.5 pt-3 border-t border-border mt-1.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground self-start">
        QR Code
      </p>
      <div className="bg-white rounded-[8px] p-1.5 border border-border shadow-sm">
        <svg
          ref={svgRef}
          width={dim}
          height={dim}
          viewBox={`0 0 ${dim} ${dim}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={dim} height={dim} fill="white" />
          {cells}
        </svg>
      </div>
      <button
        onClick={handleDownload}
        className="text-[11.5px] font-bold text-blue hover:text-blue-dark transition-colors flex items-center gap-1.5 self-start"
      >
        ⬇ Baixar QR Code
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-blue-dark text-right truncate max-w-[60%]">{value}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-[80vh] px-12 py-10 max-md:px-5">
      <div className="h-8 w-48 bg-muted rounded-lg animate-pulse mb-2" />
      <div className="h-4 w-32 bg-muted rounded-lg animate-pulse mb-10" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-[16px] h-52 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-5">
      <div>
        <div className="text-4xl mb-4">⚠️</div>
        <p className="font-heading text-[17px] font-extrabold text-blue-dark mb-2">
          Não foi possível carregar
        </p>
        <p className="text-[13.5px] text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
