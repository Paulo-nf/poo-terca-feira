import { useMemo, useState } from "react";
import { CATEGORIES, type Evento } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/event-utils";

interface AdminEventsPageProps {
  eventos: Evento[];
  onCriar: () => void;
  onEditar: (evento: Evento) => void;
  onExcluir: (evento: Evento) => void;
  // Enquete
  enqueteVisivel: boolean;
  enqueteIds: number[];
  onToggleEnquete: (visivel: boolean) => void;
  onSalvarEnquete: (ids: number[]) => void;
}

type StatusKey = "ATIVO" | "CANCELADO";

const STATUS_META: Record<StatusKey, { label: string; dot: string; text: string }> = {
  ATIVO:     { label: "Ativo",     dot: "bg-emerald-500", text: "text-emerald-600" },
  CANCELADO: { label: "Cancelado", dot: "bg-rose-500",    text: "text-rose-600" },
};

function inferStatus(e: Evento): StatusKey {
  if (e.ingressosDisponiveis <= 0) return "CANCELADO";
  return "ATIVO";
}

function capacidadeTotal(e: Evento) {
  const base = Math.max(e.ingressosDisponiveis, 100);
  if (base <= 200) return 200;
  if (base <= 600) return 600;
  if (base <= 1000) return 1000;
  return Math.ceil(base / 1000) * 1000;
}

