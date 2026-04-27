import { useState } from "react";
import { type Evento, type IngressoComprado, gerarCodigoConfirmacao } from "@/lib/constants";
import { formatPrice, formatDate } from "@/lib/event-utils";

interface PurchaseModalProps {
  evento: Evento;
  quantidade: number;
  onClose: () => void;
  onSuccess: (ingresso: IngressoComprado) => void;
}

type Step = "pagamento" | "processando" | "confirmado";

const CARD_BRANDS = [
  { value: "visa", label: "Visa" },
  { value: "mastercard", label: "Mastercard" },
  { value: "elo", label: "Elo" },
  { value: "pix", label: "PIX" },
];

function maskCard(v: string) {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function maskExpiry(v: string) {
  return v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
}

export function PurchaseModal({ evento, quantidade, onClose, onSuccess }: PurchaseModalProps) {
  const [step, setStep] = useState<Step>("pagamento");
  const [brand, setBrand] = useState("visa");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [nome, setNome] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ingresso, setIngresso] = useState<IngressoComprado | null>(null);

  const total = evento.preco * quantidade;
  const isPix = brand === "pix";
  const { day, month, year } = formatDate(evento.data);

  const validate = (): boolean => {
    if (isPix) return true;
    if (!nome.trim()) { setError("Informe o nome do titular."); return false; }
    if (card.replace(/\s/g, "").length < 16) { setError("Número do cartão inválido."); return false; }
    if (expiry.length < 5) { setError("Data de validade inválida."); return false; }
    if (cvv.length < 3) { setError("CVV inválido."); return false; }
    return true;
  };

  const handleConfirmar = async () => {
    setError(null);
    if (!validate()) return;

    setStep("processando");

    // Simula delay de processamento
    await new Promise((r) => setTimeout(r, 2200));

    const novoIngresso: IngressoComprado = {
      id: crypto.randomUUID(),
      eventoId: evento.id,
      eventoNome: evento.nome,
      eventoData: evento.data,
      eventoCategoria: evento.categoria,
      quantidade,
      preco: evento.preco,
      total,
      dataCompra: new Date().toISOString(),
      codigoConfirmacao: gerarCodigoConfirmacao(),
      imagemUrl: evento.imagemUrl,
    };

    setIngresso(novoIngresso);
    setStep("confirmado");
    onSuccess(novoIngresso);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={step !== "processando" ? onClose : undefined}
    >
      <div
        className="bg-card w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden animate-[fade-up_0.25s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-blue-dark px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold tracking-[2px] uppercase text-blue-light/70 mb-0.5">
              {step === "confirmado" ? "Pedido confirmado" : "Finalizar compra"}
            </p>
            <h2 className="font-heading text-lg font-black text-primary-foreground leading-tight">
              {evento.nome}
            </h2>
          </div>
          {step !== "processando" && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Resumo */}
        {step !== "confirmado" && (
          <div className="px-6 py-3 bg-surface2 border-b border-border flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {quantidade}× {formatPrice(evento.preco)} · {day} {month} {year}
            </span>
            <span className="font-heading font-black text-blue-dark text-lg">{formatPrice(total)}</span>
          </div>
        )}

        <div className="px-6 py-5">
          {/* STEP: PAGAMENTO */}
          {step === "pagamento" && (
            <>
              {/* Seleção de método */}
              <p className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark mb-2.5">
                Forma de pagamento
              </p>
              <div className="flex gap-2 mb-5 flex-wrap">
                {CARD_BRANDS.map((b) => (
                  <button
                    key={b.value}
                    onClick={() => { setBrand(b.value); setError(null); }}
                    className={`px-3.5 py-1.5 rounded-[8px] border text-[12px] font-extrabold transition-colors ${
                      brand === b.value
                        ? "border-blue bg-blue-light text-blue-dark"
                        : "border-border text-muted-foreground hover:border-blue/30"
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>

              {isPix ? (
                <div className="text-center py-6 px-4 bg-surface2 rounded-xl border border-border">
                  <div className="text-5xl mb-3">📱</div>
                  <p className="font-bold text-blue-dark text-sm mb-1">Pague via PIX</p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Ao confirmar, o código PIX será gerado e a compra processada automaticamente.
                  </p>
                  <div className="font-heading text-2xl font-black text-blue-dark">{formatPrice(total)}</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Nome no cartão</span>
                    <input
                      value={nome}
                      onChange={(e) => setNome(e.target.value.toUpperCase())}
                      placeholder="NOME SOBRENOME"
                      className="h-10 px-3 rounded-[10px] bg-surface2 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Número do cartão</span>
                    <input
                      value={card}
                      onChange={(e) => setCard(maskCard(e.target.value))}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      className="h-10 px-3 rounded-[10px] bg-surface2 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">Validade</span>
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(maskExpiry(e.target.value))}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="h-10 px-3 rounded-[10px] bg-surface2 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
                      />
                    </label>
                    <label className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-extrabold tracking-wide uppercase text-blue-dark">CVV</span>
                      <input
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        className="h-10 px-3 rounded-[10px] bg-surface2 border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue/30 focus:border-blue"
                      />
                    </label>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-3 text-[13px] text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
                🔒 Pagamento seguro e criptografado
              </p>

              <button
                onClick={handleConfirmar}
                className="mt-4 w-full py-3 rounded-xl bg-blue text-primary-foreground font-extrabold text-sm hover:bg-blue-dark transition-colors"
              >
                Confirmar pagamento · {formatPrice(total)}
              </button>
            </>
          )}

          {/* STEP: PROCESSANDO */}
          {step === "processando" && (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full border-4 border-blue border-t-transparent animate-spin" />
              <p className="font-bold text-blue-dark">Processando pagamento...</p>
              <p className="text-sm text-muted-foreground">Não feche esta janela.</p>
            </div>
          )}

          {/* STEP: CONFIRMADO */}
          {step === "confirmado" && ingresso && (
            <div className="py-2 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl animate-[fade-up_0.4s_ease]">
                ✅
              </div>
              <div>
                <p className="font-heading text-xl font-black text-blue-dark">Compra realizada!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Seus ingressos estão disponíveis em <strong>Meus ingressos</strong>.
                </p>
              </div>

              <div className="w-full bg-surface2 border border-border rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Código:</span>
                  <span className="font-mono font-extrabold text-blue-dark">{ingresso.codigoConfirmacao}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantidade:</span>
                  <span className="font-bold text-blue-dark">{ingresso.quantidade} ingresso(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total pago:</span>
                  <span className="font-bold text-blue-dark">{formatPrice(ingresso.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evento:</span>
                  <span className="font-bold text-blue-dark">{day} {month} {year}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-blue-dark text-primary-foreground font-extrabold text-sm hover:bg-blue transition-colors"
              >
                Ver meus ingressos
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
