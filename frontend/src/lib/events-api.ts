import { API_EVENTS } from "./constants";

/**
 * Registra um voto na enquete "próximo evento" e devolve o total atualizado
 * de votos do evento. A votação é pública (não exige login).
 */
export async function votarEvento(id: number): Promise<number> {
  const res = await fetch(`${API_EVENTS}/${id}/vote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Não foi possível registrar seu voto.");
  }

  const data = await res.json();
  return data.votes as number;
}