export function AdminEventsPage({
  eventos,
  onCriar,
  onEditar,
  onExcluir,
  enqueteVisivel,
  enqueteIds,
  onToggleEnquete,
  onSalvarEnquete,
}: AdminEventsPageProps) {
  const [filtroStatus, setFiltroStatus] = useState<"TODOS" | StatusKey>("TODOS");
  const [filtroPeriodo, setFiltroPeriodo] = useState<"PROXIMOS" | "PASSADOS" | "TODOS">("PROXIMOS");
  const [busca, setBusca] = useState("");
  const [localEnqueteIds, setLocalEnqueteIds] = useState<number[]>(enqueteIds);
  const [enqueteSalva, setEnqueteSalva] = useState(false);

  const linhas = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return eventos
      .map((e) => {
        const status = inferStatus(e);
        if (status === "CANCELADO") return { e, status, total: 0, vendidos: 0 };
        const total = capacidadeTotal(e);
        const vendidos = Math.max(total - e.ingressosDisponiveis, 0);
        return { e, status, total, vendidos };
      })
      .filter(({ e }) => {
        if (filtroPeriodo === "PROXIMOS" && e.data < today) return false;
        if (filtroPeriodo === "PASSADOS" && e.data >= today) return false;
        return true;
      })
      .filter(({ status }) => filtroStatus === "TODOS" || status === filtroStatus)
      .filter(({ e }) => e.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [eventos, filtroStatus, filtroPeriodo, busca]);

  const totais = useMemo(() => {
    const ativos = eventos.filter((e) => inferStatus(e) === "ATIVO").length;
    let vendidos = 0;
    let receita = 0;
    eventos.forEach((e) => {
      if (inferStatus(e) === "CANCELADO") return;
      const total = capacidadeTotal(e);
      const v = Math.max(total - e.ingressosDisponiveis, 0);
      vendidos += v;
      receita += v * e.preco;
    });
    return { ativos, vendidos, receita };
  }, [eventos]);

  function toggleEnqueteItem(id: number) {
    setLocalEnqueteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setEnqueteSalva(false);
  }

  function handleSalvarEnquete() {
    onSalvarEnquete(localEnqueteIds);
    setEnqueteSalva(true);
    setTimeout(() => setEnqueteSalva(false), 2500);
  }

  return (
    <main className="max-w-[1180px] mx-auto px-12 py-10 max-md:px-5">
      {/* KPIs */}
      <section className="grid grid-cols-3 gap-4 mb-8 max-md:grid-cols-1">
        <KpiCard icon="📅" label="Eventos Ativos" value={totais.ativos.toString()} />
        <KpiCard icon="🎟️" label="Ingressos Vendidos" value={totais.vendidos.toLocaleString("pt-BR")} />
        <KpiCard icon="💰" label="Receita Total" value={totais.receita.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} />
      </section>

      {/* ─── PAINEL DE CONTROLE DA ENQUETE ─── */}
      <section className="bg-card border border-border rounded-lg shadow-sm px-6 py-5 mb-8">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <div>
            <h2 className="font-heading text-base font-extrabold text-blue-dark flex items-center gap-2">
              🗳️ Enquete — "Próximo Evento"
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Escolha quais eventos aparecem na votação da página inicial e se ela será exibida.
            </p>
          </div>

          {/* Toggle Exibir / Ocultar */}
          <div className="flex items-center gap-3">
            <span className={`text-sm font-semibold ${enqueteVisivel ? "text-blue-dark" : "text-muted-foreground"}`}>
              {enqueteVisivel ? "Visível para usuários" : "Oculta para usuários"}
            </span>
            <button
              onClick={() => onToggleEnquete(!enqueteVisivel)}
              aria-label="Alternar visibilidade da enquete"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue/30 ${
                enqueteVisivel ? "bg-blue" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  enqueteVisivel ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Seleção de eventos */}
        <div className={`transition-opacity duration-200 ${enqueteVisivel ? "opacity-100" : "opacity-40 pointer-events-none select-none"}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Selecione os eventos que irão à votação:
          </p>

          {eventos.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum evento cadastrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {eventos.map((e) => {
                const selecionado = localEnqueteIds.includes(e.id);
                const cat = CATEGORIES[e.categoria];
                return (
                  <label
                    key={e.id}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 select-none ${
                      selecionado
                        ? "border-blue bg-blue-light"
                        : "border-border bg-card hover:border-blue/30 hover:bg-blue-light/40"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                          selecionado ? "bg-blue border-blue" : "border-border bg-card"
                        }`}
                      >
                        {selecionado && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selecionado}
                      onChange={() => toggleEnqueteItem(e.id)}
                      className="sr-only"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-blue-dark truncate">{e.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {cat.emoji} {cat.label} · {e.data.slice(8, 10)}/{e.data.slice(5, 7)}/{e.data.slice(0, 4)}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {/* Rodapé */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border flex-wrap gap-3">
            <span className="text-xs text-muted-foreground">
              {localEnqueteIds.length === 0
                ? "Nenhum evento selecionado para votação."
                : `${localEnqueteIds.length} evento(s) selecionado(s) para a enquete.`}
            </span>
            <button
              onClick={handleSalvarEnquete}
              disabled={enqueteSalva}
              className={`px-4 py-2 rounded-[10px] text-sm font-extrabold transition-colors ${
                enqueteSalva
                  ? "bg-emerald-500 text-white cursor-default"
                  : "bg-blue-dark text-primary-foreground hover:bg-blue"
              }`}
            >
              {enqueteSalva ? "✓ Salvo!" : "Salvar enquete"}
            </button>
          </div>
        </div>
      </section>
      {/* ─── FIM PAINEL ENQUETE ─── */}

      {/* Header + filtros */}
      <header className="flex justify-between items-start gap-6 mb-7 flex-wrap">
        <div>
          <h1 className="font-heading text-3xl font-black text-blue-dark tracking-tight">
            Gestão de Eventos
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-md">
            Gerencie os eventos, edite detalhes e acompanhe as vendas.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Select
              value={filtroPeriodo}
              onChange={(v) => setFiltroPeriodo(v as typeof filtroPeriodo)}
              options={[
                { value: "PROXIMOS", label: "Próximos eventos" },
                { value: "PASSADOS", label: "Eventos passados" },
                { value: "TODOS", label: "Todos os períodos" },
              ]}
            />
            <Select
              value={filtroStatus}
              onChange={(v) => setFiltroStatus(v as typeof filtroStatus)}
              options={[
                { value: "TODOS", label: "Todos os status" },
                { value: "ATIVO", label: "Ativo" },
                { value: "CANCELADO", label: "Cancelado" },
              ]}
            />
            <button
              onClick={onCriar}
              className="px-4 py-2 rounded-[10px] bg-blue-dark text-primary-foreground text-sm font-extrabold hover:bg-blue transition-colors flex items-center gap-2"
            >
              Adicionar Evento <span className="text-[10px]">▾</span>
            </button>
          </div>
          <div className="relative">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar evento..."
              className="w-[280px] h-10 pl-9 pr-3 rounded-[10px] bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🔍</span>
          </div>
        </div>
      </header>

      {/* Tabela */}
      <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <h2 className="font-heading text-base font-extrabold text-blue-dark px-6 pt-5 pb-3">
          Eventos
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[12px] font-bold uppercase tracking-wide text-muted-foreground border-y border-border bg-surface2/60">
                <Th>Evento</Th>
                <Th>Data ▾</Th>
                <Th>Ingressos vendidos</Th>
                <Th>Status ▾</Th>
                <Th className="text-right">Ações ▾</Th>
              </tr>
            </thead>
            <tbody>
              {linhas.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Nenhum evento encontrado.
                  </td>
                </tr>
              )}
              {linhas.map(({ e, status, total, vendidos }, i) => {
                const cat = CATEGORIES[e.categoria];
                const { day, month, year } = formatDate(e.data);
                const meta = STATUS_META[status];
                const pct = total ? Math.min(100, Math.round((vendidos / total) * 100)) : 0;
                return (
                  <tr
                    key={e.id}
                    className={`border-b border-border last:border-b-0 hover:bg-blue-light/40 transition-colors ${
                      i % 2 === 1 ? "bg-surface2/30" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-extrabold text-blue-dark">{e.nome}</div>
                      <div className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <span style={{ color: cat.color }}>{cat.emoji}</span>
                        {`${day}/${monthNum(e.data)}/${year}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground/80 whitespace-nowrap">
                      {`${day}/${monthNum(e.data)}/${year}`}
                    </td>
                    <td className="px-6 py-4 min-w-[180px]">
                      <div className="text-foreground/80 mb-1.5">
                        {vendidos} / {total}
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-blue rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-2 font-bold ${meta.text}`}>
                        <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <ActionButton icon="✏️" label="Editar" onClick={() => onEditar(e)} />
                        <ActionButton icon="🗑" label="Excluir" onClick={() => onExcluir(e)} danger />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function monthNum(iso: string) {
  return iso.slice(5, 7);
}

function KpiCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm px-5 py-4 flex items-center gap-4">
      <div className="w-11 h-11 rounded-[10px] bg-blue-light flex items-center justify-center text-xl">
        {icon}
      </div>
      <div>
        <div className="text-[12px] uppercase tracking-wide text-muted-foreground font-bold">{label}</div>
        <div className="font-heading text-2xl font-black text-blue-dark leading-tight">{value}</div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-3 ${className}`}>{children}</th>;
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 pl-3 pr-8 rounded-[10px] bg-card border border-border text-sm font-semibold text-foreground/80 hover:border-blue/40 focus:outline-none focus:ring-2 focus:ring-blue/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground pointer-events-none">▾</span>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-[8px] border text-[12.5px] font-bold flex items-center gap-1.5 transition-colors ${
        danger
          ? "border-border text-rose-600 hover:bg-rose-50 hover:border-rose-200"
          : "border-border text-blue-dark hover:bg-blue-light hover:border-blue/30"
      }`}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
