import { CATEGORIES, MONTHS_PT, type CategoryKey, type EventResponseDTO, type Evento } from "./constants";

export function formatDate(dateStr: string) {
    const iso = dateStr.length >= 10 ? dateStr.slice(0, 10) : dateStr;
    const [y, m, d] = iso.split("-");
    return { day: d, month: MONTHS_PT[+m - 1], year: y };
}

export function formatPrice(value: number) {
    if (!value || value <= 0) return "Gratuito";
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Status baseado apenas no que o back devolve (sem total). */
export function getTicketStatus(disponiveis: number) {
    const n = disponiveis ?? 0;
    if (n <= 0) return { label: "ESGOTADO", color: "hsl(0, 72%, 51%)", esgotado: true, scarce: false };
    if (n < 200) return { label: "Últimas unidades!", color: "hsl(27, 96%, 61%)", esgotado: false, scarce: true };
    return { label: `${n.toLocaleString("pt-BR")} disponíveis`, color: "hsl(210, 72%, 42%)", esgotado: false, scarce: false };
}

/** Heurística simples para inferir categoria a partir do que existe no back. */
function inferCategoria(dto: EventResponseDTO): CategoryKey {
    const raw = (dto.category || "").toUpperCase();
    if (raw in CATEGORIES) return raw as CategoryKey;

    const text = `${dto.name} ${dto.description ?? ""}`.toLowerCase();
    if (/\b(show|festival|banda|cantor|dvd|turn[eê]|música|musica)\b/.test(text)) return "SHOW";
    if (/\b(jogo|sport|n[aá]utico|santa|futebol|copa|campeonato|final|partida)\b/.test(text)) return "ESPORTE";
    if (/\b(exposi[cç][aã]o|arte|cultura|teatro|museu|feira)\b/.test(text)) return "CULTURAL";
    return "SHOW";
}

export function mapEvento(dto: any): Evento {
    return {
        id: dto.id,
        nome: dto.name,
        descricao: dto.description,
        imagemUrl: dto.imageUrl,
        preco: dto.price,
        ingressosDisponiveis: dto.availableTickets,
        data: dto.eventDate,
        categoria: inferCategoria(dto),
    };
}
