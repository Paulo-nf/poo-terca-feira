import { useState } from "react";
import { CATEGORIES, type CategoryKey, type Evento } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/event-utils";

interface AdminEventFormProps {
  mode: "criar" | "editar";
  evento?: Evento;
  onVoltar: () => void;
  onSalvar: (evento: Evento) => void;
  onCancelarEvento?: (evento: Evento) => void;
  onDuplicar?: (evento: Evento) => void;
}

type StatusKey = "ATIVO" | "CANCELADO";

const STATUS_META: Record<StatusKey, { label: string; dot: string; text: string }> = {
  ATIVO:     { label: "Ativo",     dot: "bg-emerald-500", text: "text-emerald-600" },
  CANCELADO: { label: "Cancelado", dot: "bg-rose-500",    text: "text-rose-600" },
};

const DEFAULT_EVENTO: Evento = {
  id: 0,
  nome: "",
  data: new Date().toISOString().slice(0, 10),
  categoria: "SHOW",
  descricao: "",
  ingressosDisponiveis: 1000,
  preco: 0,
  imagemUrl: null,
};

export function AdminEventForm({
  mode,
  evento,
  onVoltar,
  onSalvar,
  onCancelarEvento,
  onDuplicar,
}: AdminEventFormProps) {
  const base = evento ?? DEFAULT_EVENTO;
  const [form, setForm] = useState<Evento>(base);
  const [hora, setHora] = useState(evento ? "20:00" : "20:00");
  const [capacidade, setCapacidade] = useState<number>(base.ingressosDisponiveis || 1000);
  const [status] = useState<StatusKey>("ATIVO");

  const update = <K extends keyof Evento>(k: K, v: Evento[K]) => setForm((f) => ({ ...f, [k]: v }));

  const handleSalvar = () => {
    onSalvar({ ...form, ingressosDisponiveis: capacidade });
  };

  const meta = STATUS_META[status];
  const cat = CATEGORIES[form.categoria];
  const previewDate = form.data ? formatDate(form.data) : null;
  const titulo = mode === "criar" ? "Criar Evento" : "Editar Evento";

  return (
    <main className="max-w-[1180px] mx-auto px-12 py-8 max-md:px-5">
      {/* Breadcrumb */}
      <nav className="text-[13px] text-muted-foreground mb-4 flex items-center gap-1.5">
        <button onClick={onVoltar} className="hover:text-blue font-semibold flex items-center gap-1">
          ‹ Eventos
        </button>
        <span>/</span>
        <span className="text-foreground font-semibold">
          {mode === "criar" ? "Novo evento" : form.nome || "Evento"}
        </span>
      </nav>

      {/* Header */}
      <header className="flex items-start justify-between gap-4 mb-7 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-heading text-3xl font-black text-blue-dark tracking-tight">
            {titulo}
          </h1>
          {mode === "editar" && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              Status:
              <span className={`inline-flex items-center gap-1.5 font-bold ${meta.text}`}>
                {meta.label}
                <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
              </span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {mode === "editar" && (
            <button
              onClick={() => evento && onCancelarEvento?.(evento)}
              className="px-4 py-2 rounded-[10px] border border-border bg-card text-sm font-extrabold text-blue-dark hover:bg-blue-light/60 transition-colors flex items-center gap-2"
            >
              ⊘ Cancelar Evento
            </button>
          )}
          <button
            onClick={handleSalvar}
            className="px-4 py-2 rounded-[10px] bg-blue-dark text-primary-foreground text-sm font-extrabold hover:bg-blue transition-colors flex items-center gap-2"
          >
            💾 {mode === "criar" ? "Criar Evento" : "Salvar Alterações"}
          </button>
        </div>
      </header>

      {/* Grid principal */}
      <div className="grid grid-cols-[1fr_360px] gap-6 max-lg:grid-cols-1">
        {/* Form */}
        <section className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-5">
          <Field label="Nome do Evento">
            <input
              value={form.nome}
              onChange={(e) => update("nome", e.target.value)}
              placeholder="Ex.: Show de Rock"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field label="Data e Hora">
              <div className="flex gap-2.5">
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => update("data", e.target.value)}
                  className={`${inputCls} flex-1`}
                />
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className={`${inputCls} w-[110px]`}
                />
              </div>
            </Field>

            <Field label="Capacidade Total">
              <input
                type="number"
                min={1}
                value={capacidade}
                onChange={(e) => setCapacidade(parseInt(e.target.value || "0", 10))}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <Field label="Preço do Ingresso (R$)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.preco}
                onChange={(e) => update("preco", parseFloat(e.target.value || "0"))}
                className={inputCls}
              />
            </Field>

            <Field label="Categoria">
              <div className="relative">
                <select
                  value={form.categoria}
                  onChange={(e) => update("categoria", e.target.value as CategoryKey)}
                  className={`${inputCls} appearance-none pr-9`}
                >
                  {Object.entries(CATEGORIES).map(([k, c]) => (
                    <option key={k} value={k}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">▾</span>
              </div>
            </Field>
          </div>

          <Field label="Descrição do Evento">
            <textarea
              rows={4}
              value={form.descricao}
              onChange={(e) => update("descricao", e.target.value)}
              placeholder="Digite uma descrição do evento..."
              className={`${inputCls} min-h-[110px] resize-y`}
            />
          </Field>

          <Field label="Imagem do Evento">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="w-[180px] h-[110px] rounded-[10px] bg-gradient-to-br from-blue-light to-surface2 border border-border overflow-hidden flex items-center justify-center text-3xl">
                {form.imagemUrl ? (
                  <img src={form.imagemUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  cat.emoji
                )}
              </div>
              <button
                type="button"
                className="px-4 py-2 rounded-[10px] border border-border bg-card text-sm font-bold text-blue-dark hover:bg-blue-light/60 transition-colors flex items-center gap-2"
                onClick={() => {
                  const url = prompt("Cole a URL da imagem:", form.imagemUrl ?? "");
                  if (url !== null) update("imagemUrl", url || null);
                }}
              >
                📷 Enviar Imagem
              </button>
            </div>
          </Field>

          {mode === "editar" && (
            <button
              type="button"
              onClick={() => evento && onDuplicar?.(evento)}
              className="text-[13px] text-blue font-bold hover:underline flex items-center gap-1.5"
            >
              ⎘ Duplicar Evento
            </button>
          )}
        </section>

        {/* Preview */}
        <aside>
          <h3 className="font-heading text-base font-extrabold text-blue-dark mb-3">
            Pré-visualização
          </h3>
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="w-full aspect-video bg-gradient-to-br from-blue-light to-surface2 flex items-center justify-center text-5xl">
              {form.imagemUrl ? (
                <img src={form.imagemUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                cat.emoji
              )}
            </div>
            <div className="p-4">
              <h4 className="font-heading text-lg font-extrabold text-blue-dark leading-tight mb-2">
                {form.nome || "Nome do evento"}
              </h4>
              <div className="text-[13px] text-muted-foreground space-y-1.5">
                <div className="flex items-center gap-2">
                  📅 {previewDate ? `${previewDate.day} de ${monthNamePt(form.data)}, ${previewDate.year}` : "—"} · {hora}
                </div>
                <div className="flex items-center gap-2">
                  🎟️ Capacidade: {capacidade.toLocaleString("pt-BR")}
                  <span className={`inline-flex items-center gap-1.5 ml-auto text-[11px] font-bold px-2 py-0.5 rounded ${meta.text} bg-emerald-50`}>
                    {meta.label} <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  💰 {form.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </div>
              <button className="mt-4 w-full py-2 rounded-[10px] bg-surface2 text-blue-dark text-[13px] font-extrabold hover:bg-blue-light transition-colors flex items-center justify-center gap-2">
                🔗 Ver Página
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

const inputCls =
  "w-full h-10 px-3 rounded-[10px] bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue placeholder:text-muted-foreground/70";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-bold text-blue-dark mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function monthNamePt(iso: string) {
  const m = parseInt(iso.slice(5, 7), 10) - 1;
  return ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"][m] ?? "";
}
