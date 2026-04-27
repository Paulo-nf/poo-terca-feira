import type { Evento } from "@/lib/constants";
import { Hero } from "@/components/arena/Hero";
import { EventCard } from "@/components/arena/EventCard";
import { SkeletonCard } from "@/components/arena/SkeletonCard";
import { HowItWorks } from "@/components/arena/HowItWorks";
import { NextEventSection } from "@/components/arena/NextEventSection";

interface HomePageProps {
  eventos: Evento[];
  loading: boolean;
  onComprar: (evento: Evento) => void;
  setPage: (page: string) => void;
}

export function HomePage({ eventos, loading, onComprar, setPage }: HomePageProps) {
  return (
    <>
      <Hero setPage={setPage} />

      <section className="px-12 py-[72px] max-md:px-5 max-md:py-14">
        <div className="mb-9">
          <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-blue mb-2">Em destaque</p>
          <h2 className="font-heading text-[clamp(22px,2.8vw,32px)] font-black tracking-tight text-blue-dark mb-1.5">Ingressos à Venda</h2>
          <p className="text-[15px] text-muted-foreground">Escolha seu evento e a quantidade de ingressos.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[22px]">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="font-heading text-xl font-extrabold text-blue-dark mb-2">Nenhum evento disponível</h3>
            <p>Verifique se a API está rodando em localhost:3030</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-[22px]">
              {eventos.slice(0, 3).map((e, i) => (
                <EventCard key={e.id} evento={e} onComprar={onComprar} animationDelay={i * 0.08} />
              ))}
            </div>
            {eventos.length > 3 && (
              <div className="text-center mt-8">
                <button onClick={() => setPage("eventos")} className="inline-flex items-center gap-2 bg-blue text-primary-foreground px-[26px] py-[13px] rounded-xl font-extrabold text-sm transition-all duration-200 shadow-[0_4px_14px_hsla(220,82%,34%,0.22)] hover:bg-blue-dark hover:-translate-y-0.5">
                  Ver todos os eventos →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <HowItWorks />
      <NextEventSection eventos={eventos} loading={loading} onComprar={onComprar} />
    </>
  );
}
