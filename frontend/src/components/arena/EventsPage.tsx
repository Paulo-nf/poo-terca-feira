import { useState } from "react";
import type { Evento, CategoryKey } from "@/lib/constants";
import { EventCard } from "@/components/arena/EventCard";
import { SkeletonCard } from "@/components/arena/SkeletonCard";

interface EventsPageProps {
  eventos: Evento[];
  loading: boolean;
  onComprar: (evento: Evento) => void;
}

export function EventsPage({ eventos, loading, onComprar }: EventsPageProps) {
  const [catFilter, setCatFilter] = useState<"TODAS" | CategoryKey>("TODAS");
  const [search, setSearch] = useState("");

  const filtered = eventos.filter((e) => {
    const matchCat = catFilter === "TODAS" || e.categoria === catFilter;
    const matchSearch = e.nome.toLowerCase().includes(search.toLowerCase()) || e.descricao?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="px-12 py-10 min-h-[80vh] max-md:px-5 max-md:py-6">
      <div className="bg-gradient-to-br from-blue-dark to-blue rounded-[20px] p-10 mb-9 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 36px)" }} />
        <h1 className="font-heading text-[30px] font-black tracking-tight text-primary-foreground mb-2 relative">Todos os eventos</h1>
        <p className="text-[15px] text-primary-foreground/70 max-w-[560px] leading-relaxed relative font-light">
          Quer viver experiências incríveis na Arena? Aqui você encontra shows, esportes, exposições e muito mais.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap mb-7">
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as "TODAS" | CategoryKey)}
          className="appearance-none bg-card border-[1.5px] border-border rounded-[10px] py-2 pl-3.5 pr-9 text-[13px] font-bold text-blue-dark cursor-pointer hover:border-blue focus:border-blue focus:outline-none transition-colors shadow-sm bg-no-repeat bg-[right_12px_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231040A0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")` }}
        >
          <option value="TODAS">Categoria ▾</option>
          <option value="SHOW">🎤 Show</option>
          <option value="ESPORTE">⚽ Esporte</option>
          <option value="CULTURAL">🎨 Cultural</option>
        </select>

        <select className="appearance-none bg-card border-[1.5px] border-border rounded-[10px] py-2 pl-3.5 pr-9 text-[13px] font-bold text-blue-dark cursor-pointer hover:border-blue focus:border-blue focus:outline-none transition-colors shadow-sm bg-no-repeat bg-[right_12px_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231040A0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")` }}
        >
          <option>Data ▾</option>
          <option>Este mês</option>
          <option>Próximos 3 meses</option>
        </select>

        <select className="appearance-none bg-card border-[1.5px] border-border rounded-[10px] py-2 pl-3.5 pr-9 text-[13px] font-bold text-blue-dark cursor-pointer hover:border-blue focus:border-blue focus:outline-none transition-colors shadow-sm bg-no-repeat bg-[right_12px_center]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231040A0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")` }}
        >
          <option>Preço ▾</option>
          <option>Gratuito</option>
          <option>Pago</option>
        </select>

        <div className="flex-1 min-w-[200px] relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">🔍</span>
          <input
            type="text"
            placeholder="Buscar evento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border-[1.5px] border-border rounded-[10px] py-2 pl-[38px] pr-3.5 text-[13px] text-foreground focus:outline-none focus:border-blue transition-colors shadow-sm placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[22px]">
          {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <div className="text-5xl mb-4">🔎</div>
          <h3 className="font-heading text-xl font-extrabold text-blue-dark mb-2">Nenhum evento encontrado</h3>
          <p>Tente ajustar os filtros ou a busca.</p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[22px]">
          {filtered.map((e, i) => (
            <EventCard key={e.id} evento={e} onComprar={onComprar} animationDelay={i * 0.06} />
          ))}
        </div>
      )}
    </div>
  );
}
