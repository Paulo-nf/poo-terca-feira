import { apiFetch } from "../lib/api";

export const login = async (credentials) => {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  
  localStorage.setItem("token", data.token);
  localStorage.setItem("userRole", data.role);
  
  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  window.location.href = "/login";
};