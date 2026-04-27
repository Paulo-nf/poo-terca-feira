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

async function parseOrThrow(res: Response) {
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* ignore */ }
  if (!res.ok) {
    const msg = data?.message || data?.error || `Erro ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(API_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parseOrThrow(res);
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(API_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return parseOrThrow(res);
}
