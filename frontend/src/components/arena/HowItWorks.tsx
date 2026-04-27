import { HOW_IT_WORKS_STEPS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <section className="px-12 py-[72px] max-md:px-5 max-md:py-14">
      <div className="bg-gradient-to-br from-blue-dark to-blue rounded-[20px] p-14 relative overflow-hidden max-md:p-8">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 36px)" }} />

        <div className="relative mb-9">
          <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-primary-foreground/55 mb-2">Simples assim</p>
          <h2 className="font-heading text-[clamp(22px,2.8vw,32px)] font-black tracking-tight text-primary-foreground mb-1.5">Como Funciona</h2>
          <p className="text-[15px] text-primary-foreground/65">Saiba mais sobre a compra de ingressos.</p>
        </div>

        <div className="relative grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-9">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-16 bg-primary-foreground/10 border border-primary-foreground/20 rounded-[18px] flex items-center justify-center text-[28px] mx-auto mb-[18px]">
                {step.icon}
              </div>
              <p className="text-[10px] font-extrabold tracking-[2px] text-primary-foreground/50 uppercase mb-2">Passo {i + 1}</p>
              <h3 className="font-heading text-base font-extrabold text-primary-foreground mb-2">{step.title}</h3>
              <p className="text-[13px] text-primary-foreground/65 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
