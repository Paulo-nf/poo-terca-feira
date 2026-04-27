import { API_LOGIN, API_REGISTER } from "./constants";

export type Role = "ADMIN" | "USER";

export interface AuthUser {
  id: number | string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

/** Shape real que o backend Spring retorna */
interface BackendAuthResponse {
  token: string;
  name: string;
  role: string;
}

async function parseOrThrow(res: Response): Promise<BackendAuthResponse> {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/** Converte a resposta flat do backend para o formato AuthResponse usado na UI */
function toAuthResponse(email: string, raw: BackendAuthResponse): AuthResponse {
  return {
    token: raw.token,
    user: {
      id: 0, // backend não devolve id no login/register
      name: raw.name,
      email,
      role: (raw.role as Role) ?? "USER",
    },
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const raw = await parseOrThrow(res);
  return toAuthResponse(email, raw);
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(API_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const raw = await parseOrThrow(res);
  return toAuthResponse(email, raw);
}
