export const API_BASE = "http://localhost:8080";
export const API_EVENTS = `${API_BASE}/events`;
export const API_LOGIN = `${API_BASE}/auth/login`;
export const API_REGISTER = `${API_BASE}/auth/register`;

export const CATEGORIES = {
  SHOW:     { label: "Show",     emoji: "🎤", color: "hsl(210, 72%, 42%)",  light: "hsl(210, 72%, 42%, 0.08)", border: "hsl(210, 72%, 42%, 0.2)" },
  ESPORTE:  { label: "Esporte",  emoji: "⚽", color: "hsl(215, 82%, 34%)",  light: "hsl(215, 82%, 34%, 0.08)", border: "hsl(215, 82%, 34%, 0.2)" },
  CULTURAL: { label: "Cultural", emoji: "🎨", color: "hsl(210, 68%, 46%)",  light: "hsl(210, 68%, 46%, 0.08)", border: "hsl(210, 68%, 46%, 0.2)" },
} as const;

export const MONTHS_PT = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

export const HOW_IT_WORKS_STEPS = [
  { icon: "🎯", title: "Selecione o Evento", desc: "Escolha um evento da lista e clique em comprar." },
  { icon: "💳", title: "Realize o Pagamento", desc: "Preencha os dados e finalize a compra com segurança." },
  { icon: "🎟️", title: "Receba Seu Ingresso", desc: "Os ingressos serão enviados para o seu e-mail." },
];

export type CategoryKey = keyof typeof CATEGORIES;

/** Modelo interno usado pela UI (em PT). */
export interface Evento {
  id: number;
  nome: string;
  data: string;             // ISO yyyy-mm-dd
  categoria: CategoryKey;
  descricao: string;
  ingressosDisponiveis: number;
  preco: number;
  imagemUrl: string | null;
}

/** Shape esperado vindo do back Spring Boot. */
export interface EventResponseDTO {
  id: number;
  name: string;
  description?: string | null;
  eventDate: string;        // ISO
  availableTickets: number;
  price: number;
  imageUrl?: string | null;
  category?: string | null; // se um dia o back passar a mandar
  status?: string | null;
}

export const FALLBACK_EVENTOS: Evento[] = [
  { id: 1, nome: "Show do João Gomes", data: "2026-06-24", categoria: "SHOW", descricao: "Gravação do novo DVD do João Gomes na Arena Pernambuco.", ingressosDisponiveis: 32500, preco: 120, imagemUrl: null },
  { id: 2, nome: "Sport x Náutico — Final Pernambucano", data: "2026-04-15", categoria: "ESPORTE", descricao: "Grande final do Campeonato Pernambucano na Arena.", ingressosDisponiveis: 0, preco: 80, imagemUrl: null },
  { id: 3, nome: "Exposição de Arte Armorial", data: "2026-07-05", categoria: "CULTURAL", descricao: "Exposição em homenagem a Ariano Suassuna.", ingressosDisponiveis: 4880, preco: 0, imagemUrl: null },
];
