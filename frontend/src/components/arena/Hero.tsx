export function Hero({ setPage }: { setPage: (page: string) => void }) {
  return (
    <section className="relative bg-gradient-to-br from-blue-dark via-blue to-blue-mid py-20 px-12 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.055]" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 44px)" }} />
      <div className="absolute bottom-[-2px] left-0 right-0 h-16 bg-background" style={{ clipPath: "ellipse(54% 100% at 50% 100%)" }} />

      <div className="relative z-10 max-w-[560px]">
        <span className="inline-flex items-center gap-2 bg-primary-foreground/15 border border-primary-foreground/25 rounded-full px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-primary-foreground/90 mb-5">
          🏟 Arena de Pernambuco
        </span>

        <h1 className="font-heading text-[clamp(34px,4.5vw,54px)] font-black leading-[1.08] tracking-tight text-primary-foreground mb-[18px]">
          Pronto para<br />
          Comprar<br />
          <em className="not-italic text-primary-foreground/60">Ingressos?</em>
        </h1>

        <p className="text-base font-light text-primary-foreground/75 max-w-[430px] leading-relaxed mb-9">
          Veja todos os ingressos disponíveis para o seu evento favorito na Arena Pernambuco.
        </p>

        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setPage("ajuda")} className="inline-flex items-center gap-2 bg-primary-foreground text-blue-dark px-[26px] py-[13px] rounded-xl font-extrabold text-sm transition-all duration-200 shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
            Seção de Ajuda
          </button>
          <button onClick={() => setPage("eventos")} className="inline-flex items-center gap-2 bg-primary-foreground/10 border-[1.5px] border-primary-foreground/30 text-primary-foreground px-[26px] py-[13px] rounded-xl font-bold text-sm transition-all duration-200 hover:bg-primary-foreground/20">
            Ver Eventos →
          </button>
        </div>
      </div>
    </section>
  );
}
